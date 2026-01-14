-- =====================================================
-- COMPREHENSIVE FIX MIGRATION
-- January 15, 2026
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. CREATE BILLING TABLE
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID,
    appointment_id UUID,
    services JSONB DEFAULT '[]',
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    balance DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    payer_type TEXT,
    paid_at TIMESTAMPTZ,
    insurance_claim_id UUID,
    payments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view billing" ON public.billing;
CREATE POLICY "Authenticated can view billing" ON public.billing
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert billing" ON public.billing;
CREATE POLICY "Authenticated can insert billing" ON public.billing
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update billing" ON public.billing;
CREATE POLICY "Authenticated can update billing" ON public.billing
    FOR UPDATE TO authenticated USING (true);

-- 2. ADD BILLING_ID TO INSURANCE_CLAIMS
ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS billing_id UUID REFERENCES public.billing(id);

-- 3. FIX PROFILE RLS
DROP POLICY IF EXISTS "Users can view approved providers" ON public.profiles;
CREATE POLICY "Users can view approved providers" ON public.profiles
    FOR SELECT TO authenticated
    USING (role IN ('provider', 'admin', 'super_admin'));

-- 4. MAKE APPOINTMENTS PROVIDER_ID NULLABLE
ALTER TABLE public.appointments 
    ALTER COLUMN provider_id DROP NOT NULL;

-- 5. FIX INTAKE_FORMS COLUMNS
ALTER TABLE public.intake_forms 
    ADD COLUMN IF NOT EXISTS token TEXT;

ALTER TABLE public.intake_forms 
    ADD COLUMN IF NOT EXISTS phone_last_4 TEXT;

ALTER TABLE public.intake_forms 
    ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';

-- 6. ADD MISSING SNAPSHOT COLUMNS TO INSURANCE_CLAIMS
ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS patient_snapshot JSONB;

ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS insurance_snapshot JSONB;

ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS provider_snapshot JSONB;

ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS clinical_notes_snapshot JSONB;

ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]';

ALTER TABLE public.insurance_claims 
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0;

-- DONE
