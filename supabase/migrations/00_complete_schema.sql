-- =====================================================
-- HURE CARE - Complete Database Schema
-- Healthcare ERP Platform for Kenya/East Africa
-- Generated: January 7, 2026
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (Doctor/Staff Onboarding)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'provider' CHECK (role IN ('super_admin', 'admin', 'provider', 'staff', 'billing')),
    account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')),
    specialty TEXT,
    license_number TEXT,
    facility_name TEXT,
    facility_address TEXT,
    bio TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON public.profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT,
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT[] DEFAULT '{}',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_group_number TEXT,
    insurance_holder_name TEXT,
    insurance_holder_relationship TEXT CHECK (insurance_holder_relationship IN ('Self', 'Spouse', 'Child', 'Parent', 'Other')),
    insurance_valid_until DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for patients
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_insurance_provider ON public.patients(insurance_provider);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patients policies
CREATE POLICY "Authenticated users can view patients" ON public.patients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patients" ON public.patients
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" ON public.patients
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 3. APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow-up', 'procedure', 'emergency', 'telehealth')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON public.appointments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create appointments" ON public.appointments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments" ON public.appointments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete appointments" ON public.appointments
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 4. CLINICAL NOTES TABLE (SOAP Notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    note_type TEXT DEFAULT 'soap' CHECK (note_type IN ('soap', 'progress', 'procedure', 'referral', 'discharge')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'signed', 'amended')),
    
    -- SOAP Note fields
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    
    -- ICD-10 Codes (stored as JSON array)
    icd10_codes JSONB DEFAULT '[]',
    
    -- CPT Codes for billing
    cpt_codes JSONB DEFAULT '[]',
    
    -- AI-assisted fields
    ai_transcript TEXT,
    ai_summary TEXT,
    ai_suggestions JSONB,
    
    -- Compliance
    signed_at TIMESTAMPTZ,
    signed_by UUID REFERENCES public.profiles(id),
    signature_hash TEXT,
    
    -- Metadata
    session_duration_minutes INTEGER,
    audio_recording_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for clinical notes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_provider ON public.clinical_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_status ON public.clinical_notes(status);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_type ON public.clinical_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_created ON public.clinical_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_signed ON public.clinical_notes(signed_at);

-- Enable RLS on clinical notes
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Clinical notes policies
CREATE POLICY "Authenticated users can view clinical notes" ON public.clinical_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create clinical notes" ON public.clinical_notes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clinical notes" ON public.clinical_notes
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 5. REFERRAL NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.referral_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    referring_provider_id UUID REFERENCES public.profiles(id),
    clinical_note_id UUID REFERENCES public.clinical_notes(id),
    
    -- Referral details
    referral_type TEXT CHECK (referral_type IN ('specialist', 'hospital', 'lab', 'imaging', 'therapy', 'other')),
    urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergent')),
    referred_to_name TEXT,
    referred_to_specialty TEXT,
    referred_to_facility TEXT,
    referred_to_phone TEXT,
    referred_to_email TEXT,
    referred_to_address TEXT,
    
    -- Clinical information
    reason_for_referral TEXT,
    clinical_summary TEXT,
    relevant_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    icd10_codes JSONB DEFAULT '[]',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'scheduled', 'completed', 'cancelled')),
    
    -- Tracking
    sent_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    scheduled_date DATE,
    completed_at TIMESTAMPTZ,
    outcome_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for referral notes
CREATE INDEX IF NOT EXISTS idx_referral_notes_patient ON public.referral_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_referral_notes_provider ON public.referral_notes(referring_provider_id);
CREATE INDEX IF NOT EXISTS idx_referral_notes_status ON public.referral_notes(status);

-- Enable RLS on referral notes
ALTER TABLE public.referral_notes ENABLE ROW LEVEL SECURITY;

-- Referral notes policies
CREATE POLICY "Authenticated users can view referral notes" ON public.referral_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create referral notes" ON public.referral_notes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update referral notes" ON public.referral_notes
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 6. INTAKE FORMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.intake_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    form_type TEXT DEFAULT 'new_patient' CHECK (form_type IN ('new_patient', 'medical_history', 'consent', 'insurance', 'custom')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'approved')),
    
    -- Form data stored as JSON
    form_data JSONB DEFAULT '{}',
    
    -- Submission tracking
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Public access token for patient portal
    access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for intake forms
CREATE INDEX IF NOT EXISTS idx_intake_forms_patient ON public.intake_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_status ON public.intake_forms(status);
CREATE INDEX IF NOT EXISTS idx_intake_forms_token ON public.intake_forms(access_token);

-- Enable RLS on intake forms
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Intake forms policies
CREATE POLICY "Authenticated users can view intake forms" ON public.intake_forms
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create intake forms" ON public.intake_forms
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update intake forms" ON public.intake_forms
    FOR UPDATE TO authenticated USING (true);

-- Public access policy for patient submission
CREATE POLICY "Public can access forms via token" ON public.intake_forms
    FOR SELECT TO anon USING (access_token IS NOT NULL AND expires_at > NOW());

CREATE POLICY "Public can update forms via token" ON public.intake_forms
    FOR UPDATE TO anon USING (access_token IS NOT NULL AND expires_at > NOW());

-- =====================================================
-- 7. BILLING RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.billing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    clinical_note_id UUID REFERENCES public.clinical_notes(id),
    appointment_id UUID REFERENCES public.appointments(id),
    
    -- Billing details
    invoice_number TEXT UNIQUE,
    description TEXT,
    
    -- Line items as JSON array
    line_items JSONB DEFAULT '[]',
    
    -- Amounts
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    balance_due DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'claims_ready')),
    
    -- Payment tracking
    payment_method TEXT,
    payment_date DATE,
    payment_reference TEXT,
    
    -- Insurance
    insurance_claim_id UUID,
    insurance_amount DECIMAL(10, 2) DEFAULT 0,
    patient_responsibility DECIMAL(10, 2) DEFAULT 0,
    
    -- Dates
    service_date DATE,
    due_date DATE,
    
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for billing records
CREATE INDEX IF NOT EXISTS idx_billing_patient ON public.billing_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing_records(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoice ON public.billing_records(invoice_number);
CREATE INDEX IF NOT EXISTS idx_billing_service_date ON public.billing_records(service_date);

-- Enable RLS on billing records
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- Billing policies
CREATE POLICY "Authenticated users can view billing" ON public.billing_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create billing" ON public.billing_records
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update billing" ON public.billing_records
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 8. INSURANCE CLAIMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    billing_record_id UUID REFERENCES public.billing_records(id),
    clinical_note_id UUID REFERENCES public.clinical_notes(id),
    
    -- Claim identification
    claim_number TEXT UNIQUE,
    external_claim_id TEXT, -- ID from insurance company
    
    -- Insurance details
    insurance_provider TEXT NOT NULL,
    policy_number TEXT,
    group_number TEXT,
    subscriber_name TEXT,
    subscriber_id TEXT,
    subscriber_relationship TEXT,
    
    -- Provider details (immutable snapshot)
    provider_name TEXT,
    provider_npi TEXT,
    provider_tax_id TEXT,
    facility_name TEXT,
    facility_address TEXT,
    
    -- Patient snapshot (immutable)
    patient_name TEXT,
    patient_dob DATE,
    patient_address TEXT,
    
    -- Diagnosis codes (ICD-10)
    diagnosis_codes JSONB DEFAULT '[]',
    
    -- Procedure codes (CPT)
    procedure_codes JSONB DEFAULT '[]',
    
    -- Amounts
    billed_amount DECIMAL(10, 2) DEFAULT 0,
    allowed_amount DECIMAL(10, 2),
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    patient_responsibility DECIMAL(10, 2) DEFAULT 0,
    adjustment_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'ready', 'submitted', 'acknowledged', 'pending', 
        'approved', 'partial', 'denied', 'appealed', 'paid', 'closed'
    )),
    
    -- Dates
    service_date DATE,
    submission_date TIMESTAMPTZ,
    response_date TIMESTAMPTZ,
    payment_date DATE,
    
    -- Rejection/Denial handling
    rejection_reason TEXT,
    rejection_code TEXT,
    rejection_details JSONB,
    appeal_deadline DATE,
    
    -- Payment tracking
    payment_reference TEXT,
    eob_document_url TEXT, -- Explanation of Benefits
    
    -- Claim pack/documentation
    claim_pack_url TEXT,
    supporting_documents JSONB DEFAULT '[]',
    
    -- Audit
    submitted_by UUID REFERENCES public.profiles(id),
    last_action_by UUID REFERENCES public.profiles(id),
    last_action_at TIMESTAMPTZ,
    action_history JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for insurance claims
CREATE INDEX IF NOT EXISTS idx_claims_patient ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_provider ON public.insurance_claims(insurance_provider);
CREATE INDEX IF NOT EXISTS idx_claims_number ON public.insurance_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON public.insurance_claims(service_date);
CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON public.insurance_claims(submission_date);

-- Enable RLS on insurance claims
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- Claims policies
CREATE POLICY "Authenticated users can view claims" ON public.insurance_claims
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create claims" ON public.insurance_claims
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update claims" ON public.insurance_claims
    FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 9. INSURANCE SUBMISSIONS TABLE (Review Workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Patient info (may not exist in system yet)
    patient_id UUID REFERENCES public.patients(id),
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    patient_dob DATE,
    
    -- Insurance details
    insurance_provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    group_number TEXT,
    subscriber_name TEXT,
    subscriber_relationship TEXT DEFAULT 'Self',
    
    -- Document uploads
    insurance_card_front_url TEXT,
    insurance_card_back_url TEXT,
    id_document_url TEXT,
    additional_documents JSONB DEFAULT '[]',
    
    -- Review workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'needs_info')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Verification results
    eligibility_verified BOOLEAN DEFAULT FALSE,
    eligibility_response JSONB,
    coverage_details JSONB,
    
    -- Public access token
    access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for insurance submissions
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_status ON public.insurance_submissions(status);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_patient ON public.insurance_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_token ON public.insurance_submissions(access_token);
CREATE INDEX IF NOT EXISTS idx_insurance_submissions_provider ON public.insurance_submissions(insurance_provider);

-- Enable RLS on insurance submissions
ALTER TABLE public.insurance_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for insurance submissions
CREATE POLICY "Authenticated users can view insurance submissions" ON public.insurance_submissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create insurance submissions" ON public.insurance_submissions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update insurance submissions" ON public.insurance_submissions
    FOR UPDATE TO authenticated USING (true);

-- Public access for patient submission portal
CREATE POLICY "Public can insert insurance submissions" ON public.insurance_submissions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public can view own submission via token" ON public.insurance_submissions
    FOR SELECT TO anon USING (access_token IS NOT NULL AND expires_at > NOW());

-- =====================================================
-- 10. AUDIT LOGS TABLE (for application audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ));

-- =====================================================
-- 11. AUDIT LOG TABLE (legacy - for system-level auditing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies (admin only)
CREATE POLICY "Only admins can view audit log" ON public.audit_log
    FOR SELECT TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- =====================================================
-- 11. ICD-10 CODES REFERENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.icd10_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    is_billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for ICD-10 search
CREATE INDEX IF NOT EXISTS idx_icd10_description ON public.icd10_codes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_icd10_category ON public.icd10_codes(category);

-- Insert common ICD-10 codes
INSERT INTO public.icd10_codes (code, description, category) VALUES
    ('J06.9', 'Acute upper respiratory infection, unspecified', 'Respiratory'),
    ('J18.9', 'Pneumonia, unspecified organism', 'Respiratory'),
    ('J45.909', 'Unspecified asthma, uncomplicated', 'Respiratory'),
    ('I10', 'Essential (primary) hypertension', 'Cardiovascular'),
    ('E11.9', 'Type 2 diabetes mellitus without complications', 'Endocrine'),
    ('E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'Endocrine'),
    ('F32.9', 'Major depressive disorder, single episode, unspecified', 'Mental Health'),
    ('F41.1', 'Generalized anxiety disorder', 'Mental Health'),
    ('M54.5', 'Low back pain', 'Musculoskeletal'),
    ('M79.3', 'Panniculitis, unspecified', 'Musculoskeletal'),
    ('K21.0', 'Gastro-esophageal reflux disease with esophagitis', 'Digestive'),
    ('K29.70', 'Gastritis, unspecified, without bleeding', 'Digestive'),
    ('N39.0', 'Urinary tract infection, site not specified', 'Genitourinary'),
    ('R50.9', 'Fever, unspecified', 'Symptoms'),
    ('R05.9', 'Cough, unspecified', 'Symptoms'),
    ('R51.9', 'Headache, unspecified', 'Symptoms'),
    ('Z00.00', 'Encounter for general adult medical examination without abnormal findings', 'Preventive'),
    ('Z23', 'Encounter for immunization', 'Preventive'),
    ('B34.9', 'Viral infection, unspecified', 'Infectious'),
    ('A09', 'Infectious gastroenteritis and colitis, unspecified', 'Infectious')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 12. CPT CODES REFERENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cpt_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT,
    base_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for CPT search
CREATE INDEX IF NOT EXISTS idx_cpt_description ON public.cpt_codes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_cpt_category ON public.cpt_codes(category);

-- Insert common CPT codes
INSERT INTO public.cpt_codes (code, description, category, base_price) VALUES
    ('99201', 'Office visit, new patient, minimal', 'E/M', 50.00),
    ('99202', 'Office visit, new patient, low complexity', 'E/M', 75.00),
    ('99203', 'Office visit, new patient, moderate complexity', 'E/M', 110.00),
    ('99204', 'Office visit, new patient, moderate to high complexity', 'E/M', 170.00),
    ('99205', 'Office visit, new patient, high complexity', 'E/M', 220.00),
    ('99211', 'Office visit, established patient, minimal', 'E/M', 25.00),
    ('99212', 'Office visit, established patient, straightforward', 'E/M', 50.00),
    ('99213', 'Office visit, established patient, low complexity', 'E/M', 85.00),
    ('99214', 'Office visit, established patient, moderate complexity', 'E/M', 130.00),
    ('99215', 'Office visit, established patient, high complexity', 'E/M', 180.00),
    ('99381', 'Preventive visit, new patient, infant', 'Preventive', 120.00),
    ('99391', 'Preventive visit, established patient, infant', 'Preventive', 100.00),
    ('99395', 'Preventive visit, established patient, 18-39 years', 'Preventive', 150.00),
    ('99396', 'Preventive visit, established patient, 40-64 years', 'Preventive', 160.00),
    ('90471', 'Immunization administration', 'Immunization', 25.00),
    ('36415', 'Venipuncture', 'Laboratory', 15.00),
    ('81002', 'Urinalysis, non-automated', 'Laboratory', 10.00),
    ('85025', 'Complete blood count (CBC)', 'Laboratory', 35.00),
    ('80053', 'Comprehensive metabolic panel', 'Laboratory', 50.00),
    ('71046', 'Chest X-ray, 2 views', 'Radiology', 75.00)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 13. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'appointment', 'clinical', 'billing', 'compliance')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- 14. HELPER FUNCTIONS
-- =====================================================

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.billing_records
    WHERE invoice_number LIKE 'INV-' || year_prefix || '%';
    
    new_number := 'INV-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate claim numbers
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.insurance_claims
    WHERE claim_number LIKE 'CLM-' || year_prefix || '%';
    
    new_number := 'CLM-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
        AND table_name NOT IN ('audit_log')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- =====================================================
-- 15. STORAGE BUCKETS (Run in Supabase Dashboard)
-- =====================================================
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- These are the buckets needed:

-- 1. avatars - For profile pictures
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 2. documents - For clinical documents
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- 3. insurance-docs - For insurance cards and documents
-- INSERT INTO storage.buckets (id, name, public) VALUES ('insurance-docs', 'insurance-docs', false);

-- 4. audio-recordings - For clinical note recordings
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', false);

-- Storage policies (example for avatars bucket):
-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--     FOR INSERT TO authenticated 
--     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view avatars" ON storage.objects
--     FOR SELECT TO public 
--     USING (bucket_id = 'avatars');

-- =====================================================
-- 16. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- To apply this schema:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. Create storage buckets manually in Storage section
-- =====================================================
