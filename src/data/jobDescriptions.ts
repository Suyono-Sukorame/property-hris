import { JobDescription } from '@/types/jobdesc';

export const JOB_DESCRIPTIONS: Record<string, JobDescription> = {
  // =========================================================================
  // 4 PILAR UTAMA PENGEMBANG PROPERTI RINTISAN / DEVELOPER PEMULA
  // =========================================================================
  'DIR-UT-01': {
    jobCode: 'DIR-UT-01',
    title: 'Pemilik / Direktur Utama',
    division: 'Manajemen',
    level: 'Direksi / Eksekutif',
    reportsTo: '-',
    purpose: 'Memimpin keseluruhan operasional perusahaan properti rintisan, mulai dari pengambilan keputusan strategis, pengelolaan keuangan, negosiasi lahan, hingga pengawasan tim.',
    responsibilities: [
      {
        category: 'Kepemimpinan & Strategi',
        items: [
          'Menetapkan arah dan target bisnis perusahaan properti.',
          'Mengawasi seluruh karyawan dan memastikan target tercapai.',
          'Melakukan negosiasi dengan pemilik lahan, kontraktor, dan mitra bisnis.',
        ],
      },
      {
        category: 'Keuangan & Operasional',
        items: [
          'Mengelola arus kas dan permodalan usaha.',
          'Menyetujui pengeluaran operasional, kasbon, dan pembayaran karyawan.',
          'Memantau progres proyek dan pemasaran secara rutin.',
        ],
      },
    ],
    authorities: [
      'Otorisasi seluruh pengeluaran perusahaan',
      'Keputusan rekrutmen dan pemberhentian karyawan',
      'Persetujuan harga jual unit properti',
    ],
    kpiTargets: [
      { metric: 'Unit Terjual per Kuartal', target: '≥ 5 unit', weight: 40, frequency: 'Triwulan' },
      { metric: 'Arus Kas Positif', target: 'Tidak defisit > 2 bulan berturut', weight: 40, frequency: 'Bulanan' },
      { metric: 'Kepuasan Tim', target: 'Tidak ada turnover', weight: 20, frequency: 'Semester' },
    ],
    qualifications: {
      education: 'Minimal SMA / sederajat, diutamakan S1 Ekonomi / Teknik / Hukum',
      experience: 'Berpengalaman di bidang properti / bisnis',
      certifications: [],
    },
  },

  'ADM-KEU-01': {
    jobCode: 'ADM-KEU-01',
    title: 'Admin, Keuangan & Legal',
    division: 'Administrasi & Keuangan',
    level: 'Spesialis Ahli',
    reportsTo: 'Direktur Utama',
    purpose: 'Mengelola administrasi harian kantor, pencatatan keuangan, penggajian, dan kelengkapan dokumen legal properti (SHM, IMB/PBG, AJB).',
    responsibilities: [
      {
        category: 'Administrasi & Legalitas',
        items: [
          'Mengelola surat menyurat, arsip, dan dokumen legal perizinan properti.',
          'Menyiapkan perjanjian jual beli (PPJB/AJB), kwitansi, dan pemberkasan KPR.',
          'Mengelola jadwal dan agenda pimpinan dengan pihak notaris & perbankan.',
        ],
      },
      {
        category: 'Keuangan & Pembukuan',
        items: [
          'Mencatat arus kas pemasukan dan pengeluaran operasional harian.',
          'Menyusun laporan keuangan bulanan sederhana.',
          'Mengelola pembayaran gaji, kasbon, dan tagihan supplier/kontraktor.',
        ],
      },
    ],
    authorities: [
      'Pengeluaran operasional rutin sesuai anggaran yang disetujui',
      'Verifikasi kelengkapan berkas konsumen & kwitansi pembayaran',
    ],
    kpiTargets: [
      { metric: 'Ketepatan Laporan Keuangan Bulanan', target: 'Selesai sebelum tanggal 5', weight: 50, frequency: 'Bulanan' },
      { metric: 'Kelengkapan Dokumen & Arsip', target: '100% arsip rapi dan terindeks', weight: 50, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'D3 / S1 Akuntansi, Manajemen, atau Ekonomi',
      experience: '1+ tahun administrasi / keuangan / notaris',
      certifications: [],
    },
  },

  'MKT-PNJ-01': {
    jobCode: 'MKT-PNJ-01',
    title: 'Marketing & Penjualan',
    division: 'Pemasaran & Penjualan',
    level: 'Spesialis Ahli',
    reportsTo: 'Direktur Utama',
    purpose: 'Memasarkan dan menjual unit properti kepada calon pembeli, mengelola prospek, memproses KPR bank, serta mengelola promosi media sosial dan pameran.',
    responsibilities: [
      {
        category: 'Pemasaran & Promosi',
        items: [
          'Mengelola promosi properti melalui media sosial, portal properti, dan spanduk.',
          'Membuat konten pemasaran (foto, video progres, brosur digital).',
          'Menjaga hubungan baik dengan calon pembeli dan mitra agen referral.',
        ],
      },
      {
        category: 'Penjualan & Layanan Konsumen',
        items: [
          'Melayani konsultasi calon pembeli di kantor pemasaran atau lokasi proyek.',
          'Membantu kelengkapan berkas konsumen untuk pengajuan KPR ke bank.',
          'Mendampingi konsumen dari booking fee hingga serah terima kunci (bast).',
        ],
      },
    ],
    authorities: [
      'Negosiasi skema pembayaran awal dalam batas kewenangan yang disetujui',
      'Pemberian informasi teknis dan harga unit kepada calon pembeli',
    ],
    kpiTargets: [
      { metric: 'Realisasi Penjualan Unit', target: '≥ 2 unit per bulan', weight: 50, frequency: 'Bulanan' },
      { metric: 'Kecepatan Follow-up Leads', target: '< 30 menit respons awal', weight: 30, frequency: 'Harian' },
      { metric: 'Kelengkapan Berkas KPR', target: '100% lolos verifikasi bank', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'Minimal SMA / SMK, diutamakan D3/S1 Komunikasi / Manajemen',
      experience: '1+ tahun di bidang sales properti / otomotif / perbankan',
      certifications: [],
    },
  },

  'LPG-PWS-01': {
    jobCode: 'LPG-PWS-01',
    title: 'Pengawas Lapangan & Proyek',
    division: 'Teknis Lapangan',
    level: 'Teknis & Lapangan',
    reportsTo: 'Direktur Utama',
    purpose: 'Mengawasi pelaksanaan pekerjaan konstruksi di lapangan, memastikan mutu bangunan sesuai spesifikasi, mengkoordinasikan mandor dan tukang, serta mencatat logistik material.',
    responsibilities: [
      {
        category: 'Pengawasan Konstruksi & Mutu',
        items: [
          'Memantau progres pekerjaan fisik harian tukang dan mandor di lapangan.',
          'Mengawasi kualitas adukan semen, pembesian, pasangan bata, dan atap.',
          'Mencatat dan melaporkan absensi serta log harian mandor/tukang.',
        ],
      },
      {
        category: 'Logistik Material & K3',
        items: [
          'Memeriksa penerimaan material semen, pasir, besi, dan bata dari supplier.',
          'Menolak material yang tidak sesuai standar spesifikasi proyek.',
          'Memastikan keselamatan kerja dasar (K3) dan kebersihan area proyek.',
        ],
      },
    ],
    authorities: [
      'Instruksi teknis pekerjaan kepada mandor dan tukang di lapangan',
      'Penolakan penerimaan material yang cacat / tidak sesuai standar',
      'Penghentian pekerjaan sementara jika ditemukan risiko bahaya atau kesalahan struktur',
    ],
    kpiTargets: [
      { metric: 'Progres Fisik vs Target Mingguan', target: 'Deviasi progress < 5%', weight: 45, frequency: 'Mingguan' },
      { metric: 'Kepatuhan Laporan & Absensi Lapangan', target: '100% terlaporkan tepat waktu', weight: 35, frequency: 'Harian' },
      { metric: 'Tingkat Cacat Pekerjaan (Rework)', target: '< 2% dari volume pekerjaan', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'Minimal SMK Bangunan / STM, diutamakan D3/S1 Teknik Sipil',
      experience: '1+ tahun pengawasan proyek perumahan / konstruksi fisik',
      certifications: [],
    },
  },

  'TKG-LAP-01': {
    jobCode: 'TKG-LAP-01',
    title: 'Tukang Konstruksi & Bangunan',
    division: 'Teknis Lapangan',
    level: 'Teknis & Lapangan',
    reportsTo: 'Pengawas Lapangan',
    purpose: 'Melaksanakan pekerjaan fisik konstruksi unit perumahan sesuai gambar kerja dan standar mutu, mulai dari pasangan bata, plesteran, acian, pembesian, keramik, hingga atap.',
    responsibilities: [
      {
        category: 'Pelaksanaan Konstruksi Fisik',
        items: [
          'Melaksanakan pemasangan dinding bata merah/hebel, plesteran, dan acian dengan rapi dan tegak lurus.',
          'Mengerjakan pembesian sloof, kolom praktis, ringbalk, serta pengecoran beton struktur.',
          'Memasang rangka atap baja ringan, genteng/atap, keramik lantai, dan instalasi pipa sanitasi.',
        ],
      },
      {
        category: 'Disiplin Kerja & K3 Lapangan',
        items: [
          'Menjaga dan merawat peralatan kerja pertukangan milik proyek.',
          'Menggunakan Alat Pelindung Diri (APD) helm dan sepatu saat bekerja di area proyek.',
          'Melakukan presensi harian dan melaporkan hasil kerja kepada Pengawas Lapangan.',
        ],
      },
    ],
    authorities: [
      'Penggunaan peralatan pertukangan proyek sesuai instruksi kerja',
      'Mengajukan kebutuhan material harian kepada Pengawas Lapangan',
    ],
    kpiTargets: [
      { metric: 'Target Volume Pasangan Harian', target: '≥ 95% target harian tercapai', weight: 50, frequency: 'Mingguan' },
      { metric: 'Kerapian & Kualitas Hasil Fisik', target: 'Zero defect / tanpa dinding retak & bergelombang', weight: 30, frequency: 'Mingguan' },
      { metric: 'Disiplin Jam Kerja & Presensi', target: '≥ 95% hadir tepat waktu', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'Pendidikan non-formal / SMK atau berpengalaman kerja lapangan',
      experience: '2+ tahun sebagai tukang batu / tukang kayu / tukang finishing perumahan',
      certifications: [],
    },
  },

  'KNK-LAP-01': {
    jobCode: 'KNK-LAP-01',
    title: 'Pembantu Tukang (Kenek / Laden)',
    division: 'Teknis Lapangan',
    level: 'Teknis & Lapangan',
    reportsTo: 'Tukang / Pengawas Lapangan',
    purpose: 'Membantu kelancaran kerja tukang dengan menyiapkan adukan semen/pasir, mengangkut material ke titik pengerjaan, memasang perancah, dan membersihkan sisa puing proyek.',
    responsibilities: [
      {
        category: 'Dukungan Material & Persiapan',
        items: [
          'Membuat adukan semen, pasir, dan air dengan komposisi campuran yang sesuai instruksi.',
          'Mengangkut bata, semen, pasir, dan besi ke lokasi kerja tukang secara tepat waktu.',
          'Membantu persiapan perancah (steger) dan alat kerja pertukangan.',
        ],
      },
      {
        category: 'Kebersihan & Keselamatan Lapangan',
        items: [
          'Membersihkan sisa puing, tumpahan adukan, dan sampah material setiap sore selesai kerja.',
          'Mengamankan dan merapikan alat kerja di gudang/bedeng proyek.',
          'Mematuhi rambu keselamatan kerja dan penggunaan rompi/helm proyek.',
        ],
      },
    ],
    authorities: [
      'Mengambil material dari gudang/tumpukan sesuai kebutuhan kerja harian tukang',
    ],
    kpiTargets: [
      { metric: 'Kecepatan Kesiapan Adukan & Material', target: 'Tukang tidak pernah terhenti menunggu adukan', weight: 50, frequency: 'Harian' },
      { metric: 'Kebersihan Area Kerja Sore Hari', target: '100% area bersih sebelum pulang kerja', weight: 30, frequency: 'Harian' },
      { metric: 'Disiplin Kehadiran Kerja', target: '≥ 95% hadir tepat waktu', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'Tidak disyaratkan ijazah khusus, kondisi fisik sehat dan prima',
      experience: 'Berpengalaman membantu pekerjaan fisik konstruksi lapangan',
      certifications: [],
    },
  },
};
