-- ============================================================================
-- Migration: Rampingkan Job Descriptions ke 4 Pilar Utama Developer Pemula
-- Date: 2024-11-18
-- Description: Merapikan katalog jabatan dan divisi agar fokus pada 4 fungsi
--              inti developer properti rintisan (Manajemen, Admin & Keuangan,
--              Marketing & Penjualan, dan Pengawas Lapangan).
-- ============================================================================

-- 1. Hapus policy lama & pastikan RLS public aktif
DROP POLICY IF EXISTS "Allow read access to all users" ON job_descriptions;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON job_descriptions;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON job_descriptions;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON job_descriptions;

DROP POLICY IF EXISTS "Public read job_descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Public insert job_descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Public update job_descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Public delete job_descriptions" ON job_descriptions;

CREATE POLICY "Public read job_descriptions"
  ON job_descriptions FOR SELECT USING (true);

CREATE POLICY "Public insert job_descriptions"
  ON job_descriptions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update job_descriptions"
  ON job_descriptions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete job_descriptions"
  ON job_descriptions FOR DELETE USING (true);

-- 2. Bersihkan 12 posisi korporat lama yang tidak relevan bagi developer pemula
DELETE FROM job_descriptions WHERE job_code IN (
  'DIR-PRJ-01', 'ARC-DES-02', 'HSE-K3-01', 'EST-FIN-03',
  'ENG-CIV-04', 'DRF-ENG-05', 'MEC-INS-02', 'CRN-OPS-01',
  'LEG-LND-01', 'FIN-ACC-01', 'HR-PPL-01', 'SLS-PRP-01'
);

-- 3. Seed 4 Posisi Inti Developer Rintisan (Upsert)
INSERT INTO job_descriptions (job_code, title, division, level, reports_to, purpose, responsibilities, authorities, kpi_targets, qualifications)
VALUES
(
  'DIR-UT-01',
  'Pemilik / Direktur Utama',
  'Manajemen',
  'Direksi / Eksekutif',
  '-',
  'Memimpin keseluruhan operasional perusahaan properti rintisan, mulai dari pengambilan keputusan strategis, pengelolaan keuangan, negosiasi lahan, hingga pengawasan tim.',
  '[{"category":"Kepemimpinan & Strategi","items":["Menetapkan arah dan target bisnis perusahaan properti.","Mengawasi seluruh karyawan dan memastikan target tercapai.","Melakukan negosiasi dengan pemilik lahan, kontraktor, dan mitra bisnis."]},{"category":"Keuangan & Operasional","items":["Mengelola arus kas dan permodalan usaha.","Menyetujui pengeluaran operasional, kasbon, dan pembayaran karyawan.","Memantau progres proyek dan pemasaran secara rutin."]}]'::jsonb,
  ARRAY['Otorisasi seluruh pengeluaran perusahaan', 'Keputusan rekrutmen dan pemberhentian karyawan', 'Persetujuan harga jual unit properti'],
  '[{"metric":"Unit Terjual per Kuartal","target":"≥ 5 unit","weight":40,"frequency":"Triwulan"},{"metric":"Arus Kas Positif","target":"Tidak defisit > 2 bulan berturut","weight":40,"frequency":"Bulanan"},{"metric":"Kepuasan Tim","target":"Tidak ada turnover","weight":20,"frequency":"Semester"}]'::jsonb,
  '{"education":"Minimal SMA / sederajat, diutamakan S1 Ekonomi / Teknik / Hukum","experience":"Berpengalaman di bidang properti / bisnis","certifications":[]}'::jsonb
),
(
  'ADM-KEU-01',
  'Admin, Keuangan & Legal',
  'Administrasi & Keuangan',
  'Spesialis Ahli',
  'Direktur Utama',
  'Mengelola administrasi harian kantor, pencatatan keuangan, penggajian, dan kelengkapan dokumen legal properti (SHM, IMB/PBG, AJB).',
  '[{"category":"Administrasi & Legalitas","items":["Mengelola surat menyurat, arsip, dan dokumen legal perizinan properti.","Menyiapkan perjanjian jual beli (PPJB/AJB), kwitansi, dan pemberkasan KPR.","Mengelola jadwal dan agenda pimpinan dengan pihak notaris & perbankan."]},{"category":"Keuangan & Pembukuan","items":["Mencatat arus kas pemasukan dan pengeluaran operasional harian.","Menyusun laporan keuangan bulanan sederhana.","Mengelola pembayaran gaji, kasbon, dan tagihan supplier/kontraktor."]}]'::jsonb,
  ARRAY['Pengeluaran operasional rutin sesuai anggaran yang disetujui', 'Verifikasi kelengkapan berkas konsumen & kwitansi pembayaran'],
  '[{"metric":"Ketepatan Laporan Keuangan Bulanan","target":"Selesai sebelum tanggal 5","weight":50,"frequency":"Bulanan"},{"metric":"Kelengkapan Dokumen & Arsip","target":"100% arsip rapi dan terindeks","weight":50,"frequency":"Bulanan"}]'::jsonb,
  '{"education":"D3 / S1 Akuntansi, Manajemen, atau Ekonomi","experience":"1+ tahun administrasi / keuangan / notaris","certifications":[]}'::jsonb
),
(
  'MKT-PNJ-01',
  'Marketing & Penjualan',
  'Pemasaran & Penjualan',
  'Spesialis Ahli',
  'Direktur Utama',
  'Memasarkan dan menjual unit properti kepada calon pembeli, mengelola prospek, memproses KPR bank, serta mengelola promosi media sosial dan pameran.',
  '[{"category":"Pemasaran & Promosi","items":["Mengelola promosi properti melalui media sosial, portal properti, dan spanduk.","Membuat konten pemasaran (foto, video progres, brosur digital).","Menjaga hubungan baik dengan calon pembeli dan mitra agen referral."]},{"category":"Penjualan & Layanan Konsumen","items":["Melayani konsultasi calon pembeli di kantor pemasaran atau lokasi proyek.","Membantu kelengkapan berkas konsumen untuk pengajuan KPR ke bank.","Mendampingi konsumen dari booking fee hingga serah terima kunci (bast)."]}]'::jsonb,
  ARRAY['Negosiasi skema pembayaran awal dalam batas kewenangan yang disetujui', 'Pemberian informasi teknis dan harga unit kepada calon pembeli'],
  '[{"metric":"Realisasi Penjualan Unit","target":"≥ 2 unit per bulan","weight":50,"frequency":"Bulanan"},{"metric":"Kecepatan Follow-up Leads","target":"< 30 menit respons awal","weight":30,"frequency":"Harian"},{"metric":"Kelengkapan Berkas KPR","target":"100% lolos verifikasi bank","weight":20,"frequency":"Bulanan"}]'::jsonb,
  '{"education":"Minimal SMA / SMK, diutamakan D3/S1 Komunikasi / Manajemen","experience":"1+ tahun di bidang sales properti / otomotif / perbankan","certifications":[]}'::jsonb
),
(
  'LPG-PWS-01',
  'Pengawas Lapangan & Proyek',
  'Teknis Lapangan',
  'Teknis & Lapangan',
  'Direktur Utama',
  'Mengawasi pelaksanaan pekerjaan konstruksi di lapangan, memastikan mutu bangunan sesuai spesifikasi, mengkoordinasikan mandor dan tukang, serta mencatat logistik material.',
  '[{"category":"Pengawasan Konstruksi & Mutu","items":["Memantau progres pekerjaan fisik harian tukang dan mandor di lapangan.","Mengawasi kualitas adukan semen, pembesian, pasangan bata, dan atap.","Mencatat dan melaporkan absensi serta log harian mandor/tukang."]},{"category":"Logistik Material & K3","items":["Memeriksa penerimaan material semen, pasir, besi, dan bata dari supplier.","Menolak material yang tidak sesuai standar spesifikasi proyek.","Memastikan keselamatan kerja dasar (K3) dan kebersihan area proyek."]}]'::jsonb,
  ARRAY['Instruksi teknis pekerjaan kepada mandor dan tukang di lapangan', 'Penolakan penerimaan material yang cacat / tidak sesuai standar', 'Penghentian pekerjaan sementara jika ditemukan risiko bahaya atau kesalahan struktur'],
  '[{"metric":"Progres Fisik vs Target Mingguan","target":"Deviasi progress < 5%","weight":45,"frequency":"Mingguan"},{"metric":"Kepatuhan Laporan & Absensi Lapangan","target":"100% terlaporkan tepat waktu","weight":35,"frequency":"Harian"},{"metric":"Tingkat Cacat Pekerjaan (Rework)","target":"< 2% dari volume pekerjaan","weight":20,"frequency":"Bulanan"}]'::jsonb,
  '{"education":"Minimal SMK Bangunan / STM, diutamakan D3/S1 Teknik Sipil","experience":"1+ tahun pengawasan proyek perumahan / konstruksi fisik","certifications":[]}'::jsonb
),
(
  'TKG-LAP-01',
  'Tukang Konstruksi & Bangunan',
  'Teknis Lapangan',
  'Teknis & Lapangan',
  'Pengawas Lapangan',
  'Melaksanakan pekerjaan fisik konstruksi unit perumahan sesuai gambar kerja dan standar mutu, mulai dari pasangan bata, plesteran, acian, pembesian, keramik, hingga atap.',
  '[{"category":"Pelaksanaan Konstruksi Fisik","items":["Melaksanakan pemasangan dinding bata merah/hebel, plesteran, dan acian dengan rapi dan tegak lurus.","Mengerjakan pembesian sloof, kolom praktis, ringbalk, serta pengecoran beton struktur.","Memasang rangka atap baja ringan, genteng/atap, keramik lantai, dan instalasi pipa sanitasi."]},{"category":"Disiplin Kerja & K3 Lapangan","items":["Menjaga dan merawat peralatan kerja pertukangan milik proyek.","Menggunakan Alat Pelindung Diri (APD) helm dan sepatu saat bekerja di area proyek.","Melakukan presensi harian dan melaporkan hasil kerja kepada Pengawas Lapangan."]}]'::jsonb,
  ARRAY['Penggunaan peralatan pertukangan proyek sesuai instruksi kerja', 'Mengajukan kebutuhan material harian kepada Pengawas Lapangan'],
  '[{"metric":"Target Volume Pasangan Harian","target":"≥ 95% target harian tercapai","weight":50,"frequency":"Mingguan"},{"metric":"Kerapian & Kualitas Hasil Fisik","target":"Zero defect / tanpa dinding retak & bergelombang","weight":30,"frequency":"Mingguan"},{"metric":"Disiplin Jam Kerja & Presensi","target":"≥ 95% hadir tepat waktu","weight":20,"frequency":"Bulanan"}]'::jsonb,
  '{"education":"Pendidikan non-formal / SMK atau berpengalaman kerja lapangan","experience":"2+ tahun sebagai tukang batu / tukang kayu / tukang finishing perumahan","certifications":[]}'::jsonb
),
(
  'KNK-LAP-01',
  'Pembantu Tukang (Kenek / Laden)',
  'Teknis Lapangan',
  'Teknis & Lapangan',
  'Tukang / Pengawas Lapangan',
  'Membantu kelancaran kerja tukang dengan menyiapkan adukan semen/pasir, mengangkut material ke titik pengerjaan, memasang perancah, dan membersihkan sisa puing proyek.',
  '[{"category":"Dukungan Material & Persiapan","items":["Membuat adukan semen, pasir, dan air dengan komposisi campuran yang sesuai instruksi.","Mengangkut bata, semen, pasir, dan besi ke lokasi kerja tukang secara tepat waktu.","Membantu persiapan perancah (steger) dan alat kerja pertukangan."]},{"category":"Kebersihan & Keselamatan Lapangan","items":["Membersihkan sisa puing, tumpahan adukan, dan sampah material setiap sore selesai kerja.","Mengamankan dan merapikan alat kerja di gudang/bedeng proyek.","Mematuhi rambu keselamatan kerja dan penggunaan rompi/helm proyek."]}]'::jsonb,
  ARRAY['Mengambil material dari gudang/tumpukan sesuai kebutuhan kerja harian tukang'],
  '[{"metric":"Kecepatan Kesiapan Adukan & Material","target":"Tukang tidak pernah terhenti menunggu adukan","weight":50,"frequency":"Harian"},{"metric":"Kebersihan Area Kerja Sore Hari","target":"100% area bersih sebelum pulang kerja","weight":30,"frequency":"Harian"},{"metric":"Disiplin Kehadiran Kerja","target":"≥ 95% hadir tepat waktu","weight":20,"frequency":"Bulanan"}]'::jsonb,
  '{"education":"Tidak disyaratkan ijazah khusus, kondisi fisik sehat dan prima","experience":"Berpengalaman membantu pekerjaan fisik konstruksi lapangan","certifications":[]}'::jsonb
)
ON CONFLICT (job_code) DO UPDATE SET
  title = EXCLUDED.title,
  division = EXCLUDED.division,
  level = EXCLUDED.level,
  reports_to = EXCLUDED.reports_to,
  purpose = EXCLUDED.purpose,
  responsibilities = EXCLUDED.responsibilities,
  authorities = EXCLUDED.authorities,
  kpi_targets = EXCLUDED.kpi_targets,
  qualifications = EXCLUDED.qualifications;
