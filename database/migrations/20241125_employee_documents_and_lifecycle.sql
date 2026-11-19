-- ==============================================================================
-- MIGRATION: 20241125_employee_documents_and_lifecycle.sql
-- 1. Tambah kolom dokumen digital (JSONB), tanggal berakhir kontrak, sertifikat K3, dan alasan terminasi
-- 2. Konfigurasi Bucket Supabase Storage: employee-documents
-- ==============================================================================

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_end_date TEXT,
  ADD COLUMN IF NOT EXISTS k3_certificate_expiry TEXT,
  ADD COLUMN IF NOT EXISTS deactivation_reason TEXT,
  ADD COLUMN IF NOT EXISTS deactivation_date TEXT,
  ADD COLUMN IF NOT EXISTS deactivation_notes TEXT;

-- Bucket Storage untuk dokumen karyawan
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read employee-documents'
  ) THEN
    CREATE POLICY "Public read employee-documents" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'employee-documents');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public insert employee-documents'
  ) THEN
    CREATE POLICY "Public insert employee-documents" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'employee-documents');
  END IF;
END $$;
