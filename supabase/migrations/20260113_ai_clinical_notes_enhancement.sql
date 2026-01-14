-- =====================================================
-- HURE CARE - AI Clinical Notes Enhancement Migration
-- AI + Workflow + Billing/Insurance Readiness
-- Generated: January 13, 2026
-- =====================================================

-- =====================================================
-- 1. Enhance clinical_notes table for AI-assisted features
-- =====================================================

-- Add new columns for AI transcription workflow
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'TEXT' CHECK (source_type IN ('AUDIO', 'TEXT')),
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS transcript_reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transcript_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS transcript_reviewed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS single_note TEXT,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS audio_temp_url TEXT,
ADD COLUMN IF NOT EXISTS audio_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legal_acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS legal_acknowledged_at TIMESTAMPTZ;

-- Create index for transcript reviewed status
CREATE INDEX IF NOT EXISTS idx_clinical_notes_transcript_reviewed ON public.clinical_notes(transcript_reviewed);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_source_type ON public.clinical_notes(source_type);

-- =====================================================
-- 2. Clinical note snapshots table for immutability
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clinical_note_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_note_id UUID NOT NULL REFERENCES public.clinical_notes(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    snapshot_type TEXT DEFAULT 'SIGNED' CHECK (snapshot_type IN ('SIGNED', 'AMENDED', 'AUDIT')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_snapshots_note_id ON public.clinical_note_snapshots(clinical_note_id);
CREATE INDEX IF NOT EXISTS idx_note_snapshots_type ON public.clinical_note_snapshots(snapshot_type);

-- Enable RLS
ALTER TABLE public.clinical_note_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view note snapshots" ON public.clinical_note_snapshots
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create note snapshots" ON public.clinical_note_snapshots
    FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- 3. AI suggestions history table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_suggestions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_note_id UUID REFERENCES public.clinical_notes(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('SOAP', 'ICD10', 'CLARITY', 'PARSE')),
    input_text TEXT,
    output_data JSONB,
    model_used TEXT,
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_note ON public.ai_suggestions_log(clinical_note_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions_log(suggestion_type);

-- Enable RLS
ALTER TABLE public.ai_suggestions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ai suggestions" ON public.ai_suggestions_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create ai suggestions" ON public.ai_suggestions_log
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ai suggestions" ON public.ai_suggestions_log
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 4. Incomplete notes tracking table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incomplete_notes_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    clinical_note_id UUID REFERENCES public.clinical_notes(id),
    status TEXT NOT NULL CHECK (status IN ('NO_NOTE', 'DRAFT', 'PENDING_REVIEW')),
    aging_bucket TEXT CHECK (aging_bucket IN ('0-24h', '24-48h', '48-72h', '72h+')),
    hours_old INTEGER DEFAULT 0,
    reminder_shown_at TIMESTAMPTZ,
    reminder_dismissed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    visible_to_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incomplete_notes_provider ON public.incomplete_notes_tracking(provider_id);
CREATE INDEX IF NOT EXISTS idx_incomplete_notes_status ON public.incomplete_notes_tracking(status);
CREATE INDEX IF NOT EXISTS idx_incomplete_notes_admin_visible ON public.incomplete_notes_tracking(visible_to_admin);
CREATE INDEX IF NOT EXISTS idx_incomplete_notes_aging ON public.incomplete_notes_tracking(aging_bucket);

-- Enable RLS
ALTER TABLE public.incomplete_notes_tracking ENABLE ROW LEVEL SECURITY;

-- Providers can see their own tracking
CREATE POLICY "Providers can view own incomplete notes" ON public.incomplete_notes_tracking
    FOR SELECT TO authenticated 
    USING (
        provider_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
            AND visible_to_admin = TRUE
        )
    );

CREATE POLICY "System can manage incomplete notes tracking" ON public.incomplete_notes_tracking
    FOR ALL TO authenticated WITH CHECK (true);

-- =====================================================
-- 5. Provider reminders table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.provider_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id),
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('INCOMPLETE_NOTES', 'SESSION_TIMEOUT', 'LOGOUT', 'PENDING_SIGN')),
    trigger_event TEXT,
    shown_at TIMESTAMPTZ DEFAULT NOW(),
    dismissed_at TIMESTAMPTZ,
    action_taken TEXT,
    action_taken_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_reminders_provider ON public.provider_reminders(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_reminders_type ON public.provider_reminders(reminder_type);

-- Enable RLS
ALTER TABLE public.provider_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage own reminders" ON public.provider_reminders
    FOR ALL TO authenticated 
    USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all reminders" ON public.provider_reminders
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );

-- =====================================================
-- 6. Audio recordings temp storage
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audio_recordings_temp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinical_note_id UUID REFERENCES public.clinical_notes(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.profiles(id),
    storage_path TEXT,
    blob_url TEXT,
    duration_seconds INTEGER,
    file_size_bytes INTEGER,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSCRIBED', 'DELETED', 'EXPIRED')),
    transcript_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    deleted_at TIMESTAMPTZ,
    deletion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_temp_note ON public.audio_recordings_temp(clinical_note_id);
CREATE INDEX IF NOT EXISTS idx_audio_temp_provider ON public.audio_recordings_temp(provider_id);
CREATE INDEX IF NOT EXISTS idx_audio_temp_status ON public.audio_recordings_temp(status);
CREATE INDEX IF NOT EXISTS idx_audio_temp_expires ON public.audio_recordings_temp(expires_at);

-- Enable RLS
ALTER TABLE public.audio_recordings_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage own audio recordings" ON public.audio_recordings_temp
    FOR ALL TO authenticated 
    USING (provider_id = auth.uid());

-- =====================================================
-- 7. Function to auto-delete expired audio recordings
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_audio_recordings()
RETURNS void AS $$
BEGIN
    UPDATE public.audio_recordings_temp
    SET 
        status = 'EXPIRED',
        deleted_at = NOW(),
        deletion_reason = 'TTL_EXPIRED'
    WHERE 
        expires_at < NOW() 
        AND status = 'ACTIVE';
    
    -- Also clean up blob URLs from clinical notes
    UPDATE public.clinical_notes
    SET audio_temp_url = NULL
    WHERE audio_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. Function to create note snapshot on sign
-- =====================================================
CREATE OR REPLACE FUNCTION create_note_snapshot_on_sign()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create snapshot when status changes to SIGNED
    IF NEW.status = 'SIGNED' AND (OLD.status IS NULL OR OLD.status != 'SIGNED') THEN
        INSERT INTO public.clinical_note_snapshots (
            clinical_note_id,
            snapshot_data,
            snapshot_type,
            created_by
        ) VALUES (
            NEW.id,
            jsonb_build_object(
                'subjective', NEW.subjective,
                'objective', NEW.objective,
                'assessment', NEW.assessment,
                'plan', NEW.plan,
                'transcript', NEW.transcript,
                'icd10_codes', NEW.icd10_codes,
                'source_type', NEW.source_type,
                'signed_at', NEW.signed_at,
                'signed_by', NEW.signed_by
            ),
            'SIGNED',
            NEW.signed_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for note signing
DROP TRIGGER IF EXISTS on_clinical_note_signed ON public.clinical_notes;
CREATE TRIGGER on_clinical_note_signed
    AFTER UPDATE ON public.clinical_notes
    FOR EACH ROW
    EXECUTE FUNCTION create_note_snapshot_on_sign();

-- =====================================================
-- 9. Function to update incomplete notes tracking
-- =====================================================
CREATE OR REPLACE FUNCTION update_incomplete_notes_tracking()
RETURNS void AS $$
DECLARE
    now_time TIMESTAMPTZ := NOW();
    hours_24 INTERVAL := INTERVAL '24 hours';
    hours_48 INTERVAL := INTERVAL '48 hours';
    hours_72 INTERVAL := INTERVAL '72 hours';
BEGIN
    -- Update aging buckets and visibility
    UPDATE public.incomplete_notes_tracking
    SET 
        hours_old = EXTRACT(EPOCH FROM (now_time - created_at)) / 3600,
        aging_bucket = CASE
            WHEN (now_time - created_at) < hours_24 THEN '0-24h'
            WHEN (now_time - created_at) < hours_48 THEN '24-48h'
            WHEN (now_time - created_at) < hours_72 THEN '48-72h'
            ELSE '72h+'
        END,
        visible_to_admin = (now_time - created_at) >= hours_24,
        updated_at = now_time
    WHERE 
        status IN ('NO_NOTE', 'DRAFT', 'PENDING_REVIEW')
        AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. Enhanced audit log entries for clinical notes
-- =====================================================
-- These are handled in application code but define expected actions:
-- RECORDING_STARTED, RECORDING_STOPPED
-- TRANSCRIPT_RECEIVED, TRANSCRIPT_EDITED
-- TRANSCRIPT_MARKED_REVIEWED
-- SOAP_GENERATED, SOAP_ACCEPTED
-- ICD10_SUGGESTED, ICD10_SELECTED
-- NOTE_SAVED_DRAFT, NOTE_SIGNED
-- NOTE_EDITED_AFTER_SIGN
-- REMINDER_SHOWN, REMINDER_DISMISSED
-- AUDIO_DELETED (reason: TTL | saved | signed)

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
