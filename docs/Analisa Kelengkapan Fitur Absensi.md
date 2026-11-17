Analisa Kelengkapan Fitur Absensi + Selfie — Sisi Admin

Tanggal Analisa: 17 November 2026 · 07:44 WITA Scope: Admin (SUPER_ADMIN & SITE_MANAGER) di AttendanceView.tsx, EditAttendanceModal.tsx, HRISContext.tsx

✅ Yang Sudah Berjalan Baik
Fitur	Status	Lokasi
Tab "Monitoring Tim & Proyek" (admin/site manager)	✅ Ada	AttendanceView.tsx L607
Selfie thumbnail di tabel desktop (kolom Karyawan)	✅ Ada	L748-754
Selfie thumbnail di kartu mobile monitoring tim	✅ Ada	L883-888
Selfie thumbnail di kartu "Presensi Saya" header	✅ Ada	L339-346
GeofenceBadge di tabel & kartu monitoring	✅ Ada	L798, L933
Status badge + menit keterlambatan	✅ Ada	L787-793
Tombol "Koreksi Data Presensi" per record	✅ Ada	L838, L962
Filter periode (Hari Ini / Minggu / Bulan / Semua)	✅ Ada	L199+
Filter status (Hadir / Terlambat / Alpa dll.)	✅ Ada	L207+
Pencarian nama karyawan	✅ Ada	L209+
KPI Card (Hadir Tepat Waktu, Terlambat, dsb.)	✅ Ada	L610+
⚠️ GAP & Masalah yang Ditemukan
🔴 KRITIS — GAP 1: handleDirectCheckIn Bypass Selfie (Jalur Tersembunyi)

Di AttendanceView.tsx baris 143–196 masih ada fungsi handleDirectCheckIn() yang:

Tidak ada selfie foto (photoUrl tidak diisi)
Tidak ada GPS verification (paksa geofenceVerified: true, geofenceDistanceMeters: 0)
Label deviceInfo: 'Smartphone GPS Geotagged (1-Tap Direct)' → menyesatkan
ts
// AttendanceView.tsx L186
deviceInfo: 'Smartphone GPS Geotagged (1-Tap Direct)',  // TIDAK BENAR — tidak ada GPS

Dampak: Jika fungsi ini masih terpanggil dari mana saja (state isCheckingInDirect, directFeedback masih ada di komponen), maka ada jalur absen tanpa selfie + GPS yang lolos.

Rekomendasi: Hapus handleDirectCheckIn + semua state terkaitnya (isCheckingInDirect, directFeedback) — semua absen wajib via onOpenLiveCheckIn.

🔴 KRITIS — GAP 2: EditAttendanceModal Tidak Bisa Lihat/Ganti Foto Selfie

Modal koreksi admin (EditAttendanceModal.tsx) saat ini hanya punya field:

Jam Masuk / Jam Pulang
Status Kehadiran
Menit Keterlambatan
Perlengkapan K3
Catatan

Foto selfie sama sekali tidak tampil & tidak bisa dikoreksi oleh admin. Jika karyawan foto blur atau salah orang, admin tidak bisa melihat atau menghapus foto tersebut.

Rekomendasi (2 Opsi):

OPSI A (Simpel): Tambahkan tampilan foto selfie read-only di EditAttendanceModal (hanya lihat, tidak bisa ganti)
OPSI B (Lengkap): Tambahkan kemampuan admin untuk menghapus/reset foto selfie (set photoUrl = null) jika terbukti tidak valid
🟡 MENENGAH — GAP 3: Kolom Foto Selfie Tidak Muncul di Tabel Monitoring

Tabel desktop "Monitoring Tim" (L720–L855) memang sudah ada SelfieThumbnail di kolom Karyawan (kiri), tapi:

Thumbnail muncul di avatar profil yang kecil (blur jika foto tidak ada)
Tidak ada kolom khusus "Foto Masuk/Pulang" yang menampilkan kedua foto secara eksplisit
Admin tidak bisa langsung tahu apakah foto itu foto masuk atau foto pulang (saat ini hanya 1 field photoUrl)

Catatan: Saat ini AttendanceRecord hanya punya 1 field photoUrl. Untuk membedakan foto masuk vs foto pulang diperlukan checkInPhotoUrl + checkOutPhotoUrl.

🟡 MENENGAH — GAP 4: Tidak Ada Indikator Visual "Foto Belum Ada"

Di tabel dan kartu monitoring tim, jika record.photoUrl adalah null/undefined, SelfieThumbnail menampilkan avatar inisial. Admin tidak tahu dengan pasti apakah:

Memang foto belum ada (karyawan absen sebelum fitur selfie diterapkan), atau
Foto gagal tersimpan (bug)

Tidak ada badge/label "Tanpa Foto" yang eksplisit di sisi admin untuk menyoroti record tanpa selfie.

🟡 MENENGAH — GAP 5: Foto Selfie Disimpan Sebagai Data URL (Base64) di Supabase

Di camera.ts, foto selfie dikompres ke JPEG ~35-45 KB lalu disimpan sebagai base64 Data URL langsung ke kolom photo_url di tabel attendance_records.

Masalah:

Supabase text column tidak dioptimalkan untuk binary/base64 blob besar
Setiap query SELECT * akan menarik seluruh data URL (berat untuk jaringan mobile)
Tidak bisa dilihat langsung di Supabase Dashboard (hanya string panjang)

Rekomendasi: Pindahkan ke Supabase Storage (supabase.storage.from('selfies').upload(...)) lalu simpan URL publiknya saja ke kolom photo_url.

🟢 MINOR — GAP 6: Tabel Monitoring Tidak Ada Kolom "Foto Selfie" Eksplisit

Di tabel desktop L722–L731, header kolom saat ini:

Karyawan | Lokasi Proyek | Masuk/Pulang | Shift Kerja | Status & Telat | Radius GPS | Helm & Rompi K3 | Keterangan | Aksi Admin

Selfie hanya tertanam di kolom "Karyawan" sebagai mini-avatar. Tidak ada kolom "Foto" yang bisa diklik admin untuk verifikasi visual.

📊 Ringkasan Gap & Prioritas
PRIORITAS TINGGI (Blokir integritas data):
 🔴 GAP 1 — handleDirectCheckIn bypass (harus segera dihapus)
 🔴 GAP 2 — Admin tidak bisa lihat/koreksi foto di EditAttendanceModal
PRIORITAS MENENGAH (UX & data quality):
 🟡 GAP 3 — Tidak ada pemisahan foto masuk vs foto pulang
 🟡 GAP 4 — Tidak ada indikator "Tanpa Foto" eksplisit
 🟡 GAP 5 — Selfie disimpan base64 bukan Supabase Storage URL
PRIORITAS RENDAH (nice to have):
 🟢 GAP 6 — Kolom foto eksplisit di tabel monitoring admin
💡 Opsi Tindakan yang Direkomendasikan
OPSI 1 — Quick Fix (Prioritas Tinggi Saja) ⚡
Hapus handleDirectCheckIn + state isCheckingInDirect, directFeedback
Tambahkan preview foto selfie read-only di EditAttendanceModal
Tambahkan badge "Tanpa Foto ⚠️" di tabel monitoring untuk record tanpa photoUrl
OPSI 2 — Medium Improvement (Semua GAP 1-5) 🛠️

Semua di OPSI 1 ditambah: 4. Pisahkan field menjadi checkInPhotoUrl + checkOutPhotoUrl di tipe data dan Supabase 5. Migrasi penyimpanan foto dari base64 ke Supabase Storage (URL pendek) 6. Tambahkan opsi reset foto di EditAttendanceModal untuk admin

OPSI 3 — Full Admin Audit Dashboard 🔍

Semua di OPSI 2 ditambah: 7. Kolom "Foto" eksplisit di tabel monitoring (klik untuk lightbox full size) 8. Filter "Tanpa Foto Selfie" di toolbar monitoring tim 9. Statistik selfie di KPI Card (berapa % sudah dengan foto)

IMPORTANT

OPSI 1 sangat direkomendasikan segera karena GAP 1 (handleDirectCheckIn) adalah jalur bypass yang dapat merusak integritas data absensi.