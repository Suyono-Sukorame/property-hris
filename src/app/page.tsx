'use client';

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HRISProvider, useHRIS } from '@/context/HRISContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar, Header } from '@/components/layout';
import {
  DashboardView,
  EmployeesView,
  AttendanceView,
  PayrollView,
  ApprovalsView,
  ReportsView,
  SettingsView,
} from '@/components/views';
import {
  EmployeeIDCardModal,
  PaySlipModal,
  ApprovalDetailModal,
  LiveCheckInModal,
  AddEmployeeModal,
} from '@/components/modals';

function HRISApp() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const {
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
  } = useHRIS();

  // Enforce role-based module restrictions
  useEffect(() => {
    if (currentUser?.role === 'EMPLOYEE') {
      if (['dashboard', 'employees', 'reports', 'settings'].includes(activeModule)) {
        setActiveModule('attendance');
      }
    } else if (currentUser?.role === 'SITE_MANAGER') {
      if (['settings', 'payroll'].includes(activeModule)) {
        setActiveModule('dashboard');
      }
      if (currentUser.siteId) {
        setSelectedSiteFilter(currentUser.siteId);
      }
    }
  }, [currentUser, activeModule, setActiveModule, setSelectedSiteFilter]);

  // Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Memuat Sistem HRIS...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Filter records if Employee role
  const filteredEmployees = currentUser.role === 'SITE_MANAGER' && currentUser.siteId
    ? employees.filter((e) => e.siteId === currentUser.siteId)
    : employees;

  const filteredPayroll = currentUser.role === 'EMPLOYEE' && currentUser.employeeId
    ? payrollRecords.filter((p) => p.employeeId === currentUser.employeeId)
    : currentUser.role === 'SITE_MANAGER' && currentUser.siteId
    ? payrollRecords.filter((p) => {
        const emp = employees.find((e) => e.id === p.employeeId);
        return emp?.siteId === currentUser.siteId;
      })
    : payrollRecords;

  return (
    <div className="h-screen bg-[#f8fafc] flex antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
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
              employees={filteredEmployees}
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
              employees={filteredEmployees}
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
              payrollRecords={filteredPayroll}
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
              employees={filteredEmployees}
              selectedSiteFilter={selectedSiteFilter}
              onOpenApproval={setSelectedApprovalItem}
              onQuickApprove={handleQuickApprove}
              onAddNewApproval={handleAddNewApproval}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsView
              sites={sites}
              employees={filteredEmployees}
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

      {/* Global Modals */}
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

export default function Page() {
  return (
    <AuthProvider>
      <HRISProvider>
        <HRISApp />
      </HRISProvider>
    </AuthProvider>
  );
}
