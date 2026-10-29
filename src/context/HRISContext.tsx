'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

const HRISContext = createContext<HRISContextType | undefined>(undefined);

export function HRISProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<ActiveNavModule>('dashboard');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  // Core Data States
  const [sites, setSites] = useState<PropertySite[]>(INITIAL_PROPERTY_SITES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  // Modal States
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState<Employee | null>(null);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<PayrollRecord | null>(null);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ApprovalItem | null>(null);
  const [isLiveCheckInOpen, setIsLiveCheckInOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

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
  const handleCheckInSuccess = (newRecord: AttendanceRecord) => {
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  // Add Employee Callback
  const handleAddEmployee = (newEmp: Employee) => {
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
  };

  // Update Approval Status
  const handleUpdateApprovalStatus = (
    itemId: string,
    newStatus: 'Disetujui' | 'Ditolak',
    reviewNote: string
  ) => {
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
          return { ...item, status: newStatus, steps: updatedSteps };
        }
        return item;
      })
    );
  };

  const handleQuickApprove = (id: string) => {
    handleUpdateApprovalStatus(id, 'Disetujui', 'Disetujui cepat via Matriks Persetujuan.');
  };

  const handleAddNewApproval = (newItem: ApprovalItem) => {
    setApprovals((prev) => [newItem, ...prev]);
  };

  const handleBatchProcessPayroll = () => {
    setPayrollRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'Dibayar',
        disbursementDate: 'Hari Ini, 29 Okt 2026',
      }))
    );
  };

  const handleUpdateSiteRadius = (siteId: string, radius: number) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, geofenceRadiusMeters: radius } : s))
    );
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
  };

  return <HRISContext.Provider value={value}>{children}</HRISContext.Provider>;
}

export function useHRIS() {
  const context = useContext(HRISContext);
  if (!context) {
    throw new Error('useHRIS must be used within HRISProvider');
  }
  return context;
}
