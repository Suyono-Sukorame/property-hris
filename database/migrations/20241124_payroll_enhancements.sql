-- ==============================================================================
-- MIGRATION: 20241124_payroll_enhancements.sql
-- 1. Tambah kolom potongan kasbon, potongan alpa, bukti transfer & catatan transfer
-- 2. Konfigurasi Bucket Supabase Storage: payroll-receipts (opsional untuk struk transfer)
-- ==============================================================================

-- 1. Tambahkan kolom pendukung Enterprise Payroll ke tabel payroll_records
ALTER TABLE payroll_records 
  ADD COLUMN IF NOT EXISTS potongan_kasbon NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS potongan_alpa NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS transfer_note TEXT;

-- 2. Buat Storage Bucket publik untuk menyimpan bukti resi/transfer payroll (jika belum ada)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payroll-receipts', 'payroll-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy RLS untuk Supabase Storage payroll-receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read payroll-receipts'
  ) THEN
    CREATE POLICY "Public read payroll-receipts" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'payroll-receipts');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public insert payroll-receipts'
  ) THEN
    CREATE POLICY "Public insert payroll-receipts" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'payroll-receipts');
  END IF;
END $$;
