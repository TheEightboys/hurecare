-- =====================================================
-- HURE CARE - PRODUCTION READY COMPLETE SCHEMA FIX
-- Generated: January 14, 2026
-- This migration ensures ALL tables have required columns
-- and creates provider activity tracking
-- =====================================================

-- =====================================================
-- PART 1: FIX CLINICAL_NOTES TABLE
-- =====================================================

-- Add all missing columns to clinical_notes
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS single_note TEXT;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'TEXT' CHECK (source_type IN ('AUDIO', 'TEXT'));
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS transcript_reviewed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS transcript_reviewed_at TIMESTAMPTZ;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS transcript_reviewed_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS audio_temp_url TEXT;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS audio_expires_at TIMESTAMPTZ;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS legal_acknowledged BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS legal_acknowledged_at TIMESTAMPTZ;

-- Create indexes for clinical_notes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_transcript_reviewed ON public.clinical_notes(transcript_reviewed);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_source_type ON public.clinical_notes(source_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_last_accessed ON public.clinical_notes(last_accessed_at);

-- =====================================================
-- PART 2: FIX INSURANCE_CLAIMS TABLE
-- =====================================================

-- Add snapshot columns to insurance_claims
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS patient_snapshot JSONB;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS insurance_snapshot JSONB;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS provider_snapshot JSONB;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS clinical_notes_snapshot JSONB;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_pack_pdf_url TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS claim_pack_generated_at TIMESTAMPTZ;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS preauth_number TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS preauth_status TEXT;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS preauth_approved_at TIMESTAMPTZ;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS preauth_valid_until DATE;
ALTER TABLE public.insurance_claims ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- PART 2.5: FIX INTAKE_FORMS TABLE
-- =====================================================

-- Add phone_last_4 column to intake_forms
ALTER TABLE public.intake_forms ADD COLUMN IF NOT EXISTS phone_last_4 TEXT;

-- =====================================================
-- PART 2.6: FIX PROFILES TABLE
-- =====================================================

-- Ensure profiles table has all required columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- =====================================================
-- PART 2.7: FIX APPOINTMENTS TABLE
-- =====================================================

-- Add missing columns to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reason_for_visit TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'ADVANCE' CHECK (booking_type IN ('SAME_DAY', 'ADVANCE'));
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmation_indicator TEXT CHECK (confirmation_indicator IN ('C', 'NC', 'LM'));
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmation_method TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmation_attempts INTEGER DEFAULT 0;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS last_confirmation_attempt TIMESTAMPTZ;

-- Rename 'reason' to 'notes' if it exists, or create notes column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'reason'
    ) THEN
        ALTER TABLE public.appointments RENAME COLUMN reason TO notes;
    ELSE
        ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT;
    END IF;
END $$;

-- Update status enum values if needed (ensure UPPERCASE)
-- Note: This will be handled by the constraint check

-- =====================================================
-- PART 3: PROVIDER ACTIVITY TRACKING
-- =====================================================

-- Create provider_activity table for tracking doctor statistics
CREATE TABLE IF NOT EXISTS public.provider_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Patient counts
    patients_seen INTEGER DEFAULT 0,
    new_patients INTEGER DEFAULT 0,
    follow_up_patients INTEGER DEFAULT 0,
    
    -- Appointment metrics
    appointments_scheduled INTEGER DEFAULT 0,
    appointments_completed INTEGER DEFAULT 0,
    appointments_cancelled INTEGER DEFAULT 0,
    appointments_no_show INTEGER DEFAULT 0,
    
    -- Clinical documentation
    notes_created INTEGER DEFAULT 0,
    notes_signed INTEGER DEFAULT 0,
    notes_pending INTEGER DEFAULT 0,
    
    -- Revenue metrics
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    invoices_created INTEGER DEFAULT 0,
    
    -- Investigation metrics
    lab_orders INTEGER DEFAULT 0,
    imaging_orders INTEGER DEFAULT 0,
    
    -- Time metrics
    total_session_minutes INTEGER DEFAULT 0,
    average_visit_minutes INTEGER DEFAULT 0,
    
    -- Login/session tracking
    first_login_at TIMESTAMPTZ,
    last_logout_at TIMESTAMPTZ,
    active_hours DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(provider_id, activity_date)
);

-- Create indexes for provider_activity
CREATE INDEX IF NOT EXISTS idx_provider_activity_provider ON public.provider_activity(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_activity_date ON public.provider_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_provider_activity_provider_date ON public.provider_activity(provider_id, activity_date);

-- Enable RLS on provider_activity
ALTER TABLE public.provider_activity ENABLE ROW LEVEL SECURITY;

-- Provider activity policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.provider_activity;
CREATE POLICY "Users can view own activity" ON public.provider_activity
    FOR SELECT USING (auth.uid() = provider_id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

DROP POLICY IF EXISTS "System can insert activity" ON public.provider_activity;
CREATE POLICY "System can insert activity" ON public.provider_activity
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update activity" ON public.provider_activity;
CREATE POLICY "System can update activity" ON public.provider_activity
    FOR UPDATE USING (true);

-- =====================================================
-- PART 4: INVESTIGATION TABLES
-- =====================================================

-- Lab investigations table
CREATE TABLE IF NOT EXISTS public.lab_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name TEXT NOT NULL,
    category TEXT,
    sample_type TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    normal_range TEXT,
    turnaround_time TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_investigations_name ON public.lab_investigations(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_investigations_category ON public.lab_investigations(category);
CREATE INDEX IF NOT EXISTS idx_lab_investigations_active ON public.lab_investigations(is_active);

ALTER TABLE public.lab_investigations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view lab investigations" ON public.lab_investigations;
CREATE POLICY "Authenticated users can view lab investigations" ON public.lab_investigations
    FOR SELECT TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can create lab investigations" ON public.lab_investigations;
CREATE POLICY "Authenticated users can create lab investigations" ON public.lab_investigations
    FOR INSERT TO authenticated WITH CHECK (true);
    
DROP POLICY IF EXISTS "Authenticated users can update lab investigations" ON public.lab_investigations;
CREATE POLICY "Authenticated users can update lab investigations" ON public.lab_investigations
    FOR UPDATE TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can delete lab investigations" ON public.lab_investigations;
CREATE POLICY "Authenticated users can delete lab investigations" ON public.lab_investigations
    FOR DELETE TO authenticated USING (true);

-- Imaging investigations table
CREATE TABLE IF NOT EXISTS public.imaging_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modality TEXT NOT NULL,
    body_region TEXT,
    view_protocol TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    preparation_instructions TEXT,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imaging_investigations_modality ON public.imaging_investigations(modality);
CREATE INDEX IF NOT EXISTS idx_imaging_investigations_region ON public.imaging_investigations(body_region);
CREATE INDEX IF NOT EXISTS idx_imaging_investigations_active ON public.imaging_investigations(is_active);

ALTER TABLE public.imaging_investigations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view imaging investigations" ON public.imaging_investigations;
CREATE POLICY "Authenticated users can view imaging investigations" ON public.imaging_investigations
    FOR SELECT TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can create imaging investigations" ON public.imaging_investigations;
CREATE POLICY "Authenticated users can create imaging investigations" ON public.imaging_investigations
    FOR INSERT TO authenticated WITH CHECK (true);
    
DROP POLICY IF EXISTS "Authenticated users can update imaging investigations" ON public.imaging_investigations;
CREATE POLICY "Authenticated users can update imaging investigations" ON public.imaging_investigations
    FOR UPDATE TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can delete imaging investigations" ON public.imaging_investigations;
CREATE POLICY "Authenticated users can delete imaging investigations" ON public.imaging_investigations
    FOR DELETE TO authenticated USING (true);

-- Patient investigations table
CREATE TABLE IF NOT EXISTS public.patient_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id),
    appointment_id UUID REFERENCES public.appointments(id),
    investigation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    investigation_type TEXT NOT NULL CHECK (investigation_type IN ('lab', 'imaging')),
    lab_investigation_id UUID REFERENCES public.lab_investigations(id),
    imaging_investigation_id UUID REFERENCES public.imaging_investigations(id),
    status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
    results TEXT,
    result_file_url TEXT,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_investigations_patient ON public.patient_investigations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_provider ON public.patient_investigations(provider_id);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_date ON public.patient_investigations(investigation_date);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_type ON public.patient_investigations(investigation_type);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_status ON public.patient_investigations(status);

ALTER TABLE public.patient_investigations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view patient investigations" ON public.patient_investigations;
CREATE POLICY "Authenticated users can view patient investigations" ON public.patient_investigations
    FOR SELECT TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can create patient investigations" ON public.patient_investigations;
CREATE POLICY "Authenticated users can create patient investigations" ON public.patient_investigations
    FOR INSERT TO authenticated WITH CHECK (true);
    
DROP POLICY IF EXISTS "Authenticated users can update patient investigations" ON public.patient_investigations;
CREATE POLICY "Authenticated users can update patient investigations" ON public.patient_investigations
    FOR UPDATE TO authenticated USING (true);
    
DROP POLICY IF EXISTS "Authenticated users can delete patient investigations" ON public.patient_investigations;
CREATE POLICY "Authenticated users can delete patient investigations" ON public.patient_investigations
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- PART 5: FUNCTIONS FOR PROVIDER ACTIVITY TRACKING
-- =====================================================

-- Function to increment provider activity metrics
CREATE OR REPLACE FUNCTION increment_provider_activity(
    p_provider_id UUID,
    p_metric TEXT,
    p_value INTEGER DEFAULT 1,
    p_revenue DECIMAL DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.provider_activity (provider_id, activity_date)
    VALUES (p_provider_id, CURRENT_DATE)
    ON CONFLICT (provider_id, activity_date) DO NOTHING;
    
    CASE p_metric
        WHEN 'patients_seen' THEN
            UPDATE public.provider_activity 
            SET patients_seen = patients_seen + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'new_patients' THEN
            UPDATE public.provider_activity 
            SET new_patients = new_patients + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'appointments_completed' THEN
            UPDATE public.provider_activity 
            SET appointments_completed = appointments_completed + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'notes_created' THEN
            UPDATE public.provider_activity 
            SET notes_created = notes_created + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'notes_signed' THEN
            UPDATE public.provider_activity 
            SET notes_signed = notes_signed + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'revenue_generated' THEN
            UPDATE public.provider_activity 
            SET revenue_generated = revenue_generated + p_revenue 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'lab_orders' THEN
            UPDATE public.provider_activity 
            SET lab_orders = lab_orders + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
        WHEN 'imaging_orders' THEN
            UPDATE public.provider_activity 
            SET imaging_orders = imaging_orders + p_value 
            WHERE provider_id = p_provider_id AND activity_date = CURRENT_DATE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 6: TRIGGERS FOR AUTO-TRACKING
-- =====================================================

-- Trigger: Track when appointments are completed
CREATE OR REPLACE FUNCTION track_appointment_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        PERFORM increment_provider_activity(NEW.provider_id, 'appointments_completed', 1);
        PERFORM increment_provider_activity(NEW.provider_id, 'patients_seen', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_appointment_completed ON public.appointments;
CREATE TRIGGER on_appointment_completed
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM 'COMPLETED')
    EXECUTE FUNCTION track_appointment_completion();

-- Trigger: Track when clinical notes are created
CREATE OR REPLACE FUNCTION track_note_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.provider_id IS NOT NULL THEN
        PERFORM increment_provider_activity(NEW.provider_id, 'notes_created', 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_note_created ON public.clinical_notes;
CREATE TRIGGER on_note_created
    AFTER INSERT ON public.clinical_notes
    FOR EACH ROW
    EXECUTE FUNCTION track_note_creation();

-- Trigger: Track when clinical notes are signed
CREATE OR REPLACE FUNCTION track_note_signing()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.signed_at IS NOT NULL AND OLD.signed_at IS NULL THEN
        IF NEW.signed_by IS NOT NULL THEN
            PERFORM increment_provider_activity(NEW.signed_by, 'notes_signed', 1);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_note_signed ON public.clinical_notes;
CREATE TRIGGER on_note_signed
    AFTER UPDATE ON public.clinical_notes
    FOR EACH ROW
    WHEN (NEW.signed_at IS NOT NULL AND OLD.signed_at IS NULL)
    EXECUTE FUNCTION track_note_signing();

-- Trigger: Track investigation orders
CREATE OR REPLACE FUNCTION track_investigation_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.provider_id IS NOT NULL THEN
        IF NEW.investigation_type = 'lab' THEN
            PERFORM increment_provider_activity(NEW.provider_id, 'lab_orders', 1);
        ELSIF NEW.investigation_type = 'imaging' THEN
            PERFORM increment_provider_activity(NEW.provider_id, 'imaging_orders', 1);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_investigation_ordered ON public.patient_investigations;
CREATE TRIGGER on_investigation_ordered
    AFTER INSERT ON public.patient_investigations
    FOR EACH ROW
    EXECUTE FUNCTION track_investigation_order();

-- =====================================================
-- PART 7: UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lab_investigations_updated_at ON public.lab_investigations;
CREATE TRIGGER update_lab_investigations_updated_at
    BEFORE UPDATE ON public.lab_investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_imaging_investigations_updated_at ON public.imaging_investigations;
CREATE TRIGGER update_imaging_investigations_updated_at
    BEFORE UPDATE ON public.imaging_investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_investigations_updated_at ON public.patient_investigations;
CREATE TRIGGER update_patient_investigations_updated_at
    BEFORE UPDATE ON public.patient_investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_activity_updated_at ON public.provider_activity;
CREATE TRIGGER update_provider_activity_updated_at
    BEFORE UPDATE ON public.provider_activity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 8: HELPER FUNCTION TO GET PROVIDER STATISTICS
-- =====================================================

CREATE OR REPLACE FUNCTION get_provider_stats(
    p_provider_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_patients_seen BIGINT,
    total_new_patients BIGINT,
    total_appointments BIGINT,
    total_notes_signed BIGINT,
    total_revenue NUMERIC,
    total_lab_orders BIGINT,
    total_imaging_orders BIGINT,
    average_patients_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(pa.patients_seen), 0)::BIGINT,
        COALESCE(SUM(pa.new_patients), 0)::BIGINT,
        COALESCE(SUM(pa.appointments_completed), 0)::BIGINT,
        COALESCE(SUM(pa.notes_signed), 0)::BIGINT,
        COALESCE(SUM(pa.revenue_generated), 0),
        COALESCE(SUM(pa.lab_orders), 0)::BIGINT,
        COALESCE(SUM(pa.imaging_orders), 0)::BIGINT,
        COALESCE(AVG(pa.patients_seen), 0)
    FROM public.provider_activity pa
    WHERE pa.provider_id = p_provider_id
        AND pa.activity_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ HURE Care Production Schema Migration Complete!';
    RAISE NOTICE '✅ Clinical notes enhanced with AI features';
    RAISE NOTICE '✅ Insurance claims schema updated';
    RAISE NOTICE '✅ Provider activity tracking enabled';
    RAISE NOTICE '✅ Investigation module created';
    RAISE NOTICE '✅ All triggers and functions deployed';
END $$;
