-- =====================================================
-- FIX: Add missing columns to clinical_notes table
-- Generated: January 14, 2026
-- This migration adds the single_note and other missing columns
-- =====================================================

-- Add single_note column (used for free-form clinical notes)
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS single_note TEXT;

-- Add source_type column (tracks if note came from AUDIO or TEXT)
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'TEXT' CHECK (source_type IN ('AUDIO', 'TEXT'));

-- Add transcript column (stores audio transcription)
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Add transcript review tracking
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS transcript_reviewed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS transcript_reviewed_at TIMESTAMPTZ;

ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS transcript_reviewed_by UUID REFERENCES public.profiles(id);

-- Add access tracking
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id);

-- Add audio URL fields
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS audio_temp_url TEXT;

ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS audio_expires_at TIMESTAMPTZ;

-- Add legal acknowledgment fields
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS legal_acknowledged BOOLEAN DEFAULT FALSE;

ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS legal_acknowledged_at TIMESTAMPTZ;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_clinical_notes_transcript_reviewed ON public.clinical_notes(transcript_reviewed);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_source_type ON public.clinical_notes(source_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_last_accessed ON public.clinical_notes(last_accessed_at);

-- =====================================================
-- Also ensure the investigations migration tables exist
-- (Run this after 20260114_investigations.sql)
-- =====================================================

-- Verify lab_investigations exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_investigations') THEN
        CREATE TABLE public.lab_investigations (
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
        
        ALTER TABLE public.lab_investigations ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Authenticated users can view lab investigations" ON public.lab_investigations
            FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Authenticated users can create lab investigations" ON public.lab_investigations
            FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Authenticated users can update lab investigations" ON public.lab_investigations
            FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "Authenticated users can delete lab investigations" ON public.lab_investigations
            FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- Verify imaging_investigations exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imaging_investigations') THEN
        CREATE TABLE public.imaging_investigations (
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
        
        ALTER TABLE public.imaging_investigations ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Authenticated users can view imaging investigations" ON public.imaging_investigations
            FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Authenticated users can create imaging investigations" ON public.imaging_investigations
            FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Authenticated users can update imaging investigations" ON public.imaging_investigations
            FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "Authenticated users can delete imaging investigations" ON public.imaging_investigations
            FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- Verify patient_investigations exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_investigations') THEN
        CREATE TABLE public.patient_investigations (
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
        
        ALTER TABLE public.patient_investigations ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Authenticated users can view patient investigations" ON public.patient_investigations
            FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Authenticated users can create patient investigations" ON public.patient_investigations
            FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Authenticated users can update patient investigations" ON public.patient_investigations
            FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "Authenticated users can delete patient investigations" ON public.patient_investigations
            FOR DELETE TO authenticated USING (true);
    END IF;
END $$;
