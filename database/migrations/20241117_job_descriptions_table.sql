-- ============================================================================
-- Migration: Create job_descriptions table
-- Date: 2024-11-17
-- Description: Table untuk menyimpan job descriptions dengan CRUD
-- ============================================================================

-- Create job_descriptions table (using standard PostgreSQL UUID)
CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  division TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Direksi / Eksekutif', 'Manajemen Proyek', 'Spesialis Ahli', 'Teknis & Lapangan')),
  reports_to TEXT,
  purpose TEXT,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  authorities TEXT[] NOT NULL DEFAULT '{}',
  kpi_targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualifications JSONB NOT NULL DEFAULT '{"education":"", "experience":"", "certifications":[]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_job_descriptions_job_code ON job_descriptions(job_code);
CREATE INDEX idx_job_descriptions_division ON job_descriptions(division);
CREATE INDEX idx_job_descriptions_title ON job_descriptions(title);
CREATE INDEX idx_job_descriptions_level ON job_descriptions(level);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_job_descriptions_updated_at
  BEFORE UPDATE ON job_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
-- Enable RLS
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read job descriptions
CREATE POLICY "Allow read access to all users"
  ON job_descriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Allow insert for authenticated users"
  ON job_descriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow update for authenticated users"
  ON job_descriptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete
CREATE POLICY "Allow delete for authenticated users"
  ON job_descriptions
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Seed Data: Insert initial job descriptions (from jobDescriptions.ts)
-- ============================================================================

-- Seed 1: Direktur Utama
INSERT INTO job_descriptions (job_code, title, division, level, reports_to, purpose, responsibilities, authorities, kpi_targets, qualifications)
VALUES (
  'DIR-UT-01',
  'Pemilik / Direktur Utama',
  'Manajemen',
  'Direksi / Eksekutif',
  '-',
  'Memimpin keseluruhan operasional perusahaan properti rintisan, mulai dari pengambilan keputusan strategis, pengelolaan keuangan, negosiasi lahan, hingga pengawasan tim.',
  '[
    {
      "category": "Kepemimpinan & Strategi",
      "items": [
        "Menetapkan arah dan target bisnis perusahaan properti.",
        "Mengawasi seluruh karyawan dan memastikan target tercapai.",
        "Melakukan negosiasi dengan pemilik lahan, kontraktor, dan mitra bisnis."
      ]
    },
    {
      "category": "Keuangan & Operasional",
      "items": [
        "Mengelola arus kas dan permodalan usaha.",
        "Menyetujui pengeluaran operasional, kasbon, dan pembayaran karyawan.",
        "Memantau progres proyek dan pemasaran secara rutin."
      ]
    }
  ]'::jsonb,
  ARRAY['Otorisasi seluruh pengeluaran perusahaan', 'Keputusan rekrutmen dan pemberhentian karyawan', 'Persetujuan harga jual unit properti'],
  '[
    {"metric": "Unit Terjual per Kuartal", "target": "≥ 5 unit", "weight": 40, "frequency": "Triwulan"},
    {"metric": "Arus Kas Positif", "target": "Tidak defisit > 2 bulan berturut", "weight": 40, "frequency": "Bulanan"},
    {"metric": "Kepuasan Tim", "target": "Tidak ada turnover", "weight": 20, "frequency": "Semester"}
  ]'::jsonb,
  '{"education": "Minimal SMA / sederajat, diutamakan S1 Ekonomi / Teknik / Hukum", "experience": "Berpengalaman di bidang properti / bisnis", "certifications": []}'::jsonb
) ON CONFLICT (job_code) DO NOTHING;

-- Seed 2: Admin & Keuangan
INSERT INTO job_descriptions (job_code, title, division, level, reports_to, purpose, responsibilities, authorities, kpi_targets, qualifications)
VALUES (
  'ADM-KEU-01',
  'Admin & Keuangan',
  'Administrasi & Keuangan',
  'Spesialis Ahli',
  'Direktur Utama',
  'Mengelola administrasi harian kantor, pencatatan keuangan, penggajian, dan kelengkapan dokumen legal properti.',
  '[
    {
      "category": "Administrasi Kantor",
      "items": [
        "Mengelola surat menyurat, arsip, dan dokumen perusahaan.",
        "Menyiapkan perjanjian jual beli, kwitansi, dan dokumen AJB.",
        "Mengelola jadwal dan agenda pimpinan."
      ]
    },
    {
      "category": "Keuangan & Pembukuan",
      "items": [
        "Mencatat pemasukan dan pengeluaran harian.",
        "Menyusun laporan keuangan bulanan sederhana.",
        "Mengelola pembayaran gaji, kasbon, dan tagihan operasional."
      ]
    }
  ]'::jsonb,
  ARRAY['Pengeluaran operasional rutin sesuai anggaran'],
  '[
    {"metric": "Ketepatan Laporan Keuangan Bulanan", "target": "Selesai sebelum tanggal 5", "weight": 50, "frequency": "Bulanan"},
    {"metric": "Kelengkapan Dokumen", "target": "100% arsip rapi dan terindeks", "weight": 50, "frequency": "Bulanan"}
  ]'::jsonb,
  '{"education": "D3 / S1 Akuntansi, Manajemen, atau Ekonomi", "experience": "1+ tahun administrasi / keuangan", "certifications": []}'::jsonb
) ON CONFLICT (job_code) DO NOTHING;

-- Seed 3: Marketing & Penjualan
INSERT INTO job_descriptions (job_code, title, division, level, reports_to, purpose, responsibilities, authorities, kpi_targets, qualifications)
VALUES (
  'MKT-PNJ-01',
  'Marketing & Penjualan',
  'Pemasaran & Penjualan',
  'Spesialis Ahli',
  'Direktur Utama',
  'Memasarkan dan menjual unit properti kepada calon pembeli, mengelola prospek, serta membangun jaringan agen dan media sosial.',
  '[
    {
      "category": "Pemasaran",
      "items": [
        "Mengelola promosi properti melalui media sosial, marketplace, dan event pameran.",
        "Membuat konten pemasaran (foto, video, brosur digital).",
        "Menjaga hubungan baik dengan agen dan mitra referral."
      ]
    },
    {
      "category": "Penjualan",
      "items": [
        "Menunjukkan unit properti kepada calon pembeli.",
        "Menegotiasikan harga dan syarat jual beli.",
        "Menyelesaikan proses penjualan hingga akad."
      ]
    }
  ]'::jsonb,
  ARRAY['Menetapkan harga jual sesuai approval pimpinan', 'Memberikan diskon hingga 5%'],
  '[
    {"metric": "Unit Terjual per Bulan", "target": "≥ 2 unit", "weight": 60, "frequency": "Bulanan"},
    {"metric": "Jumlah Prospek Aktif", "target": "≥ 20 prospek", "weight": 25, "frequency": "Bulanan"},
    {"metric": "Conversion Rate", "target": "≥ 15%", "weight": 15, "frequency": "Bulanan"}
  ]'::jsonb,
  '{"education": "D3 / S1 Marketing, Komunikasi, atau Bisnis", "experience": "1+ tahun marketing / penjualan", "certifications": []}'::jsonb
) ON CONFLICT (job_code) DO NOTHING;

-- Seed 4: Pengawas Lapangan
INSERT INTO job_descriptions (job_code, title, division, level, reports_to, purpose, responsibilities, authorities, kpi_targets, qualifications)
VALUES (
  'LPG-PWS-01',
  'Pengawas Lapangan',
  'Teknis Lapangan',
  'Spesialis Ahli',
  'Direktur Utama',
  'Mengawasi pelaksanaan pekerjaan konstruksi, memastikan kualitas, keamanan, dan kesesuaian dengan spesifikasi teknis.',
  '[
    {
      "category": "Pengawasan Konstruksi",
      "items": [
        "Mengawasi pekerjaan konstruksi setiap hari.",
        "Memastikan penggunaan material sesuai spesifikasi.",
        "Memeriksa kualitas pekerjaan tukang."
      ]
    },
    {
      "category": "K3 (Keamanan & Kesehatan Kerja)",
      "items": [
        "Memastikan tukang menggunakan PPE (helm, rompi, sepatu safety).",
        "Melakukan safety briefing setiap pagi.",
        "Mengawasi penggunaan alat berat."
      ]
    },
    {
      "category": "Koordinasi",
      "items": [
        "Berkomunikasi dengan Direktur tentang progres proyek.",
        "Membuat laporan harian pekerjaan.",
        "Mengkoordinasikan antar tim tukang."
      ]
    }
  ]'::jsonb,
  ARRAY['Mengambil keputusan teknis harian', 'Menolak pekerjaan yang tidak memenuhi standar', 'Mengusulkan perbaikan material'],
  '[
    {"metric": "Kepatuhan K3", "target": "100% tukang gunakan PPE", "weight": 40, "frequency": "Harian"},
    {"metric": "Kualitas Pekerjaan", "target": "≤ 5% rework", "weight": 40, "frequency": "Mingguan"},
    {"metric": "Progres Pekerjaan", "target": "Sesuai timeline", "weight": 20, "frequency": "Mingguan"}
  ]'::jsonb,
  '{"education": "SMA / D3 Teknik Sipil / Arsitektur", "experience": "2+ tahun di bidang pengawasan konstruksi", "certifications": ["Sertifikat AK3 Umum", "K3 Konstruksi"]}'::jsonb
) ON CONFLICT (job_code) DO NOTHING;

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. ON CONFLICT (job_code) DO NOTHING prevents duplicate insert errors
-- 2. JSONB fields store complex nested data (responsibilities, kpi_targets)
-- 3. TEXT[] array type untuk authorities (simple list) - syntax: ARRAY['item1', 'item2']
-- 4. RLS enabled untuk keamanan data
-- 5. Timestamp auto-update via trigger
