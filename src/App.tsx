/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActiveNavModule,
  PropertySite,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  ApprovalItem,
} from './types/hris';
import {
  INITIAL_PROPERTY_SITES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_APPROVALS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EmployeeIDCardModal } from './components/EmployeeIDCardModal';
import { PaySlipModal } from './components/PaySlipModal';
import { ApprovalDetailModal } from './components/ApprovalDetailModal';
import { LiveCheckInModal } from './components/LiveCheckInModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';

import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { AttendanceView } from './views/AttendanceView';
import { PayrollView } from './views/PayrollView';
import { ApprovalsView } from './views/ApprovalsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
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

  // Open Pay Slip by Employee
  const handleOpenPaySlipByEmployee = (emp: Employee) => {
    let rec = payrollRecords.find((p) => p.employeeId === emp.id);
    if (!rec) {
      // Create provisional record if none found
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
    // Also create matching payroll record
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

  // Update Approval Status Callback
  const handleUpdateApprovalStatus = (
    itemId: string,
    newStatus: 'Disetujui' | 'Ditolak',
    reviewNote: string
  ) => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedSteps = [...item.steps];
          // complete remaining pending steps
          updatedSteps.forEach((s) => {
            if (s.status === 'pending') {
              s.status = newStatus === 'Disetujui' ? 'completed' : 'rejected';
              s.timestamp = 'Hari Ini, Diverifikasi';
              s.note = reviewNote;
            }
          });

          return {
            ...item,
            status: newStatus,
            steps: updatedSteps,
          };
        }
        return item;
      })
    );
  };

  // Quick Approve
  const handleQuickApprove = (id: string) => {
    handleUpdateApprovalStatus(id, 'Disetujui', 'Disetujui cepat via Matriks Persetujuan.');
  };

  // Add new approval
  const handleAddNewApproval = (newItem: ApprovalItem) => {
    setApprovals((prev) => [newItem, ...prev]);
  };

  // Batch Payroll Process
  const handleBatchProcessPayroll = () => {
    setPayrollRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'Dibayar',
        disbursementDate: 'Hari Ini, 29 Okt 2026',
      }))
    );
  };

  // Update Site Geofence Radius
  const handleUpdateSiteRadius = (siteId: string, radius: number) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, geofenceRadiusMeters: radius } : s))
    );
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status.includes('Menunggu')).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased">
      {/* 260px Persistent Navigation Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeModule={activeModule}
          selectedSiteFilter={selectedSiteFilter}
          onSelectSiteFilter={setSelectedSiteFilter}
          sites={sites}
          onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
          onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
        />

        <main className="p-6 lg:p-8 flex-1 overflow-y-auto">
          {activeModule === 'dashboard' && (
            <DashboardView
              sites={sites}
              employees={employees}
              attendanceRecords={attendanceRecords}
              approvals={approvals}
              selectedSiteFilter={selectedSiteFilter}
              onNavigateModule={setActiveModule}
              onOpenEmployeeCard={setSelectedEmployeeForCard}
              onOpenApproval={setSelectedApprovalItem}
            />
          )}

          {activeModule === 'employees' && (
            <EmployeesView
              employees={employees}
              sites={sites}
              selectedSiteFilter={selectedSiteFilter}
              onOpenEmployeeCard={setSelectedEmployeeForCard}
              onOpenPaySlip={handleOpenPaySlipByEmployee}
              onOpenAddModal={() => setIsAddEmployeeOpen(true)}
            />
          )}

          {activeModule === 'attendance' && (
            <AttendanceView
              attendanceRecords={attendanceRecords}
              sites={sites}
              selectedSiteFilter={selectedSiteFilter}
              onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
            />
          )}

          {activeModule === 'payroll' && (
            <PayrollView
              payrollRecords={payrollRecords}
              sites={sites}
              selectedSiteFilter={selectedSiteFilter}
              onOpenPaySlip={setSelectedPayrollForSlip}
              onBatchProcessPayroll={handleBatchProcessPayroll}
            />
          )}

          {activeModule === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              sites={sites}
              employees={employees}
              selectedSiteFilter={selectedSiteFilter}
              onOpenApproval={setSelectedApprovalItem}
              onQuickApprove={handleQuickApprove}
              onAddNewApproval={handleAddNewApproval}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsView
              sites={sites}
              employees={employees}
              attendanceRecords={attendanceRecords}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsView
              sites={sites}
              onUpdateSiteRadius={handleUpdateSiteRadius}
            />
          )}
        </main>
      </div>

      {/* Domain-Specific Modals */}
      <EmployeeIDCardModal
        employee={selectedEmployeeForCard}
        onClose={() => setSelectedEmployeeForCard(null)}
        onViewPaySlip={handleOpenPaySlipByEmployee}
      />

      <PaySlipModal
        record={selectedPayrollForSlip}
        onClose={() => setSelectedPayrollForSlip(null)}
      />

      <ApprovalDetailModal
        item={selectedApprovalItem}
        onClose={() => setSelectedApprovalItem(null)}
        onUpdateStatus={handleUpdateApprovalStatus}
      />

      <LiveCheckInModal
        isOpen={isLiveCheckInOpen}
        onClose={() => setIsLiveCheckInOpen(false)}
        employees={employees}
        sites={sites}
        onCheckInSuccess={handleCheckInSuccess}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        sites={sites}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
}
