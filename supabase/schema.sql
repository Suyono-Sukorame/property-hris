-- ==============================================================================
-- PROPERTY HRIS - SUPABASE DATABASE SCHEMA & INITIAL DATA SEED
-- PT BUMI RAYA PROPERTINDO TBK (KALIMANTAN SELATAN)
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
  geofence_radius_meters INTEGER NOT NULL DEFAULT 150,
  active_workforce INTEGER NOT NULL DEFAULT 0,
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
  blood_type TEXT NOT NULL,
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

-- 8. INITIAL DATA SEED (PT BUMI RAYA PROPERTINDO TBK - KALSEL)
INSERT INTO property_sites (id, name, code, category, location, latitude, longitude, geofence_radius_meters, active_workforce, site_manager, project_progress_percentage, status) VALUES
('SITE-01', 'Grand Banjar Residence & Township', 'GBR-EST-01', 'Township Masterplan', 'Jl. Ahmad Yani Km. 17, Gambut, Kabupaten Banjar, Kalimantan Selatan', -3.4125, 114.7082, 200, 248, 'Ir. Bambang Trihatmojo, S.T., IPM.', 74, 'Konstruksi Aktif'),
('SITE-02', 'The Sovereign Tower - Banjarbaru', 'SVR-TWR-02', 'High-Rise Commercial', 'Kawasan Perkantoran Pemprov Kalsel, Jl. Dharma Praja No. 33, Banjarbaru, Kalimantan Selatan', -3.4402, 114.8306, 150, 184, 'Raditya Dananjaya, M.Sc.', 89, 'Finishing & Handover'),
('SITE-03', 'Batola Green Promenade Phase 2', 'BTL-PRM-03', 'Mixed-Use Residential', 'Jl. Trans Kalimantan No. 18, Handil Bakti, Barito Kuala, Kalimantan Selatan', -3.2750, 114.5820, 175, 142, 'Hendrik Pratama, S.T.', 42, 'Konstruksi Aktif'),
('SITE-HQ', 'Kantor Pusat - Menara Bumi Raya Banjarmasin', 'HQ-BJM-00', 'Corporate Head Office', 'Lantai 3-5, Menara Bumi Raya, Jl. Jend. Ahmad Yani Km. 4.5 No. 21, Banjarmasin, Kalimantan Selatan', -3.3289, 114.6041, 100, 86, 'Ibu Ratna Kumalasari, S.Psi., CHRP.', 100, 'Operasional Kantor');

INSERT INTO employees (id, nik, name, title, job_code, division, site_id, site_name, email, phone, join_date, status, contract_type, k3_certified, blood_type, emergency_contact, base_salary, site_allowance, k3_allowance, transport_meal_allowance, bank_account, initials, avatar_color) VALUES
('EMP-2024-001', '3275011985040003', 'Ir. Bagus Wicaksono, M.T.', 'Senior Project Director', 'DIR-PRJ-01', 'Teknik Sipil & Struktur', 'SITE-01', 'Grand Banjar Residence & Township', 'bagus.wicaksono@bumiraya.co.id', '+62 811-9823-4101', '2019-03-15', 'Aktif', 'PKWTT (Tetap)', true, 'O+', 'Dewi Lestari (Istri) - 081299887766', 28500000, 4500000, 1500000, 2500000, 'Bank Mandiri - 1220008912341', 'BW', '#0f766e'),
('EMP-2024-002', '3174022809920001', 'Fadhilah Putri, S.Ars.', 'Lead Project Architect', 'ARC-DES-02', 'Perencanaan & Desain', 'SITE-02', 'The Sovereign Tower - Banjarbaru', 'fadhilah.putri@bumiraya.co.id', '+62 812-4455-8902', '2021-08-01', 'Aktif', 'PKWTT (Tetap)', false, 'A+', 'Rahmat Hidayat (Ayah) - 081377889900', 17000000, 2500000, 0, 2000000, 'BCA - 8690123488', 'FP', '#0284c7'),
('EMP-2024-003', '3216010507880004', 'Deni Setiawan, S.T.', 'HSE Construction Specialist', 'HSE-K3-01', 'K3 & Lingkungan Lapangan', 'SITE-01', 'Grand Banjar Residence & Township', 'deni.setiawan@bumiraya.co.id', '+62 856-7890-1234', '2020-01-10', 'Aktif', 'PKWTT (Tetap)', true, 'B+', 'Siti Rahma (Istri) - 085712345678', 13500000, 3000000, 2000000, 1800000, 'BNI - 0432198765', 'DS', '#d97706'),
('EMP-2024-004', '3175031206950002', 'Anisa Rahmawati, S.E.', 'Senior Procurement & Cost Estimator', 'EST-FIN-03', 'Estimasi Biaya & Pengadaan', 'SITE-HQ', 'Kantor Pusat - Menara Bumi Raya Banjarmasin', 'anisa.rahmawati@bumiraya.co.id', '+62 813-8899-7711', '2022-04-18', 'Aktif', 'PKWTT (Tetap)', false, 'AB+', 'Haryono (Kakak) - 081233445566', 12000000, 500000, 0, 1750000, 'Bank Mandiri - 1560007812993', 'AR', '#7c3aed'),
('EMP-2024-005', '3674032211900005', 'Kurniawan Santoso, S.T.', 'Civil Infrastructure Engineer', 'ENG-CIV-04', 'Teknik Sipil & Struktur', 'SITE-03', 'Batola Green Promenade Phase 2', 'kurniawan.s@bumiraya.co.id', '+62 818-0912-3456', '2022-11-01', 'Aktif', 'PKWT (Kontrak Proyek)', true, 'O+', 'Agus Santoso (Ayah) - 081899001122', 11500000, 2500000, 1000000, 1800000, 'BCA - 5420991200', 'KS', '#ea580c'),
('EMP-2024-006', '3275061403980007', 'Dimas Prasetyo, A.Md.', 'BIM & CAD Draftsperson', 'DRF-ENG-05', 'Perencanaan & Desain', 'SITE-02', 'The Sovereign Tower - Banjarbaru', 'dimas.prasetyo@bumiraya.co.id', '+62 878-1122-3344', '2023-06-15', 'Aktif', 'PKWT (Kontrak Proyek)', false, 'B+', 'Endang Purwati (Ibu) - 087855667788', 8500000, 1500000, 0, 1500000, 'BRI - 012301099887504', 'DP', '#0891b2'),
('EMP-2024-007', '3671040810840002', 'Joko Susilo', 'Chief Mechanical & Electrical Inspector', 'MEC-INS-02', 'Pengawasan Mekanikal & Elektrikal', 'SITE-03', 'Batola Green Promenade Phase 2', 'joko.susilo@bumiraya.co.id', '+62 812-3344-5566', '2018-09-01', 'Aktif', 'PKWTT (Tetap)', true, 'A+', 'Sri Wahyuni (Istri) - 081277881122', 14000000, 3000000, 1500000, 1800000, 'Bank Mandiri - 1310004567890', 'JS', '#4f46e5'),
('EMP-2024-008', '3216082502930006', 'Ahmad Baihaqi', 'Heavy Equipment & Crane Coordinator', 'CRN-OPS-01', 'Operasional Alat Berat & Logistik', 'SITE-01', 'Grand Banjar Residence & Township', 'ahmad.baihaqi@bumiraya.co.id', '+62 852-9988-7744', '2023-01-05', 'Aktif', 'PKWT (Kontrak Proyek)', true, 'O+', 'Mahmud (Paman) - 085211223344', 9500000, 3000000, 1500000, 1800000, 'BCA - 2770192837', 'AB', '#059669');

INSERT INTO attendance_records (id, employee_id, employee_name, job_code, division, site_id, site_name, date, check_in_time, check_out_time, shift, status, late_minutes, geofence_distance_meters, geofence_verified, biometric_verified, ppe_compliance, device_info, notes) VALUES
('ATT-2024-1029-01', 'EMP-2024-001', 'Ir. Bagus Wicaksono, M.T.', 'DIR-PRJ-01', 'Teknik Sipil & Struktur', 'SITE-01', 'Grand Banjar Residence', '2024-10-29', '07:42:15', '17:15:00', 'Shift Pagi Lapangan (08:00 - 17:00)', 'Hadir', 0, 38, true, true, true, 'Samsung Galaxy S23 Ultra (GPS High Accuracy)', 'Inspeksi pengecoran pondasi bore pile zona 3A'),
('ATT-2024-1029-02', 'EMP-2024-002', 'Fadhilah Putri, S.Ars.', 'ARC-DES-02', 'Perencanaan & Desain', 'SITE-02', 'The Sovereign Tower - Banjarbaru', '2024-10-29', '07:55:08', NULL, 'Shift Pagi Lapangan (08:00 - 17:00)', 'Hadir', 0, 62, true, true, true, 'iPhone 15 Pro (Face ID & Geofence Verified)', 'Review mockup facade ACP lantai 18 bersama kontraktor spesialis'),
('ATT-2024-1029-03', 'EMP-2024-003', 'Deni Setiawan, S.T.', 'HSE-K3-01', 'K3 & Lingkungan Lapangan', 'SITE-01', 'Grand Banjar Residence', '2024-10-29', '07:28:40', NULL, 'Shift Pagi Lapangan (08:00 - 17:00)', 'Hadir', 0, 18, true, true, true, 'Xiaomi 13T (GPS Geotagged)', 'Pimpin Safety Morning Talk untuk 120 pekerja subkon cor beton'),
('ATT-2024-1029-04', 'EMP-2024-008', 'Ahmad Baihaqi', 'CRN-OPS-01', 'Operasional Alat Berat & Logistik', 'SITE-01', 'Grand Banjar Residence', '2024-10-29', '08:18:22', NULL, 'Shift Pagi Lapangan (08:00 - 17:00)', 'Terlambat', 18, 45, true, true, true, 'OPPO Reno 10 (GPS Geotagged)', 'Keterlambatan macet Jl. A. Yani Km 12 Gambut'),
('ATT-2024-1029-05', 'EMP-2024-004', 'Anisa Rahmawati, S.E.', 'EST-FIN-03', 'Estimasi Biaya & Pengadaan', 'SITE-HQ', 'Kantor Pusat Banjarmasin (HQ)', '2024-10-29', '08:45:10', NULL, 'Shift Kantor Sudirman (09:00 - 18:00)', 'Hadir', 0, 12, true, true, true, 'iPad Air Gen 5 (Office WiFi & Biometric)', 'Persiapan sidang koordinasi batas lahan BPN Kabupaten Banjar');

INSERT INTO payroll_records (id, period, employee_id, employee_name, nik, job_code, division, site_name, gaji_pokok, tunjangan_jabatan, tunjangan_proyek_lapangan, tunjangan_k3, uang_makan_transport, upah_lembur, lembur_hours, total_earnings, potongan_bpjstk, potongan_bpjs_kes, potongan_pph21, potongan_keterlambatan, total_deductions, gaji_bersih, status, disbursement_date, payment_method) VALUES
('PAY-2024-10-001', 'Oktober 2024', 'EMP-2024-001', 'Ir. Bagus Wicaksono, M.T.', '3275011985040003', 'DIR-PRJ-01', 'Teknik Sipil & Struktur', 'Grand Banjar Residence', 28500000, 8000000, 4500000, 1500000, 2500000, 0, 0, 45000000, 1350000, 450000, 3850000, 0, 5650000, 39350000, 'Dibayar', '2024-10-28', 'Direct Bank Transfer (Mandiri Payroll)'),
('PAY-2024-10-002', 'Oktober 2024', 'EMP-2024-002', 'Fadhilah Putri, S.Ars.', '3174022809920001', 'ARC-DES-02', 'Perencanaan & Desain', 'The Sovereign Tower - Banjarbaru', 17000000, 4500000, 2500000, 0, 2000000, 1850000, 14, 27850000, 835500, 278500, 1845000, 0, 2959000, 24891000, 'Dibayar', '2024-10-28', 'Direct Bank Transfer (BCA Payroll)'),
('PAY-2024-10-003', 'Oktober 2024', 'EMP-2024-003', 'Deni Setiawan, S.T.', '3216010507880004', 'HSE-K3-01', 'K3 & Lingkungan Lapangan', 'Grand Banjar Residence', 13500000, 3000000, 3000000, 2000000, 1800000, 2450000, 22, 25750000, 772500, 257500, 1520000, 0, 2550000, 23200000, 'Disetujui', '2024-10-30', 'Direct Bank Transfer (BNI Payroll)'),
('PAY-2024-10-004', 'Oktober 2024', 'EMP-2024-004', 'Anisa Rahmawati, S.E.', '3175031206950002', 'EST-FIN-03', 'Estimasi Biaya & Pengadaan', 'Kantor Pusat Banjarmasin (HQ)', 12000000, 3000000, 500000, 0, 1750000, 0, 0, 17250000, 517500, 172500, 890000, 0, 1580000, 15670000, 'Dibayar', '2024-10-28', 'Direct Bank Transfer (Mandiri Payroll)'),
('PAY-2024-10-005', 'Oktober 2024', 'EMP-2024-008', 'Ahmad Baihaqi', '3216082502930006', 'CRN-OPS-01', 'Operasional Alat Berat & Logistik', 'Grand Banjar Residence', 9500000, 1500000, 3000000, 1500000, 1800000, 3150000, 34, 20450000, 613500, 204500, 940000, 75000, 1833000, 18617000, 'Draft', '2024-10-31', 'Direct Bank Transfer (BCA Payroll)');

INSERT INTO approval_items (id, ticket_number, type, employee_id, employee_name, job_code, division, site_id, site_name, date_requested, description, cost_estimate, duration, status, priority, steps) VALUES
('APP-2024-089', 'TKT-2024-COR-089', 'Lembur Konstruksi Cor Beton', 'EMP-2024-008', 'Ahmad Baihaqi', 'CRN-OPS-01', 'Operasional Alat Berat & Logistik', 'SITE-01', 'Grand Banjar Residence', '2024-10-29', 'Izin Lembur Malam Pengecoran Pelat Lantai Basement 2 Zona Barat (Estimasi volume 480 m3 beton ready-mix K-350 NFA). Diperlukan stand by operator tower crane dan concrete pump.', 4850000, '6 Jam (19:00 - 01:00 WITA)', 'Menunggu Pengawas Lapangan', 'Kritis', '[
  {"role": "Pemohon (Staff Operasional)", "actorName": "Ahmad Baihaqi (Operator Crane)", "timestamp": "29 Okt 2024, 09:15 WITA", "status": "completed", "note": "Pengajuan diajukan bersamaan dengan jadwal arrival mixer truk Adhimix"},
  {"role": "Pengawas K3 Lapangan", "actorName": "Deni Setiawan, S.T. (HSE Specialist)", "timestamp": "29 Okt 2024, 11:30 WITA", "status": "completed", "note": "Checklist penerangan malam dan APD body harness lengkap OK"},
  {"role": "Site Manager Konstruksi", "actorName": "Ir. Bambang Trihatmojo (Site Manager)", "timestamp": "-", "status": "pending", "note": "Menunggu verifikasi kesiapan pompa beton dari PT Varia Usaha"},
  {"role": "Direksi Operasional Properti", "actorName": "Ir. Bagus Wicaksono, M.T.", "timestamp": "-", "status": "pending", "note": "-"}
]'::jsonb),
('APP-2024-088', 'TKT-2024-CLM-088', 'Klaim Operasional Lapangan', 'EMP-2024-006', 'Dimas Prasetyo, A.Md.', 'DRF-ENG-05', 'Perencanaan & Desain', 'SITE-02', 'The Sovereign Tower - Banjarbaru', '2024-10-28', 'Penggantian biaya cetak plot kalkir blueprint A0 (12 set gambar As-Built ME & Plumbing) untuk submission Dinas Tata Ruang & Cipta Karya Banjarbaru.', 2350000, '-', 'Menunggu Approval HR', 'Penting', '[
  {"role": "Pemohon (Staff Perencana)", "actorName": "Dimas Prasetyo (CAD Drafter)", "timestamp": "28 Okt 2024, 14:00 WITA", "status": "completed", "note": "Kuitansi asli printing store terlampir lengkap"},
  {"role": "Site Manager Proyek", "actorName": "Raditya Dananjaya, M.Sc.", "timestamp": "28 Okt 2024, 16:45 WITA", "status": "completed", "note": "Gambar As-Built telah diverifikasi sesuai progres handover"},
  {"role": "Human Capital & Finance", "actorName": "Ibu Ratna Kumalasari (HR Head)", "timestamp": "-", "status": "pending", "note": "Verifikasi kelengkapan faktur pajak"}
]'::jsonb),
('APP-2024-085', 'TKT-2024-TGS-085', 'Surat Tugas K3', 'EMP-2024-004', 'Anisa Rahmawati, S.E.', 'EST-FIN-03', 'Estimasi Biaya & Pengadaan', 'SITE-HQ', 'Kantor Pusat Banjarmasin (HQ)', '2024-10-27', 'Surat Tugas Pendampingan Pengukuran Batas Tanah & Konsultasi AMDAL Bersama BPN Kabupaten Barito Kuala untuk Pembebasan Lahan Koridor Trans Kalimantan.', 1200000, '3 Hari (30 Okt - 01 Nov 2024)', 'Disetujui', 'Biasa', '[
  {"role": "Pemohon", "actorName": "Anisa Rahmawati (Cost Estimator)", "timestamp": "27 Okt 2024, 10:20 WITA", "status": "completed", "note": "Surat undangan BPN nomor 410/BPN-BTL/X/2024 terlampir"},
  {"role": "Head of Human Capital", "actorName": "Ibu Ratna Kumalasari", "timestamp": "27 Okt 2024, 13:10 WITA", "status": "completed", "note": "Uang saku perjalanan dinas disetujui sesuai regulasi perusahaan"},
  {"role": "Direktur Operasional", "actorName": "Ir. Bagus Wicaksono, M.T.", "timestamp": "27 Okt 2024, 15:00 WITA", "status": "completed", "note": "Disetujui. Harap dokumentasikan patok batas tanah secara berkala."}
]'::jsonb);
