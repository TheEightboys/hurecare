-- Migration: Production Hardening for HURE Care
-- Adds: soft delete, immutable snapshots, enhanced profiles, storage policies

-- ==========================================
-- PART 1: Soft Delete Columns
-- ==========================================

-- Add deleted_at columns for soft delete support
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.referral_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.intake_forms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ==========================================
-- PART 2: Immutable Snapshots for Signed Records
-- ==========================================

-- Store immutable snapshot when clinical note is signed
-- This preserves the exact content at time of signature
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS signed_snapshot JSONB;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS signed_snapshot_at TIMESTAMPTZ;

-- Store immutable snapshot for referral notes
ALTER TABLE public.referral_notes ADD COLUMN IF NOT EXISTS signed_snapshot JSONB;
ALTER TABLE public.referral_notes ADD COLUMN IF NOT EXISTS signed_snapshot_at TIMESTAMPTZ;

-- Store services snapshot for claims (insurance_snapshot already exists)
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS services_snapshot JSONB;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS clinical_notes_snapshot JSONB;

-- ==========================================
-- PART 3: Enhanced User Profiles
-- ==========================================

-- Add additional fields to profiles for production readiness
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- ==========================================
-- PART 4: Audio Recording Tracking
-- ==========================================

-- Create audio_recordings table for tracking uploads and TTL cleanup
CREATE TABLE IF NOT EXISTS public.audio_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_note_id UUID REFERENCES public.clinical_notes(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    transcript TEXT,
    transcript_reviewed BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL, -- For TTL cleanup
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on audio_recordings
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for audio_recordings
CREATE POLICY "Users can view own audio recordings" ON public.audio_recordings 
    FOR SELECT TO authenticated USING (uploaded_by = auth.uid());
CREATE POLICY "Users can create audio recordings" ON public.audio_recordings 
    FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Users can update own audio recordings" ON public.audio_recordings 
    FOR UPDATE TO authenticated USING (uploaded_by = auth.uid());

-- ==========================================
-- PART 5: Document Storage Tracking
-- ==========================================

-- Create documents table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'patient', 'clinical_note', 'claim', 'intake_form'
    entity_id UUID NOT NULL,
    document_type TEXT NOT NULL, -- 'id_copy', 'lab_result', 'prescription', 'referral', 'other'
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents  
CREATE POLICY "Authenticated users can view documents" ON public.documents 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create documents" ON public.documents 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own documents" ON public.documents 
    FOR UPDATE TO authenticated USING (uploaded_by = auth.uid());

-- ==========================================
-- PART 6: Trigger to Create Immutable Snapshot on Sign
-- ==========================================

-- Function to create immutable snapshot when clinical note is signed
CREATE OR REPLACE FUNCTION public.create_clinical_note_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only create snapshot when status changes to SIGNED
    IF NEW.status = 'SIGNED' AND (OLD.status IS NULL OR OLD.status != 'SIGNED') THEN
        NEW.signed_snapshot = jsonb_build_object(
            'subjective', NEW.subjective,
            'objective', NEW.objective,
            'assessment', NEW.assessment,
            'plan', NEW.plan,
            'single_note', NEW.single_note,
            'transcript', NEW.transcript,
            'icd10_codes', NEW.icd10_codes,
            'patient_id', NEW.patient_id,
            'provider_id', NEW.provider_id,
            'source_type', NEW.source_type
        );
        NEW.signed_snapshot_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for clinical notes snapshot
DROP TRIGGER IF EXISTS create_clinical_note_snapshot_trigger ON public.clinical_notes;
CREATE TRIGGER create_clinical_note_snapshot_trigger
    BEFORE UPDATE ON public.clinical_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.create_clinical_note_snapshot();

-- Function to create immutable snapshot when referral note is signed
CREATE OR REPLACE FUNCTION public.create_referral_note_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only create snapshot when status changes to SIGNED
    IF NEW.status = 'SIGNED' AND (OLD.status IS NULL OR OLD.status != 'SIGNED') THEN
        NEW.signed_snapshot = jsonb_build_object(
            'reason_for_referral', NEW.reason_for_referral,
            'clinical_summary', NEW.clinical_summary,
            'investigations', NEW.investigations,
            'treatment_given', NEW.treatment_given,
            'medications', NEW.medications,
            'allergies', NEW.allergies,
            'requested_action', NEW.requested_action,
            'receiving_facility', NEW.receiving_facility,
            'urgency', NEW.urgency,
            'patient_id', NEW.patient_id,
            'provider_id', NEW.provider_id,
            'source_clinical_note_id', NEW.source_clinical_note_id
        );
        NEW.signed_snapshot_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for referral notes snapshot
DROP TRIGGER IF EXISTS create_referral_note_snapshot_trigger ON public.referral_notes;
CREATE TRIGGER create_referral_note_snapshot_trigger
    BEFORE UPDATE ON public.referral_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.create_referral_note_snapshot();

-- ==========================================
-- PART 7: Role-Based Access Functions
-- ==========================================

-- Check if user has any clinical role (provider or admin)
CREATE OR REPLACE FUNCTION public.is_clinical_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('provider', 'admin')
    )
$$;

-- Check if user has billing access
CREATE OR REPLACE FUNCTION public.has_billing_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('billing_staff', 'admin')
    )
$$;

-- ==========================================
-- PART 8: Indexes for Performance
-- ==========================================

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON public.patients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_deleted_at ON public.clinical_notes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_status ON public.clinical_notes(status);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_id ON public.clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON public.billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_expires_at ON public.audio_recordings(expires_at);

-- ==========================================
-- PART 9: Updated_at Triggers for New Tables
-- ==========================================

-- Note: Trigger function update_updated_at_column already exists from initial migration

-- ==========================================
-- PART 10: Comments for Documentation
-- ==========================================

COMMENT ON COLUMN public.clinical_notes.signed_snapshot IS 'Immutable JSON snapshot of note at time of signing - prevents historical data mutation';
COMMENT ON COLUMN public.referral_notes.signed_snapshot IS 'Immutable JSON snapshot of referral at time of signing';
COMMENT ON COLUMN public.insurance_claims.insurance_snapshot IS 'Point-in-time snapshot of patient insurance at claim creation';
COMMENT ON TABLE public.audio_recordings IS 'Tracks audio file uploads with TTL for automatic cleanup';
COMMENT ON TABLE public.documents IS 'General purpose document storage tracking';
