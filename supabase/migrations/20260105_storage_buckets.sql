-- Storage Buckets Setup for HURE Care
-- Run this in Supabase SQL Editor to create required storage buckets and policies

-- Note: These statements use the storage schema API
-- Run after the main migration (20260105_production_hardening.sql)

-- ==========================================
-- CREATE STORAGE BUCKETS
-- ==========================================

-- Photos bucket (avatars, signatures)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Audio recordings bucket (private, with TTL)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('audio-recordings', 'audio-recordings', false, 52428800) -- 50MB limit
ON CONFLICT (id) DO NOTHING;

-- Documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 104857600) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE POLICIES FOR AVATARS (PUBLIC)
-- ==========================================

-- Anyone can view avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- STORAGE POLICIES FOR AUDIO RECORDINGS (PRIVATE)
-- ==========================================

-- Users can view their own audio recordings
CREATE POLICY "Users can view own audio" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'audio-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload audio recordings
CREATE POLICY "Users can upload audio" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'audio-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own audio recordings
CREATE POLICY "Users can delete own audio" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'audio-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- STORAGE POLICIES FOR DOCUMENTS (PRIVATE)
-- ==========================================

-- Authenticated users can view documents (clinical staff need access)
CREATE POLICY "Authenticated can view documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Authenticated users can upload documents
CREATE POLICY "Authenticated can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Only uploader can delete documents
CREATE POLICY "Uploaders can delete own documents" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE storage.buckets IS 'HURE Care Storage Buckets: avatars (public), audio-recordings (private, TTL managed), documents (private)';
