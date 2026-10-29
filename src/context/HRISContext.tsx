'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ActiveNavModule,
  PropertySite,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  ApprovalItem,
} from '@/types/hris';
import {
  INITIAL_PROPERTY_SITES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_APPROVALS,
} from '@/data/mockData';
import { supabase } from '@/lib/supabase';

interface HRISContextType {
  // Navigation
  activeModule: ActiveNavModule;
  setActiveModule: (module: ActiveNavModule) => void;
  selectedSiteFilter: string;
  setSelectedSiteFilter: (siteId: string) => void;

  // Core Data
  sites: PropertySite[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  approvals: ApprovalItem[];
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

  // Actions
  handleOpenPaySlipByEmployee: (emp: Employee) => void;
  handleCheckInSuccess: (newRecord: AttendanceRecord) => void;
  handleAddEmployee: (newEmp: Employee) => void;
  handleUpdateApprovalStatus: (itemId: string, newStatus: 'Disetujui' | 'Ditolak', reviewNote: string) => void;
  handleQuickApprove: (id: string) => void;
  handleAddNewApproval: (newItem: ApprovalItem) => void;
  handleBatchProcessPayroll: () => void;
  handleUpdateSiteRadius: (siteId: string, radius: number) => void;
  refetchData: () => Promise<void>;
}

const HRISContext = createContext<HRISContextType | undefined>(undefined);

export function HRISProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<ActiveNavModule>('dashboard');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  // Core Data States (Initialized with local fallback)
  const [sites, setSites] = useState<PropertySite[]>(INITIAL_PROPERTY_SITES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState<Employee | null>(null);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<PayrollRecord | null>(null);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ApprovalItem | null>(null);
  const [isLiveCheckInOpen, setIsLiveCheckInOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

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
          }))
        );
      }

      // Fetch Attendance
      const { data: attData, error: attErr } = await supabase.from('attendance_records').select('*').order('date', { ascending: false });
      if (!attErr && attData && attData.length > 0) {
        setAttendanceRecords(
          attData.map((a: any) => ({
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
            notes: a.notes,
          }))
        );
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
    setAttendanceRecords((prev) => [newRecord, ...prev]);

    // Persist to Supabase
    try {
      await supabase.from('attendance_records').insert({
        id: newRecord.id,
        employee_id: newRecord.employeeId,
        employee_name: newRecord.employeeName,
        job_code: newRecord.jobCode,
        division: newRecord.division,
        site_id: newRecord.siteId,
        site_name: newRecord.siteName,
        date: newRecord.date,
        check_in_time: newRecord.checkInTime,
        check_out_time: newRecord.checkOutTime || null,
        shift: newRecord.shift,
        status: newRecord.status,
        late_minutes: newRecord.lateMinutes,
        geofence_distance_meters: newRecord.geofenceDistanceMeters,
        geofence_verified: newRecord.geofenceVerified,
        biometric_verified: newRecord.biometricVerified,
        ppe_compliance: newRecord.ppeCompliance,
        device_info: newRecord.deviceInfo,
        notes: newRecord.notes || null,
      });
    } catch (e) {
      console.error('Failed to sync attendance to Supabase:', e);
    }
  };

  // Add Employee Callback
  const handleAddEmployee = async (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
    const newPay: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      period: 'Oktober 2026',
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

    // Persist to Supabase
    try {
      await supabase.from('employees').insert({
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

  const handleBatchProcessPayroll = async () => {
    setPayrollRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'Dibayar',
        disbursementDate: 'Hari Ini, 29 Okt 2026',
      }))
    );

    try {
      await supabase
        .from('payroll_records')
        .update({
          status: 'Dibayar',
          disbursement_date: 'Hari Ini, 29 Okt 2026',
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
    handleOpenPaySlipByEmployee,
    handleCheckInSuccess,
    handleAddEmployee,
    handleUpdateApprovalStatus,
    handleQuickApprove,
    handleAddNewApproval,
    handleBatchProcessPayroll,
    handleUpdateSiteRadius,
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
