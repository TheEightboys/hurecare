-- Migration: Enhanced Profiles for Doctor Onboarding
-- Date: 2026-01-07
-- Purpose: Add professional fields to profiles table for doctor onboarding

-- ==========================================
-- PART 1: Add Professional Fields to Profiles
-- ==========================================

-- Add specialty field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;

-- Add license number field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Add facility name field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_name TEXT;

-- Add facility address field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facility_address TEXT;

-- Add bio field
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ==========================================
-- PART 2: Create Profile Trigger for New Users
-- ==========================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- PART 3: Create Onboarding Status View
-- ==========================================

-- View to check if user has completed onboarding
CREATE OR REPLACE VIEW public.profile_onboarding_status AS
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.specialty,
    p.license_number,
    p.facility_name,
    CASE 
        WHEN p.full_name IS NOT NULL 
            AND p.specialty IS NOT NULL 
            AND p.license_number IS NOT NULL 
        THEN true 
        ELSE false 
    END AS is_onboarded,
    CASE 
        WHEN p.full_name IS NULL THEN 'full_name'
        WHEN p.specialty IS NULL THEN 'specialty'
        WHEN p.license_number IS NULL THEN 'license_number'
        ELSE NULL
    END AS next_required_field
FROM public.profiles p;

-- ==========================================
-- PART 4: Add Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON public.profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_license_number ON public.profiles(license_number);

-- ==========================================
-- PART 5: Audit Log for Profile Changes
-- ==========================================

CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        NEW.user_id,
        'PROFILE_UPDATED',
        'profiles',
        NEW.id,
        jsonb_build_object(
            'changed_fields', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(to_jsonb(NEW))
                WHERE key NOT IN ('created_at', 'updated_at')
                AND (
                    OLD IS NULL 
                    OR to_jsonb(OLD) ->> key IS DISTINCT FROM to_jsonb(NEW) ->> key
                )
            )
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;
CREATE TRIGGER on_profile_change
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();
