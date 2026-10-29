import { JobDescription } from '@/types/jobdesc';

export const JOB_DESCRIPTIONS: Record<string, JobDescription> = {
  'DIR-PRJ-01': {
    jobCode: 'DIR-PRJ-01',
    title: 'Senior Project Director',
    division: 'Teknik Sipil & Struktur',
    level: 'Direksi / Eksekutif',
    reportsTo: 'Direktur Utama / Dewan Komisaris',
    purpose: 'Memimpin keseluruhan strategi pelaksanaan, pembebasan lahan, pemenuhan mutu konstruksi, pengendalian biaya, dan keselamatan kerja kawasan masterplan township properti di Kalimantan Selatan.',
    responsibilities: [
      {
        category: 'Kepemimpinan Proyek & Perencanaan',
        items: [
          'Menetapkan Master Time Schedule (Kurva S) pelaksanaan pembangunan kawasan township.',
          'Mengkoordinasikan para kontraktor utama, konsultan perencana, dan tim pengawas independen.',
          'Memastikan seluruh tahapan proyek mematuhi regulasi tata ruang dan AMDAL Pemprov Kalimantan Selatan.',
        ],
      },
      {
        category: 'Manajemen Biaya & Risiko Konstruksi',
        items: [
          'Mengendalikan realisasi anggaran biaya (RAB/BQ) agar tidak terjadi pembengkakan biaya (cost overrun).',
          'Melakukan mitigasi risiko tanah lunak/gambut dan hidrologi musiman khas kawasan Kalimantan Selatan.',
          'Mengesahkan progress claim termin pembayaran pekerjaan fisik kontraktor.',
        ],
      },
    ],
    authorities: [
      'Otorisasi persetujuan pengadaan material dan kontrak kerja hingga Rp 5.000.000.000,-',
      'Persetujuan lembur darurat dan percepatan jadwal konstruksi (crash program)',
      'Penghentian pekerjaan sementara jika ditemukan pelanggaran mutu struktur kritis',
    ],
    kpiTargets: [
      { metric: 'Kesesuaian Progress Fisik vs Kurva S', target: 'Deviasi < 3%', weight: 35, frequency: 'Bulanan' },
      { metric: 'Efisiensi Anggaran Konstruksi', target: 'Varian Cost <= 100% RAB', weight: 30, frequency: 'Triwulan' },
      { metric: 'K3 Zero Fatal Accident Kawasan', target: '0 Kasus Kecelakaan Berat', weight: 20, frequency: 'Tahunan' },
      { metric: 'Penyelesaian Handover Unit Tepat Waktu', target: '>= 95% Sesuai Jadwal', weight: 15, frequency: 'Semester' },
    ],
    qualifications: {
      education: 'S1/S2 Teknik Sipil dari universitas terakreditasi A',
      certifications: ['SKA Ahli Utama Manajemen Proyek Konstruksi (LPJK)', 'Sertifikat IPM Persatuan Insinyur Indonesia (PII)'],
      experience: 'Minimal 12 tahun memimpin proyek township/high-rise berskala besar',
    },
  },

  'ARC-DES-02': {
    jobCode: 'ARC-DES-02',
    title: 'Lead Project Architect',
    division: 'Perencanaan & Desain',
    level: 'Spesialis Ahli',
    reportsTo: 'Senior Project Director',
    purpose: 'Mengawal integritas konsep arsitektur, estetika gedung komersial, perizinan PBG/SLF, dan detail pelaksanaan fasad pada proyek-proyek PT Bumi Raya Propertindo Tbk.',
    responsibilities: [
      {
        category: 'Pengawasan Desain & Material',
        items: [
          'Memeriksa dan menyetujui mockup material arsitektur (kaca Low-E, ACP, keramik, sanitair).',
          'Mengawasi kesesuaian gambar pelaksanaan (Shop Drawing) dengan Detail Engineering Design (DED).',
          'Mengoptimalkan efisiensi energi dan sirkulasi alami tropis pada desain bangunan komersial.',
        ],
      },
      {
        category: 'Perizinan & Koordinasi Teknis',
        items: [
          'Menyusun kelengkapan berkas teknis arsitektur untuk perizinan Persetujuan Bangunan Gedung (PBG).',
          'Melakukan site inspection berkala untuk memastikan kerapian pengerjaan finishing interior & eksterior.',
        ],
      },
    ],
    authorities: [
      'Persetujuan approval material finishing (Material Approval Sheet)',
      'Koreksi dan penolakan shop drawing arsitektur yang tidak memenuhi spesifikasi',
    ],
    kpiTargets: [
      { metric: 'Kecepatan Review Shop Drawing Kontraktor', target: '<= 48 Jam Per Submission', weight: 40, frequency: 'Mingguan' },
      { metric: 'Kelulusan Dokumen PBG & SLF Pemda', target: '100% Lolos TPA/TPT', weight: 35, frequency: 'Tahunan' },
      { metric: 'Defect Finishing Unit Saat Handover', target: '<= 2 Temuan Minor Per Unit', weight: 25, frequency: 'Per Handover' },
    ],
    qualifications: {
      education: 'S1 Arsitektur',
      certifications: ['Surat Tanda Registrasi Arsitek (STRA) Madya', 'Anggota Ikatan Arsitek Indonesia (IAI)'],
      experience: 'Minimal 6 tahun dalam perancangan dan pengawasan gedung komersial',
    },
  },

  'HSE-K3-01': {
    jobCode: 'HSE-K3-01',
    title: 'HSE Construction Specialist',
    division: 'K3 & Lingkungan Lapangan',
    level: 'Spesialis Ahli',
    reportsTo: 'Site Manager & Human Capital Head',
    purpose: 'Menegakkan standar Keselamatan, Kesehatan Kerja, dan Pengelolaan Lingkungan (SMK3) di lokasi proyek guna mencapai Zero Accident dan kepatuhan hukum ketenagakerjaan.',
    responsibilities: [
      {
        category: 'Pencegahan & Pengawasan K3',
        items: [
          'Memimpin Tool Box Meeting dan Safety Morning Talk harian sebelum shift kerja dimulai.',
          'Memeriksa Surat Izin Kerja Aman (SIKA/Permit to Work) untuk pekerjaan ketinggian, pengelasan, dan ruang terbatas.',
          'Melakukan inspeksi kelengkapan APD (Helm, Rompi, Sepatu Safety) seluruh personil dan subkontraktor.',
        ],
      },
      {
        category: 'Audit & Tanggap Darurat',
        items: [
          'Melakukan simulasi tanggap darurat kebakaran dan evakuasi gempa/angin kencang.',
          'Menginvestigasi dan membuat laporan kronologi jika terjadi insiden atau near-miss dalam 1x24 jam.',
          'Memastikan pengelolaan limbah B3 proyek dan drainase lingkungan tidak mencemari saluran warga sekitar.',
        ],
      },
    ],
    authorities: [
      'Wewenang Penuh Penghentian Pekerjaan (Stop Work Authority) jika terdeteksi bahaya keselamatan fatal',
      'Pemberian sanksi / denda K3 terhadap vendor/subkontraktor yang melanggar aturan K3',
    ],
    kpiTargets: [
      { metric: 'Zero Lost Time Injury (LTI)', target: '0 Jam Kerja Hilang Akibat Kecelakaan', weight: 40, frequency: 'Bulanan' },
      { metric: 'Tingkat Kepatuhan APD Tenaga Kerja', target: '>= 98% Compliance Lapangan', weight: 30, frequency: 'Mingguan' },
      { metric: 'Kelengkapan SIKA / Safety Permit', target: '100% Pekerjaan Berizin SIKA', weight: 30, frequency: 'Harian' },
    ],
    qualifications: {
      education: 'S1 Teknik / Kesehatan Masyarakat',
      certifications: ['Sertifikat Ahli K3 Konstruksi (Kemenaker RI)', 'Sertifikat Auditor SMK3 PP No. 50/2012'],
      experience: 'Minimal 5 tahun sebagai Safety Officer di proyek konstruksi gedung bertingkat / kawasan industri',
    },
  },

  'EST-FIN-03': {
    jobCode: 'EST-FIN-03',
    title: 'Senior Procurement & Cost Estimator',
    division: 'Estimasi Biaya & Pengadaan',
    level: 'Spesialis Ahli',
    reportsTo: 'Direktur Keuangan & Pengadaan',
    purpose: 'Menyusun estimasi biaya konstruksi (Bill of Quantity), analisa harga satuan pekerjaan, serta negosiasi pengadaan material utama dengan harga optimal dan mutu terjamin.',
    responsibilities: [
      {
        category: 'Estimasi Biaya & Tender',
        items: [
          'Menghitung volume pekerjaan berdasarkan gambar kerja DED (take-off quantity).',
          'Menyusun dokumen Rencana Kerja dan Syarat-Syarat (RKS) serta Harga Perkiraan Sendiri (HPS).',
          'Mengevaluasi penawaran harga dari rekanan vendor beton, besi tulangan, dan alat berat.',
        ],
      },
      {
        category: 'Pengendalian Biaya & Administrasi Lahan',
        items: [
          'Memantau fluktuasi harga material konstruksi di pasar regional Kalimantan Selatan.',
          'Menyusun analisa biaya ganti rugi pembebasan tanah dan biaya perizinan sertifikasi BPN.',
        ],
      },
    ],
    authorities: [
      'Penerbitan Surat Perintah Kerja (SPK) pengadaan material hingga plafon Rp 500.000.000,-',
      'Klarifikasi dan negosiasi harga penawaran tender rekanan subkontraktor',
    ],
    kpiTargets: [
      { metric: 'Akurasi Perhitungan Volume BQ', target: 'Tingkat Deviasi Volume < 2%', weight: 40, frequency: 'Per Proyek' },
      { metric: 'Efisiensi Negosiasi Biaya Pengadaan', target: 'Penghematan 3% - 5% dari HPS', weight: 35, frequency: 'Bulanan' },
      { metric: 'Ketepatan Waktu Penerbitan PO Material', target: '<= 3 Hari Kerja', weight: 25, frequency: 'Mingguan' },
    ],
    qualifications: {
      education: 'S1 Teknik Sipil / Ekonomi Manajemen',
      certifications: ['Certified Quantity Surveyor (CQS) / Asosiasi QS Indonesia', 'Pelatihan Manajemen Pengadaan Konstruksi'],
      experience: 'Minimal 5 tahun dalam estimasi biaya dan pengadaan proyek real estate',
    },
  },

  'ENG-CIV-04': {
    jobCode: 'ENG-CIV-04',
    title: 'Civil Infrastructure Engineer',
    division: 'Teknik Sipil & Struktur',
    level: 'Spesialis Ahli',
    reportsTo: 'Site Manager Lapangan',
    purpose: 'Mengawasi pekerjaan fisik infrastruktur kawasan, pemadatan tanah, jaringan saluran drainase primer/sekunder, dan pengaspalan jalan lingkungan kawasan proyek.',
    responsibilities: [
      {
        category: 'Pengawasan Lapangan & Pengujian',
        items: [
          'Memverifikasi elevasi tanah dan patok batas ukur menggunakan alat ukur theodolite/total station.',
          'Mengawasi uji kepadatan tanah (Sand Cone Test) dan uji tekan beton (Slump Test & Uji Kubus/Silinder).',
          'Memastikan saluran air hujan dan kolam retensi berfungsi mencegah genangan air pasang rawa/sungai.',
        ],
      },
      {
        category: 'Laporan & Koordinasi',
        items: [
          'Membuat Laporan Harian dan Mingguan Progress Fisik Infrastruktur Lapangan.',
          'Mengkoordinasikan mandor pengurukan tanah dan operator alat berat excavator/vibro roller.',
        ],
      },
    ],
    authorities: [
      'Persetujuan izin cor beton infrastruktur (Request for Work Inspection)',
      'Penolakan material agregat batu belah/pasir cor yang tidak memenuhi standar gradasi',
    ],
    kpiTargets: [
      { metric: 'Kelulusan Uji Tekan Beton & Uji Kepadatan', target: '100% Lulus Uji Standar SNI', weight: 40, frequency: 'Per Pengecoran' },
      { metric: 'Kesesuaian Elevasi Jalan & Saluran', target: 'Toleransi Kemiringan Sesuai Desain', weight: 35, frequency: 'Mingguan' },
      { metric: 'Ketepatan Laporan Progres Harian Lapangan', target: 'Submit Harian Sebelum Pukul 18:00', weight: 25, frequency: 'Harian' },
    ],
    qualifications: {
      education: 'S1 Teknik Sipil',
      certifications: ['SKA Ahli Muda Teknik Jalan / Jembatan (LPJK)', 'Sertifikat Pengukuran Geodesi Praktis'],
      experience: 'Minimal 4 tahun pada pekerjaan infrastruktur jalan, cut & fill, dan drainase kawasan',
    },
  },

  'DRF-ENG-05': {
    jobCode: 'DRF-ENG-05',
    title: 'BIM & CAD Draftsperson',
    division: 'Perencanaan & Desain',
    level: 'Teknis & Lapangan',
    reportsTo: 'Lead Project Architect',
    purpose: 'Memproduksi dan memperbarui gambar kerja detail (Shop Drawing) dan gambar terlaksana (As-Built Drawing) menggunakan perangkat lunak BIM/AutoCAD dengan akurasi tinggi.',
    responsibilities: [
      {
        category: 'Produksi Gambar Kerja',
        items: [
          'Mengkonversi gambar desain arsitek dan konsultan ME ke dalam gambar kerja lapangan skala 1:20 dan 1:50.',
          'Mengintegrasikan model 3D Revit/BIM guna mendeteksi benturan antara balok struktur dan pipa sanitair (clash detection).',
          'Mencetak dan mengarsipkan lembar kalkir cetak biru (blueprint) A0 untuk keperluan pengajuan dinas Pemda.',
        ],
      },
      {
        category: 'Revisi & Dokumentasi',
        items: [
          'Mencatat setiap revisi perubahan desain (Site Instruction) ke dalam lembar gambar revisi resmi.',
          'Menyiapkan berkas final As-Built Drawing sebagai syarat penyerahan unit (handover) ke pemilik properti.',
        ],
      },
    ],
    authorities: [
      'Pemberian nomor registrasi dan kode revisi resmi pada lembar shop drawing perusahaan',
    ],
    kpiTargets: [
      { metric: 'Kecepatan Penyelesaian Gambar Detail', target: '<= 24 Jam Per Lembar Detail', weight: 45, frequency: 'Mingguan' },
      { metric: 'Akurasi Gambar vs Kondisi Fisik Lapangan', target: 'Zero Error Dimensi Lapangan', weight: 35, frequency: 'Bulanan' },
      { metric: 'Kerapian Arsip Digital Gambar Proyek', target: '100% Terindeks di Server Proyek', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'D3 Teknik Sipil / Arsitektur / SMK Bangunan Berpengalaman',
      certifications: ['Sertifikasi Autodesk Certified Professional (AutoCAD & Revit BIM)', 'Keahlian Navisworks Clash Detection'],
      experience: 'Minimal 3 tahun dalam penggambaran proyek gedung dan perumahan',
    },
  },

  'MEC-INS-02': {
    jobCode: 'MEC-INS-02',
    title: 'Chief Mechanical & Electrical Inspector',
    division: 'Pengawasan Mekanikal & Elektrikal',
    level: 'Spesialis Ahli',
    reportsTo: 'Site Manager Lapangan',
    purpose: 'Mengawasi instalasi dan pengetesan sistem kelistrikan gedung, genset darurat, sistem proteksi kebakaran hydrant/sprinkler, serta instalasi air bersih dan sanitasi kawasan.',
    responsibilities: [
      {
        category: 'Pemeriksaan Sistem ME',
        items: [
          'Menguji tahanan isolasi kabel tegangan rendah dan penangkal petir (Grounding Test <= 2 Ohm).',
          'Mengawasi uji tekan pipa air bersih (Pressure Test 10 bar selama 24 jam tanpa kebocoran).',
          'Menginspeksi panel distribusi listrik, trafo PLN, dan sistem interlock otomatis genset.',
        ],
      },
      {
        category: 'Commissioning & Keselamatan',
        items: [
          'Melakukan commissioning test sistem pompa hydrant dan alarm deteksi asap kebakaran gedung.',
          'Memastikan seluruh instalasi kabel memiliki conduit pelindung anti gigitan hama dan tahan panas.',
        ],
      },
    ],
    authorities: [
      'Persetujuan commissioning dan serah terima instalasi daya listrik dari subkon instalatur',
      'Instruksi perbaikan seketika jika ditemukan kabel telanjang atau potensi arus pendek (konsleting)',
    ],
    kpiTargets: [
      { metric: 'Hasil Uji Tekan Pipa & Kelistrikan', target: '100% Lulus Uji Standar PLN & Damkar', weight: 45, frequency: 'Per Pemasangan' },
      { metric: 'Ketepatan Waktu Commissioning Alat ME', target: 'Selesai 7 Hari Sebelum Serah Terima', weight: 35, frequency: 'Per Proyek' },
      { metric: 'Keandalan Daya Listrik Saat Konstruksi', target: 'Zero Downtime Operasional', weight: 20, frequency: 'Bulanan' },
    ],
    qualifications: {
      education: 'D3/S1 Teknik Elektro / Mesin',
      certifications: ['SKA Ahli Teknik Tenaga Listrik / Mekanikal', 'Sertifikat K3 Penanggulangan Kebakaran Kelas B'],
      experience: 'Minimal 7 tahun sebagai pengawas ME gedung bertingkat dan instalasi daya',
    },
  },

  'CRN-OPS-01': {
    jobCode: 'CRN-OPS-01',
    title: 'Heavy Equipment & Crane Coordinator',
    division: 'Operasional Alat Berat & Logistik',
    level: 'Teknis & Lapangan',
    reportsTo: 'Site Manager & HSE Specialist',
    purpose: 'Memimpin koordinasi operasional tower crane, mobile crane, concrete pump, dan armada mixer beton ready-mix dengan disiplin keselamatan beban angkat yang ketat.',
    responsibilities: [
      {
        category: 'Operasional Beban Angkat (Lifting)',
        items: [
          'Memeriksa tabel beban angkat (Load Chart) crane dan radius jangkauan sebelum mengangkat bucket cor.',
          'Melakukan checklist harian kondisi sling baja, rem hidrolik, limit switch, dan anemometer kecepatan angin.',
          'Mengkoordinasikan rigger/signalman dalam memandu pergerakan beban di atas area kerja konstruksi.',
        ],
      },
      {
        category: 'Logistik & Pemeliharaan Alat',
        items: [
          'Mengatur antrean truk mixer beton ready-mix agar tidak terjadi keterlambatan penuangan cor.',
          'Melakukan pelumasan rutin (greasing) dan pengecekan oli mesin genset pompa beton.',
        ],
      },
    ],
    authorities: [
      'Penolakan pengangkatan beban (Reject Lifting) jika kecepatan angin melampaui batas aman (> 20 knot)',
      'Penolakan jika berat beban melebihi kapasitas aman angkat (Safe Working Load / SWL)',
    ],
    kpiTargets: [
      { metric: 'Zero Insiden Beban Angkat & Alat Berat', target: '0 Kecelakaan / Kerusakan Alat', weight: 50, frequency: 'Bulanan' },
      { metric: 'Tingkat Kesiapan Alat Berat (Availability)', target: '>= 95% Alat Siap Operasi', weight: 30, frequency: 'Mingguan' },
      { metric: 'Kepatuhan Checklist Harian Pagi', target: '100% Checklist Terisi Lengkap', weight: 20, frequency: 'Harian' },
    ],
    qualifications: {
      education: 'SMK Teknik Mesin / Otomotif Alat Berat',
      certifications: ['Surat Izin Operator (SIO) Crane Kelas 1 / Kemenaker RI Aktif', 'Sertifikat Rigger & Safety Lifting Operation'],
      experience: 'Minimal 5 tahun mengoperasikan Tower Crane dan koordinasi alat berat proyek',
    },
  },

  'LEG-LND-01': {
    jobCode: 'LEG-LND-01',
    title: 'Senior Legal & Land Acquisition Specialist',
    division: 'Legalitas, Pertanahan & Perizinan',
    level: 'Spesialis Ahli',
    reportsTo: 'Corporate Secretary & Direktur Utama',
    purpose: 'Memastikan kepatuhan hukum korporasi, penyelesaian legalitas pembebasan lahan perumahan dan komersial, perizinan PBG/SLF, serta koordinasi ke Kantor Pertanahan BPN di wilayah Kalimantan Selatan.',
    responsibilities: [
      {
        category: 'Legalitas Lahan & Agraria',
        items: [
          'Melakukan audit riwayat kepemilikan tanah (Due Diligence) dan keaslian sertifikat SHM/HGB bersama PPAT & BPN.',
          'Menyusun perjanjian pengikatan jual beli (PPJB) dan akta pelepasan hak atas tanah kawasan pengembangan properti.',
          'Menangani mediasi dan penyelesaian sengketa batas tapal tanah secara musyawarah dan litigasi.',
        ],
      },
      {
        category: 'Perizinan & Kepatuhan Regulasi',
        items: [
          'Mengurus perizinan Persetujuan Bangunan Gedung (PBG), Sertifikat Laik Fungsi (SLF), dan izin tata ruang Pemda.',
          'Memastikan seluruh klausul kontrak kerjasama vendor dan subkontraktor melindungi aset perusahaan.',
        ],
      },
    ],
    authorities: [
      'Persetujuan legal draft perjanjian kerjasama dan akta notariil hingga Rp 10.000.000.000,-',
      'Pemberian legal opinion kepada Dewan Direksi sebelum akuisisi lahan baru',
    ],
    kpiTargets: [
      { metric: 'Kecepatan Penyelesaian Sertifikasi Induk HGB', target: '<= 90 Hari Kerja per Kawasan', weight: 40, frequency: 'Semester' },
      { metric: 'Kelengkapan Legalitas Perizinan PBG/SLF', target: '100% Sesuai Jadwal Launching', weight: 35, frequency: 'Bulanan' },
      { metric: 'Mitigasi Risiko Litigasi Korporasi', target: '0 Kasus Sengketa Tidak Tertangani', weight: 25, frequency: 'Tahunan' },
    ],
    qualifications: {
      education: 'S1/S2 Ilmu Hukum (Spesialisasi Hukum Agraria / Notariat)',
      certifications: ['Sertifikasi Advokat (PERADI) atau Sertifikat Ahli Hukum Kontrak Bisnis'],
      experience: 'Minimal 6 tahun di industri pengembang properti atau corporate legal real estate',
    },
  },

  'FIN-ACC-01': {
    jobCode: 'FIN-ACC-01',
    title: 'Finance, Accounting & Tax Lead',
    division: 'Keuangan, Pengadaan & HR',
    level: 'Manajemen Proyek',
    reportsTo: 'Finance Director',
    purpose: 'Mengelola arus kas korporasi dan pembiayaan proyek konstruksi (KYG Bank), akuntansi biaya pengembangan, pelaporan perpajakan properti (PPh Final 4 ayat 2, PPh 21, PPN), dan audit keuangan berkala.',
    responsibilities: [
      {
        category: 'Manajemen Keuangan & Cashflow Proyek',
        items: [
          'Memantau likuiditas kas operasional proyek dan Kantor Pusat Menara Bumi Raya.',
          'Mempersiapkan drawdown kredit konstruksi perbankan mitra (BTN, Mandiri, BRI, BCA).',
          'Melakukan rekonsiliasi pembayaran angsuran konsumen dan termin pencairan KPR/KPA.',
        ],
      },
      {
        category: 'Perpajakan & Laporan Finansial',
        items: [
          'Menyusun laporan SPT Masa PPN, PPh Pasal 21 pegawai proyek, dan PPh Final 2.5% peralihan hak tanah/bangunan.',
          'Menyusun Laporan Keuangan Neraca dan Laba Rugi sesuai PSAK 72 (Pendapatan Kontrak Konstruksi).',
        ],
      },
    ],
    authorities: [
      'Otorisasi verifikasi voucher pembayaran vendor dan payroll staf hingga Rp 500.000.000,-',
      'Persetujuan rekonsiliasi bank dan laporan kepatuhan pajak bulanan',
    ],
    kpiTargets: [
      { metric: 'Akurasi & Ketepatan Waktu Closing Bulanan', target: '<= Tanggal 5 Setiap Bulan', weight: 35, frequency: 'Bulanan' },
      { metric: 'Kepatuhan Pelaporan Pajak Nol Denda', target: '100% Nihil Surat Teguran Pajak', weight: 35, frequency: 'Bulanan' },
      { metric: 'Efisiensi Biaya Operasional Back Office', target: 'Varian Anggaran <= 98%', weight: 30, frequency: 'Triwulan' },
    ],
    qualifications: {
      education: 'S1 Akuntansi / Keuangan Perbankan dari universitas terakreditasi',
      certifications: ['Brevet Pajak A & B Terverifikasi', 'Certified Public Accountant (CPA) / CA'],
      experience: 'Minimal 5 tahun mengelola finance & tax developer properti',
    },
  },

  'HR-PPL-01': {
    jobCode: 'HR-PPL-01',
    title: 'HR & People Development Specialist',
    division: 'Keuangan, Pengadaan & HR',
    level: 'Spesialis Ahli',
    reportsTo: 'Head of People & Operations',
    purpose: 'Mengawal siklus SDM korporasi kantor pusat dan personil proyek, kepatuhan hubungan industrial ketenagakerjaan (PKWTT/PKWT Proyek), BPJS Ketenagakerjaan Konstruksi, evaluasi KPI, dan kultur keselamatan kerja.',
    responsibilities: [
      {
        category: 'Operasional SDM & Kepersonaliaan',
        items: [
          'Mengelola database HRIS, absensi WFO/WFH/Site, dan sinkronisasi data keterlambatan ke modul payroll.',
          'Menerbitkan Perjanjian Kerja Waktu Tertentu (PKWT) untuk seluruh tenaga ahli dan mandor lapangan.',
          'Memastikan kepatuhan jaminan BPJS Ketenagakerjaan Konstruksi aktif sebelum mobilisasi pekerjaan fisik.',
        ],
      },
      {
        category: 'Pengembangan Kompetensi & Budaya Kerja',
        items: [
          'Memfasilitasi sertifikasi profesi LPJK, SKA Ahli Teknik, dan sertifikasi AK3 Umum untuk staf teknis.',
          'Menyelenggarakan penilaian kinerja tahunan dan program retensi talenta kunci perusahaan.',
        ],
      },
    ],
    authorities: [
      'Persetujuan administrasi cuti tahunan, izin sakit, dan verifikasi klaim asuransi tenaga kerja',
      'Rekomendasi promosi jabatan dan penyesuaian grading gaji internal',
    ],
    kpiTargets: [
      { metric: 'Kepuasan & Retensi Talenta Kunci Korporat', target: 'Retensi >= 92% per Tahun', weight: 35, frequency: 'Tahunan' },
      { metric: 'Ketepatan Waktu Penerbitan Slip Payroll', target: '100% Tepat Tanggal 28-30', weight: 35, frequency: 'Bulanan' },
      { metric: 'Kepatuhan Regulasi Kemenaker & BPJS', target: '100% Terdaftar Resmi & Nihil Sanksi', weight: 30, frequency: 'Semester' },
    ],
    qualifications: {
      education: 'S1 Psikologi / Manajemen SDM / Hukum Ketenagakerjaan',
      certifications: ['Certified Human Resources Professional (CHRP)'],
      experience: 'Minimal 4 tahun menangani manajemen SDM korporasi properti/konstruksi',
    },
  },

  'SLS-PRP-01': {
    jobCode: 'SLS-PRP-01',
    title: 'Commercial Property Sales Lead',
    division: 'Pemasaran & Penjualan Properti',
    level: 'Spesialis Ahli',
    reportsTo: 'Commercial Director',
    purpose: 'Memimpin tim sales dalam pemasaran unit komersial ruko, kavling perumahan township, dan lantai kantor sewa The Sovereign Tower, menjalin kemitraan agen properti (broker), dan mencapai target closing penjualan.',
    responsibilities: [
      {
        category: 'Strategi Penjualan & Kemitraan Broker',
        items: [
          'Menyusun skema promo penjualan, diskon uang muka (DP), dan program subsidi KPR bekerjasama dengan bank mitra.',
          'Mengkoordinasikan agen properti eksternal (AREBI) dalam memasarkan proyek properti unggulan.',
          'Menyelenggarakan Customer Gathering, Open House Show Unit, dan pameran properti mall berkala.',
        ],
      },
      {
        category: 'Pelayanan Konsumen & Closing KPR',
        items: [
          'Mendampingi konsumen VIP dari tahap penandatanganan Surat Pesanan (SP) hingga Akad Kredit Notaris.',
          'Memantau proses BI Checking / SLIK OJK konsumen guna memastikan persetujuan KPR lancar.',
        ],
      },
    ],
    authorities: [
      'Otorisasi booking fee unit dan persetujuan jadwal pembayaran uang muka bertahap konsumen',
      'Persetujuan komisi agen penjualan eksternal sesuai plafon yang ditetapkan',
    ],
    kpiTargets: [
      { metric: 'Pencapaian Target Nilai Penjualan (Marketing Sales)', target: '>= 100% Target Kuartalan', weight: 50, frequency: 'Triwulan' },
      { metric: 'Tingkat Konversi Lead ke SP Booking Fee', target: '>= 12% Conversion Rate', weight: 30, frequency: 'Bulanan' },
      { metric: 'Indeks Kepuasan Konsumen Pembeli Unit', target: 'Skor >= 4.7 / 5.0', weight: 20, frequency: 'Semester' },
    ],
    qualifications: {
      education: 'S1 Manajemen Bisnis / Pemasaran / Komunikasi',
      certifications: ['Sertifikasi Manajemen Penjualan Properti (AREBI / BNSP)'],
      experience: 'Minimal 5 tahun sebagai sales lead di properti residensial / high-rise commercial',
    },
  },
};
