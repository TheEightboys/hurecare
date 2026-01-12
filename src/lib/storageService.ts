/**
 * Supabase Storage Service for HURE Care
 * 
 * Handles file uploads to Supabase Storage buckets with proper
 * tracking, audit logging, and TTL management.
 * 
 * Storage Buckets:
 * - avatars: User profile pictures
 * - audio-recordings: Clinical note audio (with TTL)
 * - documents: Clinical documents, ID copies, lab results
 * 
 * NOTE: After running the migration, regenerate types with:
 * npx supabase gen types typescript --project-id pqhjoanobeuyowuxiewc > src/integrations/supabase/types.ts
 */

import { supabase } from '@/integrations/supabase/client';

// Storage bucket names
export const STORAGE_BUCKETS = {
    AVATARS: 'avatars',
    AUDIO_RECORDINGS: 'audio-recordings',
    DOCUMENTS: 'documents',
} as const;

// Document types for categorization
export type DocumentType = 'id_copy' | 'lab_result' | 'prescription' | 'referral' | 'consent_form' | 'other';
export type EntityType = 'patient' | 'clinical_note' | 'claim' | 'intake_form';

// Audio recording TTL (7 days by default - adjust as needed)
const AUDIO_TTL_DAYS = 7;

/**
 * Upload avatar image for a user
 */
export async function uploadAvatar(
    userId: string,
    file: File
): Promise<{ url: string; path: string } | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.AVATARS)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKETS.AVATARS)
            .getPublicUrl(data.path);

        // Update profile with avatar URL
        await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('user_id', userId);

        // Audit log
        await logStorageAction('AVATAR_UPLOADED', {
            userId,
            path: data.path,
            size: file.size,
        });

        return { url: publicUrl, path: data.path };
    } catch (err) {
        console.error('Failed to upload avatar:', err);
        return null;
    }
}

/**
 * Upload audio recording for a clinical note
 * Includes TTL tracking for automatic cleanup
 * 
 * NOTE: Requires audio_recordings table from migration
 */
export async function uploadAudioRecording(
    clinicalNoteId: string | null,
    file: Blob,
    durationSeconds: number
): Promise<{ path: string; recordingId: string } | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileName = `${user.id}/${Date.now()}.webm`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.AUDIO_RECORDINGS)
            .upload(fileName, file, {
                contentType: 'audio/webm',
                cacheControl: '3600',
            });

        if (error) throw error;

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + AUDIO_TTL_DAYS);

        // Create tracking record (uses 'any' cast until types are regenerated)
        const { data: recording, error: dbError } = await (supabase
            .from('audio_recordings' as any)
            .insert({
                clinical_note_id: clinicalNoteId,
                storage_path: data.path,
                duration_seconds: durationSeconds,
                file_size_bytes: file.size,
                uploaded_by: user.id,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single() as any);

        if (dbError) throw dbError;

        // Audit log
        await logStorageAction('AUDIO_UPLOADED', {
            recordingId: recording?.id,
            clinicalNoteId,
            path: data.path,
            durationSeconds,
            expiresAt: expiresAt.toISOString(),
        });

        return { path: data.path, recordingId: recording?.id || '' };
    } catch (err) {
        console.error('Failed to upload audio:', err);
        return null;
    }
}

/**
 * Upload a document and track it
 * 
 * NOTE: Requires documents table from migration
 */
export async function uploadDocument(
    entityType: EntityType,
    entityId: string,
    documentType: DocumentType,
    file: File
): Promise<{ path: string; documentId: string } | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileName = `${entityType}/${entityId}/${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.DOCUMENTS)
            .upload(fileName, file, {
                cacheControl: '3600',
            });

        if (error) throw error;

        // Create tracking record (uses 'any' cast until types are regenerated)
        const { data: document, error: dbError } = await (supabase
            .from('documents' as any)
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                document_type: documentType,
                file_name: file.name,
                storage_path: data.path,
                file_size_bytes: file.size,
                mime_type: file.type,
                uploaded_by: user.id,
            })
            .select()
            .single() as any);

        if (dbError) throw dbError;

        // Audit log
        await logStorageAction('DOCUMENT_UPLOADED', {
            documentId: document?.id,
            entityType,
            entityId,
            documentType,
            fileName: file.name,
            path: data.path,
        });

        return { path: data.path, documentId: document?.id || '' };
    } catch (err) {
        console.error('Failed to upload document:', err);
        return null;
    }
}

/**
 * Get signed URL for a document (for viewing)
 */
export async function getDocumentUrl(
    storagePath: string,
    bucket: keyof typeof STORAGE_BUCKETS = 'DOCUMENTS'
): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS[bucket])
            .createSignedUrl(storagePath, 3600); // 1 hour expiry

        if (error) throw error;
        return data.signedUrl;
    } catch (err) {
        console.error('Failed to get document URL:', err);
        return null;
    }
}

/**
 * Delete an audio recording (soft delete)
 */
export async function deleteAudioRecording(recordingId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('audio_recordings' as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', recordingId) as any);

        if (error) throw error;

        await logStorageAction('AUDIO_DELETED', { recordingId });
        return true;
    } catch (err) {
        console.error('Failed to delete audio:', err);
        return false;
    }
}

/**
 * Delete a document (soft delete)
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('documents' as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', documentId) as any);

        if (error) throw error;

        await logStorageAction('DOCUMENT_DELETED', { documentId });
        return true;
    } catch (err) {
        console.error('Failed to delete document:', err);
        return false;
    }
}

/**
 * Get documents for an entity
 */
export async function getDocumentsForEntity(
    entityType: EntityType,
    entityId: string
): Promise<any[]> {
    try {
        const { data, error } = await (supabase
            .from('documents' as any)
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }) as any);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Failed to get documents:', err);
        return [];
    }
}

/**
 * Helper to log storage actions for audit
 */
async function logStorageAction(action: string, details: Record<string, any>) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
            user_id: user?.id,
            action,
            entity_type: 'storage',
            details: {
                ...details,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (err) {
        console.error('Failed to log storage action:', err);
    }
}

/**
 * Upload user signature image
 */
export async function uploadSignature(
    userId: string,
    signatureBlob: Blob
): Promise<string | null> {
    try {
        const fileName = `${userId}/signature.png`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKETS.AVATARS) // Store in avatars bucket for simplicity
            .upload(fileName, signatureBlob, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKETS.AVATARS)
            .getPublicUrl(data.path);

        // Update profile (signature_url requires migration to be applied)
        await (supabase
            .from('profiles')
            .update({ signature_url: publicUrl } as any)
            .eq('user_id', userId) as any);

        await logStorageAction('SIGNATURE_UPLOADED', { userId, path: data.path });

        return publicUrl;
    } catch (err) {
        console.error('Failed to upload signature:', err);
        return null;
    }
}

/**
 * Get user profile with extended fields
 */
export async function getUserProfile(userId: string): Promise<any> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, avatar_url, role, specialty, license_number, facility_name, facility_address, bio, account_status')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Failed to get user profile:', err);
        return null;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        full_name?: string;
        phone?: string;
        specialty?: string;
        license_number?: string;
        facility_name?: string;
        facility_address?: string;
        bio?: string;
    }
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update(updates as any)
            .eq('user_id', userId);

        if (error) throw error;

        await logStorageAction('PROFILE_UPDATED', { userId, fields: Object.keys(updates) });
        return true;
    } catch (err) {
        console.error('Failed to update user profile:', err);
        return false;
    }
}
