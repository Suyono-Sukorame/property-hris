-- ==============================================================================
-- ADD DELETE POLICY FOR property_sites TABLE
-- Untuk mendukung fitur hapus proyek di Settings
-- ==============================================================================

-- Tambahkan policy DELETE untuk property_sites
CREATE POLICY "Public delete property_sites" 
ON property_sites 
FOR DELETE 
USING (true);

-- Catatan: Policy ini mengizinkan DELETE untuk semua user (public)
-- Sesuai dengan policy INSERT dan UPDATE yang sudah ada
-- Dalam production, policy ini sebaiknya dibatasi hanya untuk role SUPER_ADMIN
