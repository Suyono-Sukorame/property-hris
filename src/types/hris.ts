/**
 * Types and interfaces for Property HRIS
 * Mode Rintisan — disederhanakan untuk usaha properti skala kecil (4 karyawan)
 */

export type EmployeeStatus = 'Aktif' | 'Cuti' | 'Nonaktif';
export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Cuti' | 'Izin Lapangan' | 'Alpa';
export type PayrollStatus = 'Dibayar' | 'Disetujui' | 'Draft' | 'Ditolak';
export type ApprovalStatus =
  | 'Disetujui'
  | 'Menunggu Approval Pimpinan'
  | 'Menunggu Approval HR'
  | 'Menunggu Pengawas Lapangan'
  | 'Menunggu Approval Keuangan'
  | 'Ditolak';
export type ApprovalType =
  | 'Cuti Tahunan'
  | 'Kasbon Karyawan'
  | 'Izin Sakit'
  | 'Klaim Operasional Lapangan'
  | 'Lembur Konstruksi Cor Beton'
  | 'Surat Tugas K3';

export interface PropertySite {
  id: string;
  name: string;
  code: string;
  category: 'Perumahan' | 'Ruko / Komersial' | 'Tanah Kavling' | 'Kantor' | 'Mixed-Use Residential' | 'High-Rise Commercial' | 'Township Masterplan' | 'Corporate Head Office';
  location: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  activeWorkforce: number;
  siteManager: string;
  projectProgressPercentage: number;
  status: 'Pemasaran Aktif' | 'Konstruksi Aktif' | 'Finishing & Handover' | 'Operasional Kantor';
}

export interface Employee {
  id: string;
  nik: string;
  name: string;
  title: string;
  jobCode: string;
  division: string;
  siteId: string;
  siteName: string;
  email: string;
  phone: string;
  joinDate: string;
  status: EmployeeStatus;
  contractType: 'PKWTT (Tetap)' | 'PKWT (Kontrak Proyek)' | 'Konsultan Ahli';
  k3Certified: boolean;
  bloodType?: 'A+' | 'B+' | 'AB+' | 'O+' | 'O-';
  emergencyContact: string;
  baseSalary: number;
  siteAllowance: number;
  k3Allowance: number;
  transportMealAllowance: number;
  bankAccount: string;
  initials: string;
  avatarColor: string;
  photoUrl?: string;    // foto profil karyawan (data URL atau URL storage)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  jobCode: string;
  division: string;
  siteId: string;
  siteName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  shift: string;
  status: AttendanceStatus;
  lateMinutes: number;
  geofenceDistanceMeters: number;
  geofenceVerified: boolean;
  biometricVerified: boolean;
  ppeCompliance: boolean;
  workMode?: 'WFO' | 'WFH' | 'Dinas Luar' | 'Site Proyek';
  deviceInfo: string;
  photoUrl?: string; // Kompatibilitas mundur
  checkInPhotoUrl?: string; // Foto selfie saat masuk (Check-In)
  checkOutPhotoUrl?: string; // Foto selfie saat pulang (Check-Out)
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  period: string;
  employeeId: string;
  employeeName: string;
  nik: string;
  jobCode: string;
  division: string;
  siteName: string;
  gajiPokok: number;
  tunjanganJabatan: number;
  tunjanganProyekLapangan: number;
  tunjanganK3: number;
  uangMakanTransport: number;
  upahLembur: number;
  lemburHours: number;
  totalEarnings: number;
  potonganBPJSTK: number;
  potonganBPJSKes: number;
  potonganPPh21: number;
  potonganKeterlambatan: number;
  potonganKasbon?: number;
  potonganAlpa?: number;
  totalDeductions: number;
  gajiBersih: number;
  status: PayrollStatus;
  disbursementDate: string;
  paymentMethod: string;
  transferProofUrl?: string;
  transferNote?: string;
}

export interface ApprovalStep {
  role: string;
  actorName: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'rejected';
  note?: string;
}

export interface ApprovalItem {
  id: string;
  ticketNumber: string;
  type: ApprovalType;
  employeeId: string;
  employeeName: string;
  jobCode: string;
  division: string;
  siteId: string;
  siteName: string;
  dateRequested: string;
  description: string;
  costEstimate?: number;
  duration?: string;
  status: ApprovalStatus;
  priority: 'Biasa' | 'Penting' | 'Kritis';
  steps: ApprovalStep[];
}

export type ActiveNavModule =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'approvals'
  | 'reports'
  | 'settings';

export interface SystemSettings {
  toleranceMinutes: number;          // Toleransi keterlambatan (menit)
  lateDeductionPerMinute: number;    // Potongan per menit keterlambatan (Rp)
  bpjsRate: number;                  // Potongan BPJS Ketenagakerjaan (%)
  k3BonusRate: number;               // Tunjangan Sertifikat AK3 Konstruksi (Rp)
  overtimeRatePerHour: number;       // Tarif upah lembur per jam (Rp)
  updatedAt?: string;                // Timestamp terakhir pembaruan
}
