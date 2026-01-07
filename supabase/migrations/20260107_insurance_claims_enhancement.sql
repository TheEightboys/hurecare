-- Migration: Insurance Submission Review & Enhanced Claims
-- Date: 2026-01-07
-- Purpose: Implement full insurance workflow, claims-ready billing, and audit-safe snapshots

-- ==========================================
-- PART 1: Insurance Submissions Table
-- Stores patient-submitted insurance info for staff review
-- ==========================================

CREATE TABLE IF NOT EXISTS public.insurance_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    -- Submitted data (immutable once submitted)
    submitted_data JSONB NOT NULL,
    -- Structure: {
    --   insuranceProvider: string,
    --   policyNumber: string,
    --   groupNumber?: string,
    --   holderName: string,
    --   holderRelationship: 'SELF' | 'SPOUSE' | 'CHILD' | 'OTHER',
    --   holderDob?: string,
    --   validFrom?: string,
    --   validUntil?: string,
    --   frontCardImage?: string (storage path),
    --   backCardImage?: string (storage path),
    --   additionalNotes?: string
    -- }
    
    -- Status lifecycle
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' 
        CHECK (status IN ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED')),
    
    -- Submission tracking
    token TEXT UNIQUE NOT NULL,
    phone_last_4 TEXT NOT NULL,
    verification_attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    verified_at TIMESTAMPTZ,
    
    -- Review tracking
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Audit PDF (generated on submission for permanent record)
    audit_pdf_url TEXT,
    
    -- Snapshot of what was written to patient demographics (on accept)
    applied_snapshot JSONB,
    applied_at TIMESTAMPTZ,
    
    -- Standard fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.insurance_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can view all insurance submissions" ON public.insurance_submissions 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can create insurance submissions" ON public.insurance_submissions 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update insurance submissions" ON public.insurance_submissions 
    FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_patient ON public.insurance_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_status ON public.insurance_submissions(status);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_token ON public.insurance_submissions(token);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_expires ON public.insurance_submissions(expires_at);

-- ==========================================
-- PART 2: Enhanced Insurance Claims Table
-- Add missing fields for claim pack generation
-- ==========================================

-- Add ICD-10 codes snapshot to claims
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS diagnosis_codes JSONB;
-- Structure: [{ code: string, description: string }]

-- Add provider info snapshot
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS provider_snapshot JSONB;
-- Structure: { name, license, specialty, facility, address }

-- Add patient demographics snapshot
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS patient_snapshot JSONB;
-- Structure: { name, dob, gender, phone, address }

-- Add attachments tracking
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
-- Structure: [{ type, name, url, addedAt }]

-- Add submission tracking
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_reference_number TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS submitted_method TEXT 
    CHECK (submitted_method IS NULL OR submitted_method IN ('MANUAL', 'PORTAL', 'API'));
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2);
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add claim pack PDF URL
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_pack_url TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_pack_generated_at TIMESTAMPTZ;

-- ==========================================
-- PART 3: Billing Enhancements
-- ==========================================

-- Add insurance claim reference to billing
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS insurance_claim_id UUID REFERENCES public.insurance_claims(id);

-- Add linked clinical note for claims
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS linked_clinical_note_id UUID REFERENCES public.clinical_notes(id);

-- Add linked appointment
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS linked_appointment_id UUID REFERENCES public.appointments(id);

-- ==========================================
-- PART 4: User Roles Enhancement
-- ==========================================

-- Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('provider', 'billing_staff', 'admin', 'receptionist')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles" ON public.user_roles 
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Users can view own roles" ON public.user_roles 
    FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ==========================================
-- PART 5: Trigger for Insurance Submission Status Change
-- ==========================================

-- Function to handle insurance submission acceptance
CREATE OR REPLACE FUNCTION public.handle_insurance_submission_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- When status changes to ACCEPTED, create a snapshot of what we're applying
    IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING_REVIEW' THEN
        -- Store snapshot of applied data
        NEW.applied_snapshot = NEW.submitted_data;
        NEW.applied_at = NOW();
        
        -- Update patient demographics from submitted data
        UPDATE public.patients SET
            insurance_provider = (NEW.submitted_data->>'insuranceProvider'),
            insurance_policy_number = (NEW.submitted_data->>'policyNumber'),
            insurance_group_number = (NEW.submitted_data->>'groupNumber'),
            insurance_holder_name = (NEW.submitted_data->>'holderName'),
            insurance_holder_relationship = (NEW.submitted_data->>'holderRelationship'),
            insurance_valid_from = (NEW.submitted_data->>'validFrom')::DATE,
            insurance_valid_until = (NEW.submitted_data->>'validUntil')::DATE,
            updated_at = NOW()
        WHERE id = NEW.patient_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS handle_insurance_submission_status_trigger ON public.insurance_submissions;
CREATE TRIGGER handle_insurance_submission_status_trigger
    BEFORE UPDATE ON public.insurance_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_insurance_submission_status_change();

-- ==========================================
-- PART 6: Function to Create Claim with Full Snapshots
-- ==========================================

CREATE OR REPLACE FUNCTION public.create_claim_with_snapshots(
    p_billing_id UUID,
    p_clinical_note_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_claim_id UUID;
    v_billing RECORD;
    v_patient RECORD;
    v_provider RECORD;
    v_clinical_note RECORD;
BEGIN
    -- Get billing record
    SELECT * INTO v_billing FROM public.billing WHERE id = p_billing_id;
    IF v_billing IS NULL THEN
        RAISE EXCEPTION 'Billing record not found';
    END IF;
    
    -- Get patient with insurance info
    SELECT * INTO v_patient FROM public.patients WHERE id = v_billing.patient_id;
    
    -- Get provider info
    SELECT * INTO v_provider FROM public.profiles WHERE id = v_billing.provider_id;
    
    -- Get clinical note if provided
    IF p_clinical_note_id IS NOT NULL THEN
        SELECT * INTO v_clinical_note FROM public.clinical_notes WHERE id = p_clinical_note_id;
    END IF;
    
    -- Create the claim with all snapshots
    INSERT INTO public.insurance_claims (
        billing_id,
        patient_id,
        -- Insurance snapshot (immutable)
        insurance_snapshot,
        -- Patient snapshot (immutable)
        patient_snapshot,
        -- Provider snapshot (immutable)
        provider_snapshot,
        -- Services from billing (immutable)
        services_snapshot,
        services,
        -- Clinical notes snapshot if available
        clinical_notes_snapshot,
        -- Diagnosis codes from clinical note
        diagnosis_codes,
        -- Amounts
        total_amount,
        -- Status
        status
    ) VALUES (
        p_billing_id,
        v_billing.patient_id,
        -- Insurance snapshot
        jsonb_build_object(
            'provider', v_patient.insurance_provider,
            'policyNumber', v_patient.insurance_policy_number,
            'groupNumber', v_patient.insurance_group_number,
            'holderName', v_patient.insurance_holder_name,
            'holderRelationship', v_patient.insurance_holder_relationship,
            'validFrom', v_patient.insurance_valid_from,
            'validUntil', v_patient.insurance_valid_until,
            'snapshotDate', NOW()
        ),
        -- Patient snapshot
        jsonb_build_object(
            'name', v_patient.first_name || ' ' || v_patient.last_name,
            'firstName', v_patient.first_name,
            'lastName', v_patient.last_name,
            'dob', v_patient.date_of_birth,
            'gender', v_patient.gender,
            'phone', v_patient.phone,
            'email', v_patient.email,
            'address', v_patient.address,
            'snapshotDate', NOW()
        ),
        -- Provider snapshot
        jsonb_build_object(
            'name', v_provider.full_name,
            'licenseNumber', v_provider.license_number,
            'specialty', v_provider.specialty,
            'facility', v_provider.facility_name,
            'address', v_provider.facility_address,
            'snapshotDate', NOW()
        ),
        -- Services snapshot
        v_billing.services,
        v_billing.services,
        -- Clinical notes snapshot
        CASE WHEN v_clinical_note IS NOT NULL THEN
            jsonb_build_object(
                'id', v_clinical_note.id,
                'subjective', v_clinical_note.subjective,
                'objective', v_clinical_note.objective,
                'assessment', v_clinical_note.assessment,
                'plan', v_clinical_note.plan,
                'singleNote', v_clinical_note.single_note,
                'icd10Codes', v_clinical_note.icd10_codes,
                'signedAt', v_clinical_note.signed_at,
                'snapshotDate', NOW()
            )
        ELSE NULL END,
        -- Diagnosis codes from clinical note
        CASE WHEN v_clinical_note IS NOT NULL THEN
            v_clinical_note.icd10_codes
        ELSE NULL END,
        -- Total
        v_billing.total,
        'DRAFT'
    )
    RETURNING id INTO v_claim_id;
    
    -- Link claim back to billing
    UPDATE public.billing SET insurance_claim_id = v_claim_id WHERE id = p_billing_id;
    
    RETURN v_claim_id;
END;
$$;

-- ==========================================
-- PART 7: Permission Check Functions
-- ==========================================

-- Check if user can review insurance submissions
CREATE OR REPLACE FUNCTION public.can_review_insurance(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('billing_staff', 'admin', 'receptionist')
    )
$$;

-- Check if user can manage claims
CREATE OR REPLACE FUNCTION public.can_manage_claims(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('billing_staff', 'admin')
    )
$$;

-- ==========================================
-- PART 8: Add Insurance Fields to Patients (if not exist)
-- ==========================================

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_valid_from DATE;
-- insurance_valid_until already exists

-- ==========================================
-- PART 9: Updated_at Trigger for New Table
-- ==========================================

CREATE TRIGGER update_insurance_submissions_updated_at
    BEFORE UPDATE ON public.insurance_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- PART 10: Comments for Documentation
-- ==========================================

COMMENT ON TABLE public.insurance_submissions IS 'Stores patient-submitted insurance information for staff review. Status: PENDING_REVIEW -> ACCEPTED/REJECTED';
COMMENT ON COLUMN public.insurance_submissions.submitted_data IS 'Immutable JSON of submitted insurance details';
COMMENT ON COLUMN public.insurance_submissions.applied_snapshot IS 'Snapshot of data that was applied to patient demographics on acceptance';
COMMENT ON COLUMN public.insurance_submissions.audit_pdf_url IS 'URL to generated PDF of submission for permanent audit record';

COMMENT ON COLUMN public.insurance_claims.diagnosis_codes IS 'ICD-10 codes snapshot from clinical notes at claim creation';
COMMENT ON COLUMN public.insurance_claims.provider_snapshot IS 'Immutable snapshot of provider info at claim creation';
COMMENT ON COLUMN public.insurance_claims.patient_snapshot IS 'Immutable snapshot of patient demographics at claim creation';
COMMENT ON COLUMN public.insurance_claims.attachments IS 'Array of attached documents: clinical notes, labs, referrals';

