-- ==============================================================================
-- PROPERTY HRIS - SUPABASE DATABASE SCHEMA & SEED DATA (MODE RINTISAN)
-- GRIYA BUMI RAYA (KALIMANTAN SELATAN) - 4 KARYAWAN RINTISAN
-- ==============================================================================

-- 1. DROP EXISTING TABLES IF ANY (Clean migration)
DROP TABLE IF EXISTS approval_items CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS property_sites CASCADE;

-- 2. CREATE TABLE: property_sites
CREATE TABLE property_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  geofence_radius_meters INTEGER NOT NULL DEFAULT 500,
  active_workforce INTEGER NOT NULL DEFAULT 4,
  site_manager TEXT NOT NULL,
  project_progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE TABLE: employees
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  nik TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  job_code TEXT NOT NULL,
  division TEXT NOT NULL,
  site_id TEXT REFERENCES property_sites(id) ON DELETE SET NULL,
  site_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif',
  contract_type TEXT NOT NULL,
  k3_certified BOOLEAN NOT NULL DEFAULT FALSE,
  blood_type TEXT DEFAULT 'O+',
  emergency_contact TEXT,
  base_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
  site_allowance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  k3_allowance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  transport_meal_allowance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  bank_account TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE TABLE: attendance_records
CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  job_code TEXT NOT NULL,
  division TEXT NOT NULL,
  site_id TEXT REFERENCES property_sites(id) ON DELETE SET NULL,
  site_name TEXT NOT NULL,
  date TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT,
  shift TEXT NOT NULL,
  status TEXT NOT NULL,
  late_minutes INTEGER NOT NULL DEFAULT 0,
  geofence_distance_meters INTEGER NOT NULL DEFAULT 0,
  geofence_verified BOOLEAN NOT NULL DEFAULT TRUE,
  biometric_verified BOOLEAN NOT NULL DEFAULT TRUE,
  ppe_compliance BOOLEAN NOT NULL DEFAULT TRUE,
  work_mode TEXT DEFAULT 'WFO',
  device_info TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE TABLE: payroll_records
CREATE TABLE payroll_records (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL,
  employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  nik TEXT NOT NULL,
  job_code TEXT NOT NULL,
  division TEXT NOT NULL,
  site_name TEXT NOT NULL,
  gaji_pokok NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tunjangan_jabatan NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tunjangan_proyek_lapangan NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tunjangan_k3 NUMERIC(15, 2) NOT NULL DEFAULT 0,
  uang_makan_transport NUMERIC(15, 2) NOT NULL DEFAULT 0,
  upah_lembur NUMERIC(15, 2) NOT NULL DEFAULT 0,
  lembur_hours INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC(15, 2) NOT NULL DEFAULT 0,
  potongan_bpjstk NUMERIC(15, 2) NOT NULL DEFAULT 0,
  potongan_bpjs_kes NUMERIC(15, 2) NOT NULL DEFAULT 0,
  potongan_pph21 NUMERIC(15, 2) NOT NULL DEFAULT 0,
  potongan_keterlambatan NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
  gaji_bersih NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  disbursement_date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE TABLE: approval_items
CREATE TABLE approval_items (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  type TEXT NOT NULL,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  job_code TEXT NOT NULL,
  division TEXT NOT NULL,
  site_id TEXT REFERENCES property_sites(id) ON DELETE SET NULL,
  site_name TEXT NOT NULL,
  date_requested TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_estimate NUMERIC(15, 2) DEFAULT 0,
  duration TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
ALTER TABLE property_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read property_sites" ON property_sites FOR SELECT USING (true);
CREATE POLICY "Public insert property_sites" ON property_sites FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update property_sites" ON property_sites FOR UPDATE USING (true);

CREATE POLICY "Public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public insert employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Public delete employees" ON employees FOR DELETE USING (true);

CREATE POLICY "Public read attendance" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Public insert attendance" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update attendance" ON attendance_records FOR UPDATE USING (true);

CREATE POLICY "Public read payroll" ON payroll_records FOR SELECT USING (true);
CREATE POLICY "Public insert payroll" ON payroll_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update payroll" ON payroll_records FOR UPDATE USING (true);

CREATE POLICY "Public read approvals" ON approval_items FOR SELECT USING (true);
CREATE POLICY "Public insert approvals" ON approval_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update approvals" ON approval_items FOR UPDATE USING (true);

-- 8. INITIAL DATA SEED (MODE RINTISAN - GRIYA BUMI RAYA)
INSERT INTO property_sites (id, name, code, category, location, latitude, longitude, geofence_radius_meters, active_workforce, site_manager, project_progress_percentage, status) VALUES
('SITE-01', 'Griya Bumi Raya - Perumahan Subsidi', 'GBR-PRM-01', 'Perumahan', 'Jl. Ahmad Yani Km. 17, Gambut, Kabupaten Banjar, Kalimantan Selatan', -3.4125, 114.7082, 500, 4, 'Suyono', 35, 'Pemasaran Aktif');

INSERT INTO employees (id, nik, name, title, job_code, division, site_id, site_name, email, phone, join_date, status, contract_type, k3_certified, blood_type, emergency_contact, base_salary, site_allowance, k3_allowance, transport_meal_allowance, bank_account, initials, avatar_color) VALUES
('EMP-2025-001', '6371011234560001', 'Suyono', 'Pemilik / Direktur Utama', 'DIR-UT-01', 'Manajemen', 'SITE-01', 'Griya Bumi Raya - Perumahan Subsidi', 'suyono@bumiraya.co.id', '+62 811-5100-0001', '2025-01-01', 'Aktif', 'PKWTT (Tetap)', false, 'O+', 'Keluarga - 0811-5100-0001', 8000000, 0, 0, 600000, 'Bank BRI 0001-01-000001-00-0 a.n Suyono', 'SY', '#0f766e'),
('EMP-2025-002', '6371012345670002', 'Dewi Anggraini', 'Admin & Keuangan', 'ADM-KEU-01', 'Administrasi & Keuangan', 'SITE-01', 'Griya Bumi Raya - Perumahan Subsidi', 'dewi@bumiraya.co.id', '+62 813-5100-0002', '2025-02-01', 'Aktif', 'PKWTT (Tetap)', false, 'A+', 'Suami - 0813-5100-0099', 3500000, 0, 0, 400000, 'Bank BCA 1234-5678-90 a.n Dewi Anggraini', 'DA', '#0284c7'),
('EMP-2025-003', '6371013456780003', 'Andi Firmansyah', 'Marketing & Penjualan', 'MKT-PNJ-01', 'Pemasaran & Penjualan', 'SITE-01', 'Griya Bumi Raya - Perumahan Subsidi', 'andi@bumiraya.co.id', '+62 812-5100-0003', '2025-02-15', 'Aktif', 'PKWTT (Tetap)', false, 'B+', 'Ibu - 0812-5100-0088', 3000000, 0, 0, 500000, 'Bank Mandiri 1400-0001-2345-6789 a.n Andi Firmansyah', 'AF', '#d97706'),
('EMP-2025-004', '6371014567890004', 'Rudi Hartono', 'Pengawas Lapangan', 'LPG-PWS-01', 'Teknis Lapangan', 'SITE-01', 'Griya Bumi Raya - Perumahan Subsidi', 'rudi@bumiraya.co.id', '+62 821-5100-0004', '2025-03-01', 'Aktif', 'PKWTT (Tetap)', true, 'O+', 'Istri - 0821-5100-0077', 3200000, 0, 0, 500000, 'Bank BRI 0002-01-000002-00-0 a.n Rudi Hartono', 'RH', '#059669');

INSERT INTO attendance_records (id, employee_id, employee_name, job_code, division, site_id, site_name, date, check_in_time, check_out_time, shift, status, late_minutes, geofence_distance_meters, geofence_verified, biometric_verified, ppe_compliance, work_mode, device_info, notes) VALUES
('ATT-2025-TODAY-01', 'EMP-2025-001', 'Suyono', 'DIR-UT-01', 'Manajemen', 'SITE-01', 'Griya Bumi Raya', CURRENT_DATE::text, '08:05', '-', 'Jam Kerja Kantor (08:00 - 17:00)', 'Hadir', 5, 45, true, false, false, 'WFO', 'Smartphone Pribadi', 'Presensi harian'),
('ATT-2025-TODAY-02', 'EMP-2025-002', 'Dewi Anggraini', 'ADM-KEU-01', 'Administrasi & Keuangan', 'SITE-01', 'Griya Bumi Raya', CURRENT_DATE::text, '08:00', '-', 'Jam Kerja Kantor (08:00 - 17:00)', 'Hadir', 0, 20, true, false, false, 'WFO', 'Smartphone Pribadi', 'Presensi harian'),
('ATT-2025-TODAY-03', 'EMP-2025-003', 'Andi Firmansyah', 'MKT-PNJ-01', 'Pemasaran & Penjualan', 'SITE-01', 'Griya Bumi Raya', CURRENT_DATE::text, '09:15', '-', 'Jam Kerja Kantor (08:00 - 17:00)', 'Terlambat', 75, 380, true, false, false, 'Dinas Luar', 'Smartphone Pribadi', 'Dari meeting pameran properti'),
('ATT-2025-TODAY-04', 'EMP-2025-004', 'Rudi Hartono', 'LPG-PWS-01', 'Teknis Lapangan', 'SITE-01', 'Griya Bumi Raya', CURRENT_DATE::text, '07:55', '-', 'Jam Kerja Lapangan (07:00 - 16:00)', 'Hadir', 0, 55, true, false, false, 'Site Proyek', 'Smartphone Pribadi', 'Pengawasan tukang');

INSERT INTO payroll_records (id, period, employee_id, employee_name, nik, job_code, division, site_name, gaji_pokok, tunjangan_jabatan, tunjangan_proyek_lapangan, tunjangan_k3, uang_makan_transport, upah_lembur, lembur_hours, total_earnings, potongan_bpjstk, potongan_bpjs_kes, potongan_pph21, potongan_keterlambatan, total_deductions, gaji_bersih, status, disbursement_date, payment_method) VALUES
('PAY-202510-001', 'Oktober 2025', 'EMP-2025-001', 'Suyono', '6371011234560001', 'DIR-UT-01', 'Manajemen', 'Griya Bumi Raya', 8000000, 0, 0, 0, 600000, 0, 0, 8600000, 240000, 80000, 0, 0, 320000, 8280000, 'Dibayar', '2025-10-28', 'Transfer BRI'),
('PAY-202510-002', 'Oktober 2025', 'EMP-2025-002', 'Dewi Anggraini', '6371012345670002', 'ADM-KEU-01', 'Administrasi & Keuangan', 'Griya Bumi Raya', 3500000, 0, 0, 0, 400000, 0, 0, 3900000, 105000, 35000, 0, 0, 140000, 3760000, 'Dibayar', '2025-10-28', 'Transfer BCA'),
('PAY-202510-003', 'Oktober 2025', 'EMP-2025-003', 'Andi Firmansyah', '6371013456780003', 'MKT-PNJ-01', 'Pemasaran & Penjualan', 'Griya Bumi Raya', 3000000, 0, 0, 0, 500000, 0, 0, 3500000, 90000, 30000, 0, 0, 120000, 3380000, 'Draft', '2025-10-31', 'Transfer Mandiri'),
('PAY-202510-004', 'Oktober 2025', 'EMP-2025-004', 'Rudi Hartono', '6371014567890004', 'LPG-PWS-01', 'Teknis Lapangan', 'Griya Bumi Raya', 3200000, 0, 0, 0, 500000, 320000, 4, 4020000, 96000, 32000, 0, 0, 128000, 3892000, 'Draft', '2025-10-31', 'Transfer BRI');

INSERT INTO approval_items (id, ticket_number, type, employee_id, employee_name, job_code, division, site_id, site_name, date_requested, description, cost_estimate, duration, status, priority, steps) VALUES
('APP-2025-001', 'IZIN/GBR/2025/10/001', 'Cuti Tahunan', 'EMP-2025-003', 'Andi Firmansyah', 'MKT-PNJ-01', 'Pemasaran & Penjualan', 'SITE-01', 'Griya Bumi Raya', '29 Okt 2025, 10:00', 'Permohonan izin 1 hari (31 Oktober 2025) untuk keperluan keluarga.', 0, '1 Hari', 'Menunggu Approval Pimpinan', 'Biasa', '[
  {"role": "1. Pengajuan Karyawan", "actorName": "Andi Firmansyah", "timestamp": "29 Okt 2025, 10:00", "status": "completed", "note": "Keperluan keluarga mendesak"},
  {"role": "2. Persetujuan Pimpinan", "actorName": "Suyono (Direktur)", "timestamp": "Menunggu", "status": "pending", "note": "-"}
]'::jsonb),
('APP-2025-002', 'KASBON/GBR/2025/10/002', 'Kasbon Karyawan', 'EMP-2025-004', 'Rudi Hartono', 'LPG-PWS-01', 'Teknis Lapangan', 'SITE-01', 'Griya Bumi Raya', '28 Okt 2025, 14:30', 'Permohonan kasbon sebesar Rp 1.000.000 untuk keperluan biaya sekolah anak. Akan dipotong dari gaji bulan November 2025.', 1000000, '-', 'Menunggu Approval Pimpinan', 'Biasa', '[
  {"role": "1. Pengajuan Karyawan", "actorName": "Rudi Hartono", "timestamp": "28 Okt 2025, 14:30", "status": "completed", "note": "Biaya sekolah anak SD, potong gaji November"},
  {"role": "2. Persetujuan Pimpinan & Keuangan", "actorName": "Suyono / Dewi Anggraini", "timestamp": "Menunggu", "status": "pending", "note": "-"}
]'::jsonb);
