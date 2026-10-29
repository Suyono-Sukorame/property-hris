/**
 * Types and interfaces for Property HRIS
 * High-precision enterprise human resource management for property development & construction sites
 */

export type EmployeeStatus = 'Aktif' | 'Cuti' | 'Nonaktif';
export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Cuti' | 'Izin Lapangan' | 'Alpa';
export type PayrollStatus = 'Dibayar' | 'Disetujui' | 'Draft' | 'Ditolak';
export type ApprovalStatus = 'Disetujui' | 'Menunggu Approval HR' | 'Menunggu Pengawas Lapangan' | 'Ditolak';
export type ApprovalType = 'Cuti Tahunan' | 'Lembur Konstruksi Cor Beton' | 'Klaim Operasional Lapangan' | 'Surat Tugas K3';

export interface PropertySite {
  id: string;
  name: string;
  code: string;
  category: 'Mixed-Use Residential' | 'High-Rise Commercial' | 'Township Masterplan' | 'Corporate Head Office';
  location: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  activeWorkforce: number;
  siteManager: string;
  projectProgressPercentage: number;
  status: 'Konstruksi Aktif' | 'Finishing & Handover' | 'Operasional Kantor';
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
  bloodType: 'A+' | 'B+' | 'AB+' | 'O+' | 'O-';
  emergencyContact: string;
  baseSalary: number;
  siteAllowance: number;
  k3Allowance: number;
  transportMealAllowance: number;
  bankAccount: string;
  initials: string;
  avatarColor: string;
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
  ppeCompliance: boolean; // Alat Pelindung Diri (K3 Helmet & Vest)
  deviceInfo: string;
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
  totalDeductions: number;
  gajiBersih: number;
  status: PayrollStatus;
  disbursementDate: string;
  paymentMethod: string;
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
