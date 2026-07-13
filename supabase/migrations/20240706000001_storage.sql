-- Migration: Create storage bucket for incident attachments
-- Run this in Supabase Dashboard SQL Editor

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('incident-attachments', 'incident-attachments', true, false, 20971520, null)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'incident-attachments');

-- Allow uploads (service role handles this via API)
DROP POLICY IF EXISTS "Allow Upload" ON storage.objects;
CREATE POLICY "Allow Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'incident-attachments');
