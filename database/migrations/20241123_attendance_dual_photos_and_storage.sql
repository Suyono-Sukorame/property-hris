-- ==============================================================================
-- MIGRATION: 20241123_attendance_dual_photos_and_storage.sql
-- 1. Tambah kolom foto terpisah: check_in_photo_url & check_out_photo_url
-- 2. Konfigurasi Bucket Supabase Storage: attendance-selfies
-- ==============================================================================

-- 1. Tambahkan kolom foto masuk dan foto pulang ke tabel attendance_records
ALTER TABLE attendance_records 
  ADD COLUMN IF NOT EXISTS check_in_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS check_out_photo_url TEXT;

-- Migrasikan data foto lama (jika ada) ke kolom check_in_photo_url
UPDATE attendance_records 
SET check_in_photo_url = photo_url 
WHERE check_in_photo_url IS NULL AND photo_url IS NOT NULL;

-- 2. Buat Storage Bucket publik untuk menyimpan foto presensi
-- Bucket ini menampung file JPG foto selfie asli, sehingga tabel database tetap ringan
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attendance-selfies', 'attendance-selfies', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy RLS untuk Supabase Storage
-- Izinkan semua user membaca foto presensi (Public Read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read attendance-selfies'
  ) THEN
    CREATE POLICY "Public read attendance-selfies" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'attendance-selfies');
  END IF;
END $$;

-- Izinkan upload foto presensi (Public Insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public insert attendance-selfies'
  ) THEN
    CREATE POLICY "Public insert attendance-selfies" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'attendance-selfies');
  END IF;
END $$;

-- Izinkan update foto presensi (Public Update)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public update attendance-selfies'
  ) THEN
    CREATE POLICY "Public update attendance-selfies" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'attendance-selfies');
  END IF;
END $$;
