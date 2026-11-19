'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  ActiveNavModule,
  PropertySite,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  ApprovalItem,
  SystemSettings,
} from '@/types/hris';
import {
  INITIAL_PROPERTY_SITES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_APPROVALS,
  DEFAULT_SYSTEM_SETTINGS,
} from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { generateProjectCode, fetchNextProjectCode } from '@/utils/projectCodeGenerator';
import { createEmployeeAccount } from '@/lib/accounts';
import { uploadAttendanceSelfie } from '@/lib/storage';
import { DynamicAlertData } from '@/components/ui';

interface HRISContextType {
  // Navigation
  activeModule: ActiveNavModule;
  setActiveModule: (module: ActiveNavModule) => void;
  selectedSiteFilter: string;
  setSelectedSiteFilter: (siteId: string) => void;

  // Dynamic Alert / Toast (Dynamic Island style)
  dynamicAlert: DynamicAlertData | null;
  showDynamicAlert: (data: Omit<DynamicAlertData, 'id'>) => void;
  dismissDynamicAlert: () => void;

  // Core Data
  sites: PropertySite[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  approvals: ApprovalItem[];
  systemSettings: SystemSettings;
  isLoading: boolean;

  // Derived
  pendingApprovalsCount: number;

  // Modal State
  selectedEmployeeForCard: Employee | null;
  setSelectedEmployeeForCard: (emp: Employee | null) => void;
  selectedPayrollForSlip: PayrollRecord | null;
  setSelectedPayrollForSlip: (rec: PayrollRecord | null) => void;
  selectedApprovalItem: ApprovalItem | null;
  setSelectedApprovalItem: (item: ApprovalItem | null) => void;
  isLiveCheckInOpen: boolean;
  setIsLiveCheckInOpen: (open: boolean) => void;
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  selectedEmployeeForEdit: Employee | null;
  setSelectedEmployeeForEdit: (emp: Employee | null) => void;
  isEditEmployeeOpen: boolean;
  setIsEditEmployeeOpen: (open: boolean) => void;
  openEditEmployee: (emp: Employee) => void;

  // Actions
  handleOpenPaySlipByEmployee: (emp: Employee) => void;
  handleCheckInSuccess: (newRecord: AttendanceRecord) => void;
  handleCheckOut: (recordId: string, photoUrl?: string) => void;
  handleEditAttendance: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  handleAddEmployee: (newEmp: Employee) => void;
  handleUpdateEmployee: (updatedEmp: Employee) => void;
  handleDeleteEmployee: (empId: string, permanent?: boolean) => void;
  handleUpdateApprovalStatus: (itemId: string, newStatus: 'Disetujui' | 'Ditolak', reviewNote: string) => void;
  handleQuickApprove: (id: string) => void;
  handleAddNewApproval: (newItem: ApprovalItem) => void;
  handleBatchProcessPayroll: () => void;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  handleUpdateSiteRadius: (siteId: string, radius: number) => void;
  handleAddProject: (project: Partial<PropertySite>) => void;
  handleUpdateProject: (projectId: string, project: Partial<PropertySite>) => void;
  handleDeleteProject: (projectId: string) => void;
  refetchData: () => Promise<void>;
}

const HRISContext = createContext<HRISContextType | undefined>(undefined);

// Valid module paths — used for URL sync
const VALID_MODULES: ActiveNavModule[] = ['dashboard', 'employees', 'attendance', 'payroll', 'approvals', 'reports', 'settings'];

const getModuleFromPath = (path: string): ActiveNavModule => {
  if (!path) return 'dashboard';
  const clean = path.replace(/^\//, '').split('?')[0].split('#')[0] as ActiveNavModule;
  return VALID_MODULES.includes(clean) ? clean : 'dashboard';
};

// Auto-archive sanitizer: record dari hari-hari sebelumnya yang belum checkout otomatis ditutup
function autoArchiveAttendanceRecords(records: AttendanceRecord[]): AttendanceRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  return records.map((rec) => {
    if (rec.date < today && (!rec.checkOutTime || rec.checkOutTime === '-')) {
      const isOffice = rec.siteId === 'SITE-HQ' || (rec.shift && rec.shift.includes('Kantor'));
      const defaultOut = isOffice ? '17:30 WITA' : '16:00 WITA';
      return {
        ...rec,
        checkOutTime: defaultOut,
        notes: rec.notes ? `${rec.notes} · Auto-close pergantian hari` : 'Auto-close sistem pergantian hari',
      };
    }
    return rec;
  });
}

export function HRISProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Initialize activeModule from the current URL path or window.location
  const [activeModule, _setActiveModule] = useState<ActiveNavModule>(() => {
    if (typeof window !== 'undefined') {
      return getModuleFromPath(window.location.pathname);
    }
    return getModuleFromPath(pathname);
  });

  // Sync activeModule when browser back/forward or mobile swipe gesture changes history
  useEffect(() => {
    const handlePopState = () => {
      const module = getModuleFromPath(window.location.pathname);
      _setActiveModule(module);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync activeModule when router pathname changes
  useEffect(() => {
    const module = getModuleFromPath(pathname);
    _setActiveModule(module);
  }, [pathname]);

  // Public setter: updates state AND pushes to browser history stack dynamically
  const setActiveModule = useCallback((module: ActiveNavModule) => {
    _setActiveModule(module);
    if (typeof window !== 'undefined') {
      const targetPath = '/' + module;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ module }, '', targetPath);
      }
    }
  }, []);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  // Core Data States (Initialized with local fallback)
  // Auto-archive dijalankan di useEffect (setelah mount) agar tidak trigger new Date() saat prerender
  const [sites, setSites] = useState<PropertySite[]>(INITIAL_PROPERTY_SITES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState<Employee | null>(null);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<PayrollRecord | null>(null);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ApprovalItem | null>(null);
  const [isLiveCheckInOpen, setIsLiveCheckInOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);

  // Dynamic Alert / Toast State
  const [dynamicAlert, setDynamicAlert] = useState<DynamicAlertData | null>(null);

  const showDynamicAlert = useCallback((data: Omit<DynamicAlertData, 'id'>) => {
    setDynamicAlert({ ...data, id: `ALT-${Date.now()}` });
  }, []);

  const dismissDynamicAlert = useCallback(() => {
    setDynamicAlert(null);
  }, []);

  // Auto-archive saat mount (client-side only) — aman dari Next.js prerender restriction
  useEffect(() => {
    setAttendanceRecords((prev) => autoArchiveAttendanceRecords(prev));

    // Load persisted system settings from localStorage
    try {
      const saved = localStorage.getItem('hris_system_settings');
      if (saved) {
        setSystemSettings((prev) => ({
          ...prev,
          ...JSON.parse(saved),
        }));
      }
    } catch (e) {
      console.warn('Failed to load system settings from localStorage:', e);
    }
  }, []);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch Sites
      const { data: sitesData, error: sitesErr } = await supabase.from('property_sites').select('*');
      if (!sitesErr && sitesData && sitesData.length > 0) {
        setSites(
          sitesData.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            category: s.category,
            location: s.location,
            latitude: Number(s.latitude),
            longitude: Number(s.longitude),
            geofenceRadiusMeters: s.geofence_radius_meters,
            activeWorkforce: s.active_workforce,
            siteManager: s.site_manager,
            projectProgressPercentage: s.project_progress_percentage,
            status: s.status,
          }))
        );
      }

      // Fetch Employees
      const { data: empData, error: empErr } = await supabase.from('employees').select('*');
      if (!empErr && empData && empData.length > 0) {
        setEmployees(
          empData.map((e: any) => ({
            id: e.id,
            nik: e.nik,
            name: e.name,
            title: e.title,
            jobCode: e.job_code,
            division: e.division,
            siteId: e.site_id,
            siteName: e.site_name,
            email: e.email,
            phone: e.phone,
            joinDate: e.join_date,
            status: e.status,
            contractType: e.contract_type,
            k3Certified: e.k3_certified,
            bloodType: e.blood_type,
            emergencyContact: e.emergency_contact,
            baseSalary: Number(e.base_salary),
            siteAllowance: Number(e.site_allowance),
            k3Allowance: Number(e.k3_allowance),
            transportMealAllowance: Number(e.transport_meal_allowance),
            bankAccount: e.bank_account,
            initials: e.initials,
            avatarColor: e.avatar_color,
            photoUrl: e.photo_url || undefined,
          }))
        );
      }

      // Fetch Attendance — auto-archive record hari lalu yang belum checkout
      const { data: attData, error: attErr } = await supabase.from('attendance_records').select('*').order('date', { ascending: false });
      if (!attErr && attData && attData.length > 0) {
        const mapped: AttendanceRecord[] = attData.map((a: any) => ({
          id: a.id,
          employeeId: a.employee_id,
          employeeName: a.employee_name,
          jobCode: a.job_code,
          division: a.division,
          siteId: a.site_id,
          siteName: a.site_name,
          date: a.date,
          checkInTime: a.check_in_time,
          checkOutTime: a.check_out_time,
          shift: a.shift,
          status: a.status,
          lateMinutes: a.late_minutes,
          geofenceDistanceMeters: a.geofence_distance_meters,
          geofenceVerified: a.geofence_verified,
          biometricVerified: a.biometric_verified,
          ppeCompliance: a.ppe_compliance,
          deviceInfo: a.device_info,
          photoUrl: a.check_in_photo_url || a.photo_url || undefined,
          checkInPhotoUrl: a.check_in_photo_url || a.photo_url || undefined,
          checkOutPhotoUrl: a.check_out_photo_url || undefined,
          notes: a.notes,
        }));
        setAttendanceRecords(autoArchiveAttendanceRecords(mapped));
      }

      // Fetch Payroll
      const { data: payData, error: payErr } = await supabase.from('payroll_records').select('*');
      if (!payErr && payData && payData.length > 0) {
        setPayrollRecords(
          payData.map((p: any) => ({
            id: p.id,
            period: p.period,
            employeeId: p.employee_id,
            employeeName: p.employee_name,
            nik: p.nik,
            jobCode: p.job_code,
            division: p.division,
            siteName: p.site_name,
            gajiPokok: Number(p.gaji_pokok),
            tunjanganJabatan: Number(p.tunjangan_jabatan),
            tunjanganProyekLapangan: Number(p.tunjangan_proyek_lapangan),
            tunjanganK3: Number(p.tunjangan_k3),
            uangMakanTransport: Number(p.uang_makan_transport),
            upahLembur: Number(p.upah_lembur),
            lemburHours: p.lembur_hours,
            totalEarnings: Number(p.total_earnings),
            potonganBPJSTK: Number(p.potongan_bpjstk),
            potonganBPJSKes: Number(p.potongan_bpjs_kes),
            potonganPPh21: Number(p.potongan_pph21),
            potonganKeterlambatan: Number(p.potongan_keterlambatan),
            totalDeductions: Number(p.total_deductions),
            gajiBersih: Number(p.gaji_bersih),
            status: p.status,
            disbursementDate: p.disbursement_date,
            paymentMethod: p.payment_method,
          }))
        );
      }

      // Fetch Approvals
      const { data: appData, error: appErr } = await supabase.from('approval_items').select('*').order('date_requested', { ascending: false });
      if (!appErr && appData && appData.length > 0) {
        setApprovals(
          appData.map((ap: any) => ({
            id: ap.id,
            ticketNumber: ap.ticket_number,
            type: ap.type,
            employeeId: ap.employee_id,
            employeeName: ap.employee_name,
            jobCode: ap.job_code,
            division: ap.division,
            siteId: ap.site_id,
            siteName: ap.site_name,
            dateRequested: ap.date_requested,
            description: ap.description,
            costEstimate: ap.cost_estimate ? Number(ap.cost_estimate) : undefined,
            duration: ap.duration,
            status: ap.status,
            priority: ap.priority,
            steps: ap.steps || [],
          }))
        );
      }

      // Fetch System Settings from Supabase
      try {
        const { data: settingsData, error: settingsErr } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!settingsErr && settingsData) {
          const loadedSettings: SystemSettings = {
            toleranceMinutes: Number(settingsData.tolerance_minutes) || 15,
            lateDeductionPerMinute: Number(settingsData.late_deduction_per_minute) || 5000,
            bpjsRate: Number(settingsData.bpjs_rate) || 3.0,
            k3BonusRate: Number(settingsData.k3_bonus_rate) || 1500000,
            overtimeRatePerHour: Number(settingsData.overtime_rate_per_hour) || 80000,
            updatedAt: settingsData.updated_at,
          };
          setSystemSettings(loadedSettings);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('hris_system_settings', JSON.stringify(loadedSettings));
            } catch (e) {
              console.warn('Failed to cache system settings:', e);
            }
          }
        }
      } catch (e) {
        console.warn('Supabase system_settings table might not be migrated yet, using fallback:', e);
      }
    } catch (err) {
      console.warn('Using local fallback data. Supabase connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingApprovalsCount = approvals.filter((a) => a.status.includes('Menunggu')).length;

  // Open Pay Slip by Employee
  const handleOpenPaySlipByEmployee = (emp: Employee) => {
    let rec = payrollRecords.find((p) => p.employeeId === emp.id);
    if (!rec) {
      rec = {
        id: `PAY-NEW-${emp.id}`,
        period: 'Oktober 2026',
        employeeId: emp.id,
        employeeName: emp.name,
        nik: emp.nik,
        jobCode: emp.jobCode,
        division: emp.division,
        siteName: emp.siteName,
        gajiPokok: emp.baseSalary,
        tunjanganJabatan: 2000000,
        tunjanganProyekLapangan: emp.siteAllowance,
        tunjanganK3: emp.k3Allowance,
        uangMakanTransport: emp.transportMealAllowance,
        upahLembur: 0,
        lemburHours: 0,
        totalEarnings: emp.baseSalary + 2000000 + emp.siteAllowance + emp.k3Allowance + emp.transportMealAllowance,
        potonganBPJSTK: Math.round(emp.baseSalary * 0.03),
        potonganBPJSKes: Math.round(emp.baseSalary * 0.01),
        potonganPPh21: Math.round(emp.baseSalary * 0.08),
        potonganKeterlambatan: 0,
        totalDeductions: Math.round(emp.baseSalary * 0.12),
        gajiBersih: Math.round(emp.baseSalary * 0.88) + 2000000 + emp.siteAllowance + emp.k3Allowance + emp.transportMealAllowance,
        status: 'Draft',
        disbursementDate: '31 Okt 2026',
        paymentMethod: emp.bankAccount,
      };
    }
    setSelectedPayrollForSlip(rec);
  };

  // Check-In Success Callback
  const handleCheckInSuccess = async (newRecord: AttendanceRecord) => {
    // 1. Upload foto selfie masuk ke Object Storage Supabase (fallback ke data URL bila bucket belum di-run)
    let storedPhotoUrl = newRecord.photoUrl || newRecord.checkInPhotoUrl;
    if (storedPhotoUrl) {
      try {
        storedPhotoUrl = await uploadAttendanceSelfie(storedPhotoUrl, {
          employeeId: newRecord.employeeId,
          type: 'in',
          date: newRecord.date,
        });
      } catch (err) {
        console.warn('Storage upload error during check-in:', err);
      }
    }

    const processedRecord: AttendanceRecord = {
      ...newRecord,
      photoUrl: storedPhotoUrl,
      checkInPhotoUrl: storedPhotoUrl,
    };

    setAttendanceRecords((prev) => [processedRecord, ...prev]);

    // Trigger Modern Dynamic Alert Toast
    if (newRecord.status === 'Cuti' || newRecord.status === 'Izin Lapangan') {
      showDynamicAlert({
        type: 'LEAVE',
        title: 'Pengajuan Izin Diterima! 📝',
        subtitle: `${newRecord.employeeName} · ${newRecord.notes || 'Tercatat di sistem HRIS'}`,
        time: newRecord.date,
      });
    } else {
      showDynamicAlert({
        type: 'CHECK_IN',
        title: 'Presensi Masuk Berhasil! 🟢',
        subtitle: `${newRecord.employeeName} · ${newRecord.siteName}`,
        time: newRecord.checkInTime,
        meta:
          newRecord.lateMinutes > 0
            ? `Terlambat +${newRecord.lateMinutes} menit`
            : 'Tepat Waktu · Status Hadir Tercatat',
      });
    }

    // Persist to Supabase
    try {
      const payload: any = {
        id: processedRecord.id,
        employee_id: processedRecord.employeeId,
        employee_name: processedRecord.employeeName,
        job_code: processedRecord.jobCode,
        division: processedRecord.division,
        site_id: processedRecord.siteId,
        site_name: processedRecord.siteName,
        date: processedRecord.date,
        check_in_time: processedRecord.checkInTime,
        check_out_time: processedRecord.checkOutTime || null,
        shift: processedRecord.shift,
        status: processedRecord.status,
        late_minutes: processedRecord.lateMinutes,
        geofence_distance_meters: processedRecord.geofenceDistanceMeters,
        geofence_verified: processedRecord.geofenceVerified,
        biometric_verified: processedRecord.biometricVerified,
        ppe_compliance: processedRecord.ppeCompliance,
        device_info: processedRecord.deviceInfo,
        photo_url: processedRecord.photoUrl || null,
        check_in_photo_url: processedRecord.checkInPhotoUrl || null,
        check_out_photo_url: processedRecord.checkOutPhotoUrl || null,
        notes: processedRecord.notes || null,
      };

      const { error: insertErr } = await supabase.from('attendance_records').insert(payload);
      if (insertErr) {
        // Fallback jika kolom check_in_photo_url atau photo_url belum ada di Supabase
        if (insertErr.message?.includes('check_in_photo_url')) {
          delete payload.check_in_photo_url;
          delete payload.check_out_photo_url;
        }
        if (insertErr.message?.includes('photo_url')) {
          delete payload.photo_url;
        }
        await supabase.from('attendance_records').insert(payload);
      }
    } catch (e) {
      console.error('Failed to sync attendance to Supabase:', e);
    }
  };

  // Check-Out Callback — update checkOutTime, calculate lembur & simpan foto pulang terpisah
  const handleCheckOut = async (recordId: string, photoUrl?: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const checkOutTime = `${hh}:${mm} WITA`;

    // Office shift ends at 17:30, Field shift ends at 16:00
    const rec = attendanceRecords.find((a) => a.id === recordId);
    const isOffice = rec?.siteId === 'SITE-HQ' || (rec?.shift && rec.shift.includes('Kantor'));
    const shiftEndHour = isOffice ? 17 : 16;
    const shiftEndMinute = isOffice ? 30 : 0;

    let lemburHours = 0;
    if (now.getHours() > shiftEndHour || (now.getHours() === shiftEndHour && now.getMinutes() > shiftEndMinute)) {
      const diffMinutes = (now.getHours() - shiftEndHour) * 60 + (now.getMinutes() - shiftEndMinute);
      lemburHours = Math.round((diffMinutes / 60) * 10) / 10;
    }

    // Rp 25.000 per overtime hour (approximation)
    const upahLemburPerJam = 25000;
    const upahLembur = Math.round(lemburHours * upahLemburPerJam);

    // Upload foto selfie pulang ke Object Storage
    let storedOutPhotoUrl = photoUrl;
    if (photoUrl) {
      try {
        storedOutPhotoUrl = await uploadAttendanceSelfie(photoUrl, {
          employeeId: rec?.employeeId || 'emp',
          type: 'out',
          date: rec?.date || new Date().toISOString().slice(0, 10),
        });
      } catch (err) {
        console.warn('Storage upload error during check-out:', err);
      }
    }

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              checkOutTime,
              checkInPhotoUrl: r.checkInPhotoUrl || r.photoUrl,
              ...(storedOutPhotoUrl ? { checkOutPhotoUrl: storedOutPhotoUrl } : {}),
            }
          : r
      )
    );

    // Trigger Modern Dynamic Alert Toast for Check-Out
    showDynamicAlert({
      type: 'CHECK_OUT',
      title: 'Presensi Pulang Berhasil! 👏',
      subtitle: `${rec?.employeeName || 'Karyawan'} · ${rec?.siteName || 'Griya Bumi Raya'}`,
      time: checkOutTime,
      meta:
        lemburHours > 0
          ? `Lembur Tercatat: +${lemburHours} Jam`
          : 'Jam Kerja Selesai · Selamat Beristirahat!',
    });

    // Sync payroll overtime if > 0
    if (lemburHours > 0) {
      setPayrollRecords((prev) =>
        prev.map((p) => {
          const rec = attendanceRecords.find((a) => a.id === recordId);
          if (rec && p.employeeId === rec.employeeId) {
            const newLemburHours = p.lemburHours + lemburHours;
            const newUpahLembur = p.upahLembur + upahLembur;
            const newTotalEarnings = p.totalEarnings + upahLembur;
            const newGajiBersih = p.gajiBersih + upahLembur;
            return {
              ...p,
              lemburHours: newLemburHours,
              upahLembur: newUpahLembur,
              totalEarnings: newTotalEarnings,
              gajiBersih: newGajiBersih,
            };
          }
          return p;
        })
      );
    }

    try {
      const checkOutUpdates: Record<string, unknown> = {
        check_out_time: checkOutTime,
      };
      if (storedOutPhotoUrl) {
        checkOutUpdates.check_out_photo_url = storedOutPhotoUrl;
      }

      const { error: updateErr } = await supabase
        .from('attendance_records')
        .update(checkOutUpdates)
        .eq('id', recordId);

      // Fallback jika kolom check_out_photo_url belum ada di Supabase
      if (updateErr && updateErr.message?.includes('check_out_photo_url')) {
        delete checkOutUpdates.check_out_photo_url;
        await supabase
          .from('attendance_records')
          .update(checkOutUpdates)
          .eq('id', recordId);
      }
    } catch (e) {
      console.error('Failed to sync check-out to Supabase:', e);
    }
  };

  // Edit / Koreksi Manual Absensi oleh Admin
  const handleEditAttendance = async (recordId: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );

    // Build Supabase column map for known updatable fields
    const dbUpdates: Record<string, unknown> = {};
    if (updates.checkInTime !== undefined) dbUpdates.check_in_time = updates.checkInTime;
    if (updates.checkOutTime !== undefined) dbUpdates.check_out_time = updates.checkOutTime;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lateMinutes !== undefined) dbUpdates.late_minutes = updates.lateMinutes;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.ppeCompliance !== undefined) dbUpdates.ppe_compliance = updates.ppeCompliance;
    if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;

    try {
      await supabase.from('attendance_records').update(dbUpdates).eq('id', recordId);
    } catch (e) {
      console.error('Failed to sync attendance edit to Supabase:', e);
    }
  };

  // Add Employee Callback
  const handleAddEmployee = async (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
    const now = new Date();
    const period = `${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}`;
    const newPay: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      period: period,
      employeeId: newEmp.id,
      employeeName: newEmp.name,
      nik: newEmp.nik,
      jobCode: newEmp.jobCode,
      division: newEmp.division,
      siteName: newEmp.siteName,
      gajiPokok: newEmp.baseSalary,
      tunjanganJabatan: 1500000,
      tunjanganProyekLapangan: newEmp.siteAllowance,
      tunjanganK3: newEmp.k3Allowance,
      uangMakanTransport: newEmp.transportMealAllowance,
      upahLembur: 0,
      lemburHours: 0,
      totalEarnings: newEmp.baseSalary + 1500000 + newEmp.siteAllowance + newEmp.k3Allowance + newEmp.transportMealAllowance,
      potonganBPJSTK: Math.round(newEmp.baseSalary * 0.03),
      potonganBPJSKes: Math.round(newEmp.baseSalary * 0.01),
      potonganPPh21: Math.round(newEmp.baseSalary * 0.06),
      potonganKeterlambatan: 0,
      totalDeductions: Math.round(newEmp.baseSalary * 0.10),
      gajiBersih: Math.round(newEmp.baseSalary * 0.90) + 1500000 + newEmp.siteAllowance + newEmp.k3Allowance + newEmp.transportMealAllowance,
      status: 'Draft',
      disbursementDate: '31 Okt 2026',
      paymentMethod: newEmp.bankAccount,
    };
    setPayrollRecords((prev) => [newPay, ...prev]);
    showDynamicAlert({ type: 'CHECK_IN', title: 'Karyawan Berhasil Ditambahkan! 🎉', subtitle: `${newEmp.name} · ${newEmp.title}`, time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}), meta: `NIK: ${newEmp.nik} · ${newEmp.siteName}` });

    // Persist to Supabase
    try {
      const { error: employeeError } = await supabase.from('employees').insert({
        id: newEmp.id,
        nik: newEmp.nik,
        name: newEmp.name,
        title: newEmp.title,
        job_code: newEmp.jobCode,
        division: newEmp.division,
        site_id: newEmp.siteId,
        site_name: newEmp.siteName,
        email: newEmp.email,
        phone: newEmp.phone,
        join_date: newEmp.joinDate,
        status: newEmp.status,
        contract_type: newEmp.contractType,
        k3_certified: newEmp.k3Certified,
        blood_type: newEmp.bloodType,
        emergency_contact: newEmp.emergencyContact,
        base_salary: newEmp.baseSalary,
        site_allowance: newEmp.siteAllowance,
        k3_allowance: newEmp.k3Allowance,
        transport_meal_allowance: newEmp.transportMealAllowance,
        bank_account: newEmp.bankAccount,
        initials: newEmp.initials,
        avatar_color: newEmp.avatarColor,
      });
      if (employeeError) throw employeeError;

      await createEmployeeAccount(newEmp);

      await supabase.from('payroll_records').insert({
        id: newPay.id,
        period: newPay.period,
        employee_id: newPay.employeeId,
        employee_name: newPay.employeeName,
        nik: newPay.nik,
        job_code: newPay.jobCode,
        division: newPay.division,
        site_name: newPay.siteName,
        gaji_pokok: newPay.gajiPokok,
        tunjangan_jabatan: newPay.tunjanganJabatan,
        tunjangan_proyek_lapangan: newPay.tunjanganProyekLapangan,
        tunjangan_k3: newPay.tunjanganK3,
        uang_makan_transport: newPay.uangMakanTransport,
        upah_lembur: newPay.upahLembur,
        lembur_hours: newPay.lemburHours,
        total_earnings: newPay.totalEarnings,
        potongan_bpjstk: newPay.potonganBPJSTK,
        potongan_bpjs_kes: newPay.potonganBPJSKes,
        potongan_pph21: newPay.potonganPPh21,
        potongan_keterlambatan: newPay.potonganKeterlambatan,
        total_deductions: newPay.totalDeductions,
        gaji_bersih: newPay.gajiBersih,
        status: newPay.status,
        disbursement_date: newPay.disbursementDate,
        payment_method: newPay.paymentMethod,
      });
    } catch (e) {
      console.error('Failed to sync new employee to Supabase:', e);
    }
  };

  // Open Edit Employee Modal
  const openEditEmployee = (emp: Employee) => {
    setSelectedEmployeeForEdit(emp);
    setIsEditEmployeeOpen(true);
  };

  // Update Employee
  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    const newInitials = updatedEmp.name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0].toUpperCase()).join('') || 'EM';
    const finalEmp = { ...updatedEmp, initials: newInitials };
    setEmployees((prev) =>
      prev.map((e) => (e.id === finalEmp.id ? finalEmp : e))
    );

    // Synchronize matching payroll record if exists
    setPayrollRecords((prev) =>
      prev.map((p) => {
        if (p.employeeId === updatedEmp.id) {
          const baseSalary = updatedEmp.baseSalary;
          const transportMealAllowance = updatedEmp.transportMealAllowance;
          const totalEarnings =
            baseSalary +
            p.tunjanganJabatan +
            updatedEmp.siteAllowance +
            updatedEmp.k3Allowance +
            transportMealAllowance +
            p.upahLembur;
          const totalDeductions =
            p.potonganBPJSTK +
            p.potonganBPJSKes +
            p.potonganPPh21 +
            p.potonganKeterlambatan;
          return {
            ...p,
            employeeName: updatedEmp.name,
            nik: updatedEmp.nik,
            division: updatedEmp.division,
            siteName: updatedEmp.siteName,
            gajiPokok: baseSalary,
            uangMakanTransport: transportMealAllowance,
            totalEarnings,
            gajiBersih: totalEarnings - totalDeductions,
            paymentMethod: updatedEmp.bankAccount || p.paymentMethod,
          };
        }
        return p;
      })
    );

    // Sync to Supabase
    try {
      await supabase
        .from('employees')
        .update({
          name: finalEmp.name,
          nik: finalEmp.nik,
          title: finalEmp.title,
          division: finalEmp.division,
          site_id: finalEmp.siteId,
          site_name: finalEmp.siteName,
          email: finalEmp.email,
          phone: finalEmp.phone,
          status: finalEmp.status,
          contract_type: finalEmp.contractType,
          k3_certified: finalEmp.k3Certified,
          blood_type: finalEmp.bloodType || null,
          base_salary: finalEmp.baseSalary,
          transport_meal_allowance: finalEmp.transportMealAllowance,
          site_allowance: finalEmp.siteAllowance,
          k3_allowance: finalEmp.k3Allowance || 0,
          bank_account: finalEmp.bankAccount,
          emergency_contact: finalEmp.emergencyContact,
          join_date: finalEmp.joinDate,
          initials: finalEmp.initials,
        })
        .eq('id', finalEmp.id);
    } catch (e) {
      console.error('Failed to sync employee update to Supabase:', e);
    }

    showDynamicAlert({
      type: 'CHECK_IN',
      title: 'Data Karyawan Diperbarui ✅',
      subtitle: `${finalEmp.name} · ${finalEmp.title}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      meta: `Penempatan: ${finalEmp.siteName} (${finalEmp.status})`,
    });
  };

  // Delete / Deactivate Employee
  const handleDeleteEmployee = async (empId: string, permanent: boolean = false) => {
    const empToDelete = employees.find((e) => e.id === empId);

    if (permanent) {
      setEmployees((prev) => prev.filter((e) => e.id !== empId));
      try {
        await supabase.from('employees').delete().eq('id', empId);
      } catch (e) {
        console.error('Failed to delete employee from Supabase:', e);
      }
    } else {
      // Soft Deactivate
      setEmployees((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, status: 'Nonaktif' } : e))
      );
      try {
        await supabase
          .from('employees')
          .update({
            status: 'Nonaktif',
          })
          .eq('id', empId);
      } catch (e) {
        console.error('Failed to deactivate employee in Supabase:', e);
      }
    }

    showDynamicAlert({
      type: 'CHECK_OUT',
      title: permanent ? 'Karyawan Dihapus Permanen 🗑️' : 'Karyawan Dinonaktifkan ⏸️',
      subtitle: empToDelete?.name || empId,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      meta: permanent ? 'Data dihapus permanen dari sistem' : 'Status berhasil diubah ke Nonaktif',
    });
  };

  // Update Approval Status
  const handleUpdateApprovalStatus = async (
    itemId: string,
    newStatus: 'Disetujui' | 'Ditolak',
    reviewNote: string
  ) => {
    let updatedStepsToSave: any = [];
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedSteps = [...item.steps];
          updatedSteps.forEach((s) => {
            if (s.status === 'pending') {
              s.status = newStatus === 'Disetujui' ? 'completed' : 'rejected';
              s.timestamp = 'Hari Ini, Diverifikasi';
              s.note = reviewNote;
            }
          });
          updatedStepsToSave = updatedSteps;
          return { ...item, status: newStatus, steps: updatedSteps };
        }
        return item;
      })
    );

    // Sync to Supabase
    try {
      await supabase
        .from('approval_items')
        .update({
          status: newStatus,
          steps: updatedStepsToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);
    } catch (e) {
      console.error('Failed to update approval in Supabase:', e);
    }
  };

  const handleQuickApprove = (id: string) => {
    handleUpdateApprovalStatus(id, 'Disetujui', 'Disetujui cepat via Matriks Persetujuan.');
  };

  const handleAddNewApproval = async (newItem: ApprovalItem) => {
    setApprovals((prev) => [newItem, ...prev]);

    // Sync to Supabase
    try {
      await supabase.from('approval_items').insert({
        id: newItem.id,
        ticket_number: newItem.ticketNumber,
        type: newItem.type,
        employee_id: newItem.employeeId,
        employee_name: newItem.employeeName,
        job_code: newItem.jobCode,
        division: newItem.division,
        site_id: newItem.siteId,
        site_name: newItem.siteName,
        date_requested: newItem.dateRequested,
        description: newItem.description,
        cost_estimate: newItem.costEstimate || 0,
        duration: newItem.duration || null,
        status: newItem.status,
        priority: newItem.priority,
        steps: newItem.steps,
      });
    } catch (e) {
      console.error('Failed to insert approval into Supabase:', e);
    }
  };

  const handleUpdateSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    const now = new Date().toISOString();
    const updated: SystemSettings = {
      ...systemSettings,
      ...newSettings,
      updatedAt: now,
    };

    setSystemSettings(updated);

    // 1. Simpan ke localStorage untuk instant cache & offline fallback
    try {
      localStorage.setItem('hris_system_settings', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save system settings to localStorage:', e);
    }

    // 2. Simpan permanen ke Supabase system_settings
    try {
      await supabase.from('system_settings').upsert({
        id: 'default',
        tolerance_minutes: updated.toleranceMinutes,
        late_deduction_per_minute: updated.lateDeductionPerMinute,
        bpjs_rate: updated.bpjsRate,
        k3_bonus_rate: updated.k3BonusRate,
        overtime_rate_per_hour: updated.overtimeRatePerHour,
        updated_at: now,
        updated_by: 'User Admin',
      });
    } catch (e) {
      console.warn('Supabase system_settings upsert fallback to localStorage:', e);
    }
  };

  const handleBatchProcessPayroll = async () => {
    // Calculate late deductions from attendance records before batch processing using dynamic settings
    const lateDeductionPerMinute = systemSettings.lateDeductionPerMinute || 5000;

    setPayrollRecords((prev) =>
      prev.map((r) => {
        // Sum all late minutes for this employee from current attendance data
        const totalLateMinutes = attendanceRecords
          .filter((a) => a.employeeId === r.employeeId && a.lateMinutes > 0)
          .reduce((sum, a) => sum + a.lateMinutes, 0);

        const potonganKeterlambatan = totalLateMinutes * lateDeductionPerMinute;
        const newTotalDeductions = r.potonganBPJSTK + r.potonganBPJSKes + r.potonganPPh21 + potonganKeterlambatan;
        const newGajiBersih = r.totalEarnings - newTotalDeductions;

        return {
          ...r,
          potonganKeterlambatan,
          totalDeductions: newTotalDeductions,
          gajiBersih: newGajiBersih > 0 ? newGajiBersih : 0,
          status: 'Dibayar' as const,
          disbursementDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        };
      })
    );

    try {
      await supabase
        .from('payroll_records')
        .update({
          status: 'Dibayar',
          disbursement_date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        })
        .neq('status', 'Dibayar');
    } catch (e) {
      console.error('Failed to batch update payroll in Supabase:', e);
    }
  };

  const handleUpdateSiteRadius = async (siteId: string, radius: number) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, geofenceRadiusMeters: radius } : s))
    );

    try {
      await supabase
        .from('property_sites')
        .update({ geofence_radius_meters: radius, updated_at: new Date().toISOString() })
        .eq('id', siteId);
    } catch (e) {
      console.error('Failed to update site radius in Supabase:', e);
    }
  };

  const handleAddProject = async (projectData: Partial<PropertySite>) => {
    const category = projectData.category || 'Perumahan';
    const fallbackCode = projectData.code || generateProjectCode(category, sites);
    const maxCodeAttempts = 3;

    for (let attempt = 0; attempt < maxCodeAttempts; attempt++) {
      let code = fallbackCode;

      try {
        code = await fetchNextProjectCode(category);
      } catch (error) {
        console.error('Failed to fetch next project code:', error);
      }

      const newProject: PropertySite = {
        id: `SITE-${Date.now()}`,
        name: projectData.name || '',
        code,
        category,
        location: projectData.location || '',
        latitude: projectData.latitude || -3.32,
        longitude: projectData.longitude || 114.59,
        geofenceRadiusMeters: projectData.geofenceRadiusMeters || 200,
        activeWorkforce: projectData.activeWorkforce || 0,
        siteManager: projectData.siteManager || '',
        projectProgressPercentage: projectData.projectProgressPercentage || 0,
        status: projectData.status || 'Pemasaran Aktif',
      };

      const { error } = await supabase.from('property_sites').insert({
        id: newProject.id,
        name: newProject.name,
        code: newProject.code,
        category: newProject.category,
        location: newProject.location,
        latitude: newProject.latitude,
        longitude: newProject.longitude,
        geofence_radius_meters: newProject.geofenceRadiusMeters,
        active_workforce: newProject.activeWorkforce,
        site_manager: newProject.siteManager,
        project_progress_percentage: newProject.projectProgressPercentage,
        status: newProject.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setSites((prev) => [...prev, newProject]);
        showDynamicAlert({
          type: 'SUCCESS',
          title: 'Proyek Berhasil Ditambahkan',
          subtitle: `${newProject.name} (${newProject.code}) telah terdaftar di sistem`,
        });
        return;
      }

      if (error.code !== '23505' || attempt === maxCodeAttempts - 1) {
        console.error('Failed to add project to Supabase:', error);
        return;
      }
    }
  };

  const handleUpdateProject = async (projectId: string, projectData: Partial<PropertySite>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === projectId ? { ...s, ...projectData } : s))
    );

    try {
      await supabase
        .from('property_sites')
        .update({
          name: projectData.name,
          code: projectData.code,
          category: projectData.category,
          location: projectData.location,
          latitude: projectData.latitude,
          longitude: projectData.longitude,
          geofence_radius_meters: projectData.geofenceRadiusMeters,
          active_workforce: projectData.activeWorkforce,
          site_manager: projectData.siteManager,
          project_progress_percentage: projectData.projectProgressPercentage,
          status: projectData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      showDynamicAlert({
        type: 'SUCCESS',
        title: 'Proyek Berhasil Diperbarui',
        subtitle: 'Data proyek telah disimpan',
      });
    } catch (e) {
      console.error('Failed to update project in Supabase:', e);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    // Check if there are employees assigned to this project
    const hasEmployees = employees.some((emp) => emp.siteId === projectId);
    if (hasEmployees) {
      // Use console.warn instead of alert since we can't show error type
      console.warn('Cannot delete project: employees are still assigned to this project');
      return;
    }

    const deletedSite = sites.find((s) => s.id === projectId);
    setSites((prev) => prev.filter((s) => s.id !== projectId));

    try {
      await supabase.from('property_sites').delete().eq('id', projectId);

      showDynamicAlert({
        type: 'SUCCESS',
        title: 'Proyek Berhasil Dihapus',
        subtitle: `${deletedSite?.name || 'Proyek'} telah dihapus dari sistem`,
      });
    } catch (e) {
      console.error('Failed to delete project from Supabase:', e);
    }
  };

  const value: HRISContextType = {
    activeModule,
    setActiveModule,
    selectedSiteFilter,
    setSelectedSiteFilter,
    sites,
    employees,
    attendanceRecords,
    payrollRecords,
    approvals,
    systemSettings,
    isLoading,
    pendingApprovalsCount,
    selectedEmployeeForCard,
    setSelectedEmployeeForCard,
    selectedPayrollForSlip,
    setSelectedPayrollForSlip,
    selectedApprovalItem,
    setSelectedApprovalItem,
    isLiveCheckInOpen,
    setIsLiveCheckInOpen,
    isAddEmployeeOpen,
    setIsAddEmployeeOpen,
    selectedEmployeeForEdit,
    setSelectedEmployeeForEdit,
    isEditEmployeeOpen,
    setIsEditEmployeeOpen,
    dynamicAlert,
    showDynamicAlert,
    dismissDynamicAlert,
    openEditEmployee,
    handleOpenPaySlipByEmployee,
    handleCheckInSuccess,
    handleCheckOut,
    handleEditAttendance,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleUpdateApprovalStatus,
    handleQuickApprove,
    handleAddNewApproval,
    handleBatchProcessPayroll,
    updateSystemSettings: handleUpdateSystemSettings,
    handleUpdateSiteRadius,
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject,
    refetchData: fetchData,
  };

  return <HRISContext.Provider value={value}>{children}</HRISContext.Provider>;
}

export function useHRIS() {
  const context = useContext(HRISContext);
  if (!context) {
    throw new Error('useHRIS must be used within an HRISProvider');
  }
  return context;
}
