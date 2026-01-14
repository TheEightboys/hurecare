-- =====================================================
-- INVESTIGATIONS MODULE - Lab & Imaging Tests
-- Generated: January 14, 2026
-- =====================================================

-- =====================================================
-- 1. LAB INVESTIGATIONS (Master Data)
-- =====================================================
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

-- Create indexes for lab_investigations
CREATE INDEX IF NOT EXISTS idx_lab_investigations_name ON public.lab_investigations(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_investigations_category ON public.lab_investigations(category);
CREATE INDEX IF NOT EXISTS idx_lab_investigations_active ON public.lab_investigations(is_active);

-- Enable RLS on lab_investigations
ALTER TABLE public.lab_investigations ENABLE ROW LEVEL SECURITY;

-- Lab investigations policies
CREATE POLICY "Authenticated users can view lab investigations" ON public.lab_investigations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create lab investigations" ON public.lab_investigations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update lab investigations" ON public.lab_investigations
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete lab investigations" ON public.lab_investigations
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 2. IMAGING INVESTIGATIONS (Master Data)
-- =====================================================
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

-- Create indexes for imaging_investigations
CREATE INDEX IF NOT EXISTS idx_imaging_investigations_modality ON public.imaging_investigations(modality);
CREATE INDEX IF NOT EXISTS idx_imaging_investigations_region ON public.imaging_investigations(body_region);
CREATE INDEX IF NOT EXISTS idx_imaging_investigations_active ON public.imaging_investigations(is_active);

-- Enable RLS on imaging_investigations
ALTER TABLE public.imaging_investigations ENABLE ROW LEVEL SECURITY;

-- Imaging investigations policies
CREATE POLICY "Authenticated users can view imaging investigations" ON public.imaging_investigations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create imaging investigations" ON public.imaging_investigations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update imaging investigations" ON public.imaging_investigations
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete imaging investigations" ON public.imaging_investigations
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 3. PATIENT INVESTIGATIONS (Patient-specific orders)
-- =====================================================
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

-- Create indexes for patient_investigations
CREATE INDEX IF NOT EXISTS idx_patient_investigations_patient ON public.patient_investigations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_provider ON public.patient_investigations(provider_id);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_date ON public.patient_investigations(investigation_date);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_type ON public.patient_investigations(investigation_type);
CREATE INDEX IF NOT EXISTS idx_patient_investigations_status ON public.patient_investigations(status);

-- Enable RLS on patient_investigations
ALTER TABLE public.patient_investigations ENABLE ROW LEVEL SECURITY;

-- Patient investigations policies
CREATE POLICY "Authenticated users can view patient investigations" ON public.patient_investigations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patient investigations" ON public.patient_investigations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patient investigations" ON public.patient_investigations
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete patient investigations" ON public.patient_investigations
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 4. TRIGGER FOR UPDATED_AT
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
