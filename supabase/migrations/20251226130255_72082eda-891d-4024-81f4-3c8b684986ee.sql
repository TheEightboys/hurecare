-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'billing_staff', 'receptionist');

-- Create note_source_type enum
CREATE TYPE public.note_source_type AS ENUM ('AUDIO', 'TEXT');

-- Create note_status enum
CREATE TYPE public.note_status AS ENUM ('DRAFT', 'SIGNED');

-- Create appointment_status enum
CREATE TYPE public.appointment_status AS ENUM ('SCHEDULED', 'IN_SESSION', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Create booking_type enum
CREATE TYPE public.booking_type AS ENUM ('SAME_DAY', 'ADVANCE');

-- Create confirmation_indicator enum
CREATE TYPE public.confirmation_indicator AS ENUM ('C', 'NC', 'LM');

-- Create claim_status enum
CREATE TYPE public.claim_status AS ENUM ('DRAFT', 'READY', 'SUBMITTED_MANUAL', 'PAID', 'REJECTED');

-- Create intake_form_status enum
CREATE TYPE public.intake_form_status AS ENUM ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'provider',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, role)
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    -- Insurance fields (Demographics is source of truth)
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_group_number TEXT,
    insurance_holder_name TEXT,
    insurance_holder_relationship TEXT,
    insurance_valid_until DATE,
    -- Medical info
    allergies TEXT[],
    blood_type TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status public.appointment_status DEFAULT 'SCHEDULED',
    booking_type public.booking_type NOT NULL,
    confirmation_indicator public.confirmation_indicator DEFAULT 'NC',
    confirmation_method TEXT,
    confirmation_attempts INTEGER DEFAULT 0,
    last_confirmation_attempt TIMESTAMP WITH TIME ZONE,
    reason_for_visit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create clinical_notes table (SOAP notes)
CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    -- Source tracking
    source_type public.note_source_type NOT NULL DEFAULT 'TEXT',
    transcript TEXT,
    transcript_reviewed BOOLEAN DEFAULT FALSE,
    transcript_reviewed_at TIMESTAMP WITH TIME ZONE,
    transcript_reviewed_by UUID REFERENCES auth.users(id),
    -- SOAP fields
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    single_note TEXT,
    -- ICD-10 codes (selected by clinician)
    icd10_codes JSONB DEFAULT '[]'::jsonb,
    -- Status
    status public.note_status DEFAULT 'DRAFT',
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES auth.users(id),
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_edited_by UUID REFERENCES auth.users(id)
);

-- Create referral_notes table
CREATE TABLE public.referral_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    source_clinical_note_id UUID REFERENCES public.clinical_notes(id),
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    -- Referral fields
    receiving_facility TEXT,
    urgency TEXT DEFAULT 'Routine',
    reason_for_referral TEXT NOT NULL,
    clinical_summary TEXT,
    investigations TEXT,
    treatment_given TEXT,
    medications TEXT,
    allergies TEXT,
    requested_action TEXT,
    -- Status
    status public.note_status DEFAULT 'DRAFT',
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES auth.users(id),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create billing table
CREATE TABLE public.billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    provider_id UUID REFERENCES auth.users(id) NOT NULL,
    -- Billing details
    payer_type TEXT DEFAULT 'Patient', -- 'Patient' or 'Insurance'
    -- Services (line items)
    services JSONB DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    -- Status
    status TEXT DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create insurance_claims table
CREATE TABLE public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_id UUID REFERENCES public.billing(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    -- Snapshot of insurance at time of claim
    insurance_snapshot JSONB NOT NULL,
    -- Claim details
    icd10_codes JSONB DEFAULT '[]'::jsonb,
    services JSONB DEFAULT '[]'::jsonb,
    total_amount DECIMAL(10,2) NOT NULL,
    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,
    -- Status
    status public.claim_status DEFAULT 'DRAFT',
    submitted_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create intake_forms table
CREATE TABLE public.intake_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    form_type TEXT NOT NULL, -- 'MEDICAL_HISTORY' or 'INSURANCE'
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Verification
    phone_last_4 TEXT NOT NULL,
    verification_attempts INTEGER DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE,
    -- Form data
    answers JSONB,
    pdf_url TEXT,
    -- Status
    status public.intake_form_status DEFAULT 'PENDING_REVIEW',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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
          AND role = _role
    )
$$;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'provider');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referral_notes_updated_at BEFORE UPDATE ON public.referral_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON public.billing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for patients (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patients" ON public.patients FOR DELETE TO authenticated USING (true);

-- RLS Policies for appointments
CREATE POLICY "Authenticated users can view appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

-- RLS Policies for clinical_notes
CREATE POLICY "Authenticated users can view clinical notes" ON public.clinical_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create clinical notes" ON public.clinical_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clinical notes" ON public.clinical_notes FOR UPDATE TO authenticated USING (true);

-- RLS Policies for referral_notes
CREATE POLICY "Authenticated users can view referral notes" ON public.referral_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create referral notes" ON public.referral_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update referral notes" ON public.referral_notes FOR UPDATE TO authenticated USING (true);

-- RLS Policies for billing
CREATE POLICY "Authenticated users can view billing" ON public.billing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create billing" ON public.billing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update billing" ON public.billing FOR UPDATE TO authenticated USING (true);

-- RLS Policies for insurance_claims
CREATE POLICY "Authenticated users can view claims" ON public.insurance_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create claims" ON public.insurance_claims FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update claims" ON public.insurance_claims FOR UPDATE TO authenticated USING (true);

-- RLS Policies for intake_forms (public read for form submission)
CREATE POLICY "Public can view intake forms by token" ON public.intake_forms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create intake forms" ON public.intake_forms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update intake forms" ON public.intake_forms FOR UPDATE TO authenticated USING (true);

-- RLS Policies for audit_logs (authenticated can insert and view own)
CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);