-- ==============================================================================
-- MIGRATION: 20241122_system_settings_table.sql
-- TABEL PENGATURAN PARAMETER SISTEM & PAYROLL HRIS PROPERTI
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  tolerance_minutes INTEGER NOT NULL DEFAULT 15,
  late_deduction_per_minute INTEGER NOT NULL DEFAULT 5000,
  bpjs_rate NUMERIC(4, 2) NOT NULL DEFAULT 3.00,
  k3_bonus_rate INTEGER NOT NULL DEFAULT 1500000,
  overtime_rate_per_hour INTEGER NOT NULL DEFAULT 80000,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'System'
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Semua pengguna dapat membaca parameter sistem
CREATE POLICY "Public read system_settings"
ON system_settings
FOR SELECT
USING (true);

-- Policy INSERT: Pengguna dapat memasukkan parameter sistem awal
CREATE POLICY "Public insert system_settings"
ON system_settings
FOR INSERT
WITH CHECK (true);

-- Policy UPDATE: Pengguna dapat memperbarui parameter sistem
CREATE POLICY "Public update system_settings"
ON system_settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Seed baris default awal jika belum ada
INSERT INTO system_settings (
  id,
  tolerance_minutes,
  late_deduction_per_minute,
  bpjs_rate,
  k3_bonus_rate,
  overtime_rate_per_hour,
  updated_at,
  updated_by
)
VALUES (
  'default',
  15,
  5000,
  3.00,
  1500000,
  80000,
  NOW(),
  'System Init'
)
ON CONFLICT (id) DO NOTHING;
