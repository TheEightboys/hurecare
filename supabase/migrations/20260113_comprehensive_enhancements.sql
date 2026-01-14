-- =====================================================
-- COMPREHENSIVE ENHANCEMENTS MIGRATION
-- January 13, 2026
-- Features: Referral Notes, Appointment Badges, Intake Forms, Claims
-- =====================================================

-- =====================================================
-- 1. REFERRAL NOTES ENHANCEMENTS
-- =====================================================

-- Add new columns to referral_notes if they don't exist
DO $$ 
BEGIN
    -- Source clinical note tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'source_clinical_note_id') THEN
        ALTER TABLE public.referral_notes ADD COLUMN source_clinical_note_id UUID REFERENCES public.clinical_notes(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'source_visit_date') THEN
        ALTER TABLE public.referral_notes ADD COLUMN source_visit_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'source_note_type') THEN
        ALTER TABLE public.referral_notes ADD COLUMN source_note_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'source_note_status') THEN
        ALTER TABLE public.referral_notes ADD COLUMN source_note_status TEXT;
    END IF;

    -- Receiving facility details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'receiving_facility') THEN
        ALTER TABLE public.referral_notes ADD COLUMN receiving_facility TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'urgency') THEN
        ALTER TABLE public.referral_notes ADD COLUMN urgency TEXT DEFAULT 'Routine' CHECK (urgency IN ('Routine', 'Urgent', 'Emergency'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'reason_for_referral') THEN
        ALTER TABLE public.referral_notes ADD COLUMN reason_for_referral TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'clinical_summary') THEN
        ALTER TABLE public.referral_notes ADD COLUMN clinical_summary TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'investigations') THEN
        ALTER TABLE public.referral_notes ADD COLUMN investigations TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'treatment_given') THEN
        ALTER TABLE public.referral_notes ADD COLUMN treatment_given TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'medications') THEN
        ALTER TABLE public.referral_notes ADD COLUMN medications TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'allergies') THEN
        ALTER TABLE public.referral_notes ADD COLUMN allergies TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'requested_action') THEN
        ALTER TABLE public.referral_notes ADD COLUMN requested_action TEXT;
    END IF;

    -- Signature fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'signed_at') THEN
        ALTER TABLE public.referral_notes ADD COLUMN signed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'signed_by') THEN
        ALTER TABLE public.referral_notes ADD COLUMN signed_by UUID REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'provider_id') THEN
        ALTER TABLE public.referral_notes ADD COLUMN provider_id UUID REFERENCES public.profiles(id);
    END IF;

    -- PDF storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'pdf_snapshot_url') THEN
        ALTER TABLE public.referral_notes ADD COLUMN pdf_snapshot_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'pdf_generated_at') THEN
        ALTER TABLE public.referral_notes ADD COLUMN pdf_generated_at TIMESTAMPTZ;
    END IF;

    -- Download/print/copy tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'download_count') THEN
        ALTER TABLE public.referral_notes ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'referral_notes' AND column_name = 'last_downloaded_at') THEN
        ALTER TABLE public.referral_notes ADD COLUMN last_downloaded_at TIMESTAMPTZ;
    END IF;
END $$;

-- Update status check constraint for referral_notes
ALTER TABLE public.referral_notes DROP CONSTRAINT IF EXISTS referral_notes_status_check;
ALTER TABLE public.referral_notes ADD CONSTRAINT referral_notes_status_check 
    CHECK (status IN ('DRAFT', 'SIGNED', 'sent', 'acknowledged', 'scheduled', 'completed', 'cancelled'));

-- =====================================================
-- 2. APPOINTMENTS ENHANCEMENTS (Booking Type & Confirmation)
-- =====================================================

DO $$ 
BEGIN
    -- Booking type (same day vs advance)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'booking_type') THEN
        ALTER TABLE public.appointments ADD COLUMN booking_type TEXT DEFAULT 'ADVANCE' CHECK (booking_type IN ('SAME_DAY', 'ADVANCE'));
    END IF;

    -- Confirmation indicator
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'confirmation_indicator') THEN
        ALTER TABLE public.appointments ADD COLUMN confirmation_indicator TEXT DEFAULT 'NC' CHECK (confirmation_indicator IN ('C', 'NC', 'LM'));
    END IF;

    -- Confirmation method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'confirmation_method') THEN
        ALTER TABLE public.appointments ADD COLUMN confirmation_method TEXT CHECK (confirmation_method IN ('SMS', 'WhatsApp', 'Phone', 'In-person', 'Email'));
    END IF;

    -- Confirmation attempts tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'confirmation_attempts') THEN
        ALTER TABLE public.appointments ADD COLUMN confirmation_attempts INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'last_confirmation_attempt') THEN
        ALTER TABLE public.appointments ADD COLUMN last_confirmation_attempt TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'confirmed_at') THEN
        ALTER TABLE public.appointments ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;

    -- Reminder tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'reminder_sent_24h') THEN
        ALTER TABLE public.appointments ADD COLUMN reminder_sent_24h BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'reminder_sent_morning') THEN
        ALTER TABLE public.appointments ADD COLUMN reminder_sent_morning BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'reminder_sent_same_day') THEN
        ALTER TABLE public.appointments ADD COLUMN reminder_sent_same_day BOOLEAN DEFAULT FALSE;
    END IF;

    -- Reason for visit (extended)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'reason_for_visit') THEN
        ALTER TABLE public.appointments ADD COLUMN reason_for_visit TEXT;
    END IF;
END $$;

-- Update status check constraint for appointments
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_SESSION', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'));

-- Create function to increment confirmation attempts
CREATE OR REPLACE FUNCTION increment_confirmation_attempts(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT confirmation_attempts INTO current_count 
    FROM appointments WHERE id = row_id;
    RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set booking type on insert
CREATE OR REPLACE FUNCTION auto_set_booking_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_type IS NULL THEN
        IF NEW.appointment_date = CURRENT_DATE THEN
            NEW.booking_type := 'SAME_DAY';
        ELSE
            NEW.booking_type := 'ADVANCE';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_booking_type_trigger ON public.appointments;
CREATE TRIGGER set_booking_type_trigger
    BEFORE INSERT ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_booking_type();

-- =====================================================
-- 3. INTAKE FORMS ENHANCEMENTS
-- =====================================================

DO $$ 
BEGIN
    -- Form type enhancements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'form_type') THEN
        ALTER TABLE public.intake_forms ADD COLUMN form_type TEXT DEFAULT 'MEDICAL_HISTORY';
    END IF;

    -- Link to appointment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'appointment_id') THEN
        ALTER TABLE public.intake_forms ADD COLUMN appointment_id UUID REFERENCES public.appointments(id);
    END IF;

    -- Token for public access
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'token') THEN
        ALTER TABLE public.intake_forms ADD COLUMN token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');
    END IF;

    -- Verification tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'verification_attempts') THEN
        ALTER TABLE public.intake_forms ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'verified_at') THEN
        ALTER TABLE public.intake_forms ADD COLUMN verified_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'blocked_until') THEN
        ALTER TABLE public.intake_forms ADD COLUMN blocked_until TIMESTAMPTZ;
    END IF;

    -- Answers storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'answers_json') THEN
        ALTER TABLE public.intake_forms ADD COLUMN answers_json JSONB DEFAULT '{}';
    END IF;

    -- PDF snapshot
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'pdf_snapshot_url') THEN
        ALTER TABLE public.intake_forms ADD COLUMN pdf_snapshot_url TEXT;
    END IF;

    -- Expiration (24h default)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'intake_forms' AND column_name = 'expires_at') THEN
        ALTER TABLE public.intake_forms ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
    ELSE
        -- Update default to 24 hours
        ALTER TABLE public.intake_forms ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '24 hours');
    END IF;
END $$;

-- Update status check constraint for intake_forms
ALTER TABLE public.intake_forms DROP CONSTRAINT IF EXISTS intake_forms_status_check;
ALTER TABLE public.intake_forms ADD CONSTRAINT intake_forms_status_check 
    CHECK (status IN ('PENDING', 'PENDING_REVIEW', 'ACCEPTED', 'REJECTED', 'pending', 'submitted', 'reviewed', 'approved'));

-- Update form_type check constraint
ALTER TABLE public.intake_forms DROP CONSTRAINT IF EXISTS intake_forms_form_type_check;
ALTER TABLE public.intake_forms ADD CONSTRAINT intake_forms_form_type_check 
    CHECK (form_type IN ('MEDICAL_HISTORY', 'INSURANCE', 'new_patient', 'medical_history', 'consent', 'insurance', 'custom'));

-- Function to check form expiration and verification
CREATE OR REPLACE FUNCTION check_intake_form_access(p_token TEXT, p_last4 TEXT)
RETURNS TABLE (
    form_id UUID,
    patient_id UUID,
    form_type TEXT,
    status TEXT,
    is_valid BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_form RECORD;
    v_patient RECORD;
BEGIN
    -- Get form by token
    SELECT * INTO v_form FROM intake_forms WHERE token = p_token;
    
    IF v_form IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Form not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check expiration
    IF v_form.expires_at < NOW() THEN
        RETURN QUERY SELECT v_form.id, v_form.patient_id, v_form.form_type, v_form.status::TEXT, FALSE, 'Form has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check if blocked
    IF v_form.blocked_until IS NOT NULL AND v_form.blocked_until > NOW() THEN
        RETURN QUERY SELECT v_form.id, v_form.patient_id, v_form.form_type, v_form.status::TEXT, FALSE, 'Too many attempts. Try again later.'::TEXT;
        RETURN;
    END IF;
    
    -- Check already submitted
    IF v_form.status IN ('PENDING_REVIEW', 'ACCEPTED', 'submitted', 'approved') THEN
        RETURN QUERY SELECT v_form.id, v_form.patient_id, v_form.form_type, v_form.status::TEXT, FALSE, 'Form already submitted'::TEXT;
        RETURN;
    END IF;
    
    -- Get patient phone
    SELECT * INTO v_patient FROM patients WHERE id = v_form.patient_id;
    
    -- Verify last 4 digits
    IF v_patient.phone IS NULL OR RIGHT(REGEXP_REPLACE(v_patient.phone, '[^0-9]', '', 'g'), 4) != p_last4 THEN
        -- Increment verification attempts
        UPDATE intake_forms 
        SET verification_attempts = COALESCE(verification_attempts, 0) + 1,
            blocked_until = CASE WHEN COALESCE(verification_attempts, 0) >= 2 THEN NOW() + INTERVAL '30 minutes' ELSE NULL END
        WHERE id = v_form.id;
        
        RETURN QUERY SELECT v_form.id, v_form.patient_id, v_form.form_type, v_form.status::TEXT, FALSE, 'Verification failed'::TEXT;
        RETURN;
    END IF;
    
    -- Mark as verified
    UPDATE intake_forms 
    SET verified_at = NOW()
    WHERE id = v_form.id AND verified_at IS NULL;
    
    RETURN QUERY SELECT v_form.id, v_form.patient_id, v_form.form_type, v_form.status::TEXT, TRUE, 'Valid'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. INSURANCE CLAIMS ENHANCEMENTS
-- =====================================================

DO $$ 
BEGIN
    -- Snapshot fields for immutability
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'patient_snapshot') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN patient_snapshot JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'insurance_snapshot') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN insurance_snapshot JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'provider_snapshot') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN provider_snapshot JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'clinical_notes_snapshot') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN clinical_notes_snapshot JSONB;
    END IF;

    -- Services and totals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'services') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN services JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'total_amount') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Attachments tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'attachments') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;

    -- Claim pack PDF
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'claim_pack_pdf_url') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN claim_pack_pdf_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'claim_pack_generated_at') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN claim_pack_generated_at TIMESTAMPTZ;
    END IF;

    -- Pre-auth tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'preauth_number') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN preauth_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'preauth_status') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN preauth_status TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'preauth_approved_amount') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN preauth_approved_amount DECIMAL(10, 2);
    END IF;

    -- Submission method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'submission_method') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN submission_method TEXT DEFAULT 'MANUAL' CHECK (submission_method IN ('MANUAL', 'API', 'PORTAL'));
    END IF;

    -- Remittance tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'remittance_received_at') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN remittance_received_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'insurance_claims' AND column_name = 'remittance_details') THEN
        ALTER TABLE public.insurance_claims ADD COLUMN remittance_details JSONB;
    END IF;
END $$;

-- =====================================================
-- 5. BILLING RECORDS ENHANCEMENTS
-- =====================================================

DO $$ 
BEGIN
    -- Payer type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'payer_type') THEN
        ALTER TABLE public.billing_records ADD COLUMN payer_type TEXT DEFAULT 'Patient' CHECK (payer_type IN ('Patient', 'Insurance'));
    END IF;

    -- Services array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'services') THEN
        ALTER TABLE public.billing_records ADD COLUMN services JSONB DEFAULT '[]';
    END IF;

    -- Insurance claim reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'claim_id') THEN
        ALTER TABLE public.billing_records ADD COLUMN claim_id UUID REFERENCES public.insurance_claims(id);
    END IF;

    -- Balance tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'balance') THEN
        ALTER TABLE public.billing_records ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Subtotal and tax
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'subtotal') THEN
        ALTER TABLE public.billing_records ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'tax') THEN
        ALTER TABLE public.billing_records ADD COLUMN tax DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'total') THEN
        ALTER TABLE public.billing_records ADD COLUMN total DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Provider reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'billing_records' AND column_name = 'provider_id') THEN
        ALTER TABLE public.billing_records ADD COLUMN provider_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- =====================================================
-- 6. CONFIRMATION ATTEMPT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.confirmation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    attempt_method TEXT CHECK (attempt_method IN ('SMS', 'WhatsApp', 'Phone', 'In-person', 'Email')),
    attempt_result TEXT CHECK (attempt_result IN ('SUCCESS', 'NO_ANSWER', 'LEFT_MESSAGE', 'WRONG_NUMBER', 'BUSY')),
    notes TEXT,
    attempted_by UUID REFERENCES public.profiles(id),
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confirmation_attempts_appointment ON public.confirmation_attempts(appointment_id);

-- Enable RLS
ALTER TABLE public.confirmation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage confirmation attempts" ON public.confirmation_attempts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 7. REFERRAL AUDIT EVENTS TABLE
-- =====================================================

-- This extends the existing audit_logs table for referral-specific events
-- Events: REFERRAL_GENERATED, REFERRAL_EDITED, REFERRAL_SIGNED, REFERRAL_DOWNLOADED, REFERRAL_PRINTED, REFERRAL_EMAIL_COPIED

-- =====================================================
-- 8. CONNECTOR STUBS TRACKING TABLE (for future API integration)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.insurance_connector_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES public.insurance_claims(id),
    connector_type TEXT NOT NULL CHECK (connector_type IN ('ELIGIBILITY', 'PREAUTH', 'SUBMIT', 'STATUS', 'REMITTANCE')),
    provider_name TEXT NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    status TEXT CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT')),
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connector_logs_claim ON public.insurance_connector_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_connector_logs_type ON public.insurance_connector_logs(connector_type);

ALTER TABLE public.insurance_connector_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view connector logs" ON public.insurance_connector_logs
    FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 9. ADD MORE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_booking_type ON public.appointments(booking_type);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmation ON public.appointments(confirmation_indicator);
CREATE INDEX IF NOT EXISTS idx_referral_notes_source ON public.referral_notes(source_clinical_note_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_token ON public.intake_forms(token);
CREATE INDEX IF NOT EXISTS idx_intake_forms_expires ON public.intake_forms(expires_at);
CREATE INDEX IF NOT EXISTS idx_claims_status_date ON public.insurance_claims(status, service_date);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COUNT(*) + 1 INTO v_count 
    FROM insurance_claims 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    RETURN 'CLM-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create claim from bill
CREATE OR REPLACE FUNCTION create_claim_from_bill(p_bill_id UUID, p_clinical_note_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_bill RECORD;
    v_patient RECORD;
    v_provider RECORD;
    v_clinical_note RECORD;
    v_claim_id UUID;
BEGIN
    -- Get bill
    SELECT * INTO v_bill FROM billing_records WHERE id = p_bill_id;
    IF v_bill IS NULL THEN
        RAISE EXCEPTION 'Bill not found';
    END IF;
    
    -- Get patient
    SELECT * INTO v_patient FROM patients WHERE id = v_bill.patient_id;
    
    -- Get provider
    SELECT * INTO v_provider FROM profiles WHERE id = v_bill.provider_id;
    
    -- Get clinical note if provided
    IF p_clinical_note_id IS NOT NULL THEN
        SELECT * INTO v_clinical_note FROM clinical_notes WHERE id = p_clinical_note_id;
    END IF;
    
    -- Create claim
    INSERT INTO insurance_claims (
        patient_id,
        billing_record_id,
        clinical_note_id,
        claim_number,
        insurance_provider,
        policy_number,
        group_number,
        subscriber_name,
        patient_snapshot,
        insurance_snapshot,
        provider_snapshot,
        clinical_notes_snapshot,
        services,
        total_amount,
        diagnosis_codes,
        status,
        service_date
    ) VALUES (
        v_bill.patient_id,
        p_bill_id,
        p_clinical_note_id,
        generate_claim_number(),
        v_patient.insurance_provider,
        v_patient.insurance_policy_number,
        v_patient.insurance_group_number,
        v_patient.insurance_holder_name,
        jsonb_build_object(
            'name', v_patient.first_name || ' ' || v_patient.last_name,
            'dob', v_patient.date_of_birth,
            'phone', v_patient.phone,
            'address', v_patient.address,
            'gender', v_patient.gender
        ),
        jsonb_build_object(
            'provider', v_patient.insurance_provider,
            'policy_number', v_patient.insurance_policy_number,
            'group_number', v_patient.insurance_group_number,
            'holder_name', v_patient.insurance_holder_name,
            'holder_relationship', v_patient.insurance_holder_relationship,
            'valid_until', v_patient.insurance_valid_until
        ),
        CASE WHEN v_provider IS NOT NULL THEN jsonb_build_object(
            'name', v_provider.full_name,
            'license_number', v_provider.license_number,
            'specialty', v_provider.specialty,
            'facility_name', v_provider.facility_name,
            'facility_address', v_provider.facility_address
        ) ELSE NULL END,
        CASE WHEN v_clinical_note IS NOT NULL THEN jsonb_build_object(
            'note_id', v_clinical_note.id,
            'note_type', v_clinical_note.note_type,
            'subjective', v_clinical_note.subjective,
            'objective', v_clinical_note.objective,
            'assessment', v_clinical_note.assessment,
            'plan', v_clinical_note.plan,
            'icd10_codes', v_clinical_note.icd10_codes,
            'signed_at', v_clinical_note.signed_at
        ) ELSE NULL END,
        COALESCE(v_bill.services, '[]'::JSONB),
        COALESCE(v_bill.total, 0),
        CASE WHEN v_clinical_note IS NOT NULL THEN v_clinical_note.icd10_codes ELSE '[]'::JSONB END,
        'DRAFT',
        v_bill.service_date
    ) RETURNING id INTO v_claim_id;
    
    -- Link claim to bill
    UPDATE billing_records SET claim_id = v_claim_id WHERE id = p_bill_id;
    
    RETURN v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETE
-- =====================================================
