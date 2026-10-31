'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HRISProvider, useHRIS } from '@/context/HRISContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar, Header, BottomNav } from '@/components/layout';
import {
  DashboardView,
  EmployeesView,
  EmployeeProfileView,
  AttendanceView,
  PayrollView,
  ApprovalsView,
  ReportsView,
  SettingsView,
} from '@/components/views';
import {
  PaySlipModal,
  ApprovalDetailModal,
  LiveCheckInModal,
  AddEmployeeModal,
  EditEmployeeModal,
  EditAttendanceModal,
} from '@/components/modals';

function HRISApp() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [editingAttendanceRecord, setEditingAttendanceRecord] = useState<import('@/types/hris').AttendanceRecord | null>(null);

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
    selectedEmployeeForEdit,
    setSelectedEmployeeForEdit,
    isEditEmployeeOpen,
    setIsEditEmployeeOpen,
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

  // Sync direct employee profile links (?id=EMP-...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const empId = params.get('id');
      if (empId) {
        const found = employees.find((e) => e.id === empId);
        if (found) {
          setSelectedEmployeeForCard(found);
        }
      }
    }
  }, [employees, setSelectedEmployeeForCard]);

  // Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">
          Memuat Sistem HRIS...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Role helpers
  const isEmployee = currentUser.role === 'EMPLOYEE';

  // Filter records based on role
  const filteredEmployees = currentUser.role === 'SITE_MANAGER' && currentUser.siteId
    ? employees.filter((e) => e.siteId === currentUser.siteId)
    : employees;

  const filteredAttendance = isEmployee && currentUser.employeeId
    ? attendanceRecords.filter((r) => r.employeeId === currentUser.employeeId)
    : attendanceRecords;

  const filteredApprovals = isEmployee && currentUser.employeeId
    ? approvals.filter((a) => a.employeeId === currentUser.employeeId)
    : approvals;

  const filteredPayroll = isEmployee && currentUser.employeeId
    ? payrollRecords.filter((p) => p.employeeId === currentUser.employeeId)
    : currentUser.role === 'SITE_MANAGER' && currentUser.siteId
    ? payrollRecords.filter((p) => {
        const emp = employees.find((e) => e.id === p.employeeId);
        return emp?.siteId === currentUser.siteId;
      })
    : payrollRecords;

  return (
    <div className="h-dvh max-h-dvh md:h-screen bg-[#f8fafc] flex antialiased overflow-hidden">
      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        pendingApprovalsCount={pendingApprovalsCount}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh max-h-dvh md:h-screen overflow-hidden">
        <Header
          activeModule={activeModule}
          selectedSiteFilter={selectedSiteFilter}
          onSelectSiteFilter={setSelectedSiteFilter}
          sites={sites}
          onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
          onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Scrollable Main Area with extra bottom padding for Mobile BottomNav */}
        <main className="p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 flex-1 overflow-y-auto">
          {activeModule === 'dashboard' && (
            <DashboardView
              sites={sites}
              employees={filteredEmployees}
              attendanceRecords={attendanceRecords}
              approvals={approvals}
              selectedSiteFilter={selectedSiteFilter}
              onNavigateModule={setActiveModule}
              onOpenEmployeeCard={(emp) => {
                setActiveModule('employees');
                setSelectedEmployeeForCard(emp);
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', `/employees?id=${emp.id}`);
                }
              }}
              onOpenApproval={setSelectedApprovalItem}
              onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
            />
          )}

          {activeModule === 'employees' && (
            selectedEmployeeForCard ? (
              <EmployeeProfileView
                employee={selectedEmployeeForCard}
                onBack={() => {
                  setSelectedEmployeeForCard(null);
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', '/employees');
                  }
                }}
                onOpenEditEmployee={openEditEmployee}
                onViewPaySlip={handleOpenPaySlipByEmployee}
                isSuperAdmin={!isEmployee}
              />
            ) : (
              <EmployeesView
                employees={filteredEmployees}
                sites={sites}
                selectedSiteFilter={selectedSiteFilter}
                onOpenEmployeeCard={(emp) => {
                  setSelectedEmployeeForCard(emp);
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', `/employees?id=${emp.id}`);
                  }
                }}
                onOpenPaySlip={handleOpenPaySlipByEmployee}
                onOpenAddModal={() => setIsAddEmployeeOpen(true)}
                onOpenEditEmployee={openEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )
          )}

          {activeModule === 'attendance' && (
            <AttendanceView
              attendanceRecords={filteredAttendance}
              sites={sites}
              selectedSiteFilter={selectedSiteFilter}
              onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
              onCheckOut={handleCheckOut}
              onEditAttendance={(record) => setEditingAttendanceRecord(record)}
              isEmployeeView={isEmployee}
              canEditAttendance={!isEmployee}
            />
          )}

          {activeModule === 'payroll' && (
            <PayrollView
              payrollRecords={filteredPayroll}
              sites={sites}
              selectedSiteFilter={selectedSiteFilter}
              onOpenPaySlip={setSelectedPayrollForSlip}
              onBatchProcessPayroll={handleBatchProcessPayroll}
              isEmployeeView={isEmployee}
            />
          )}

          {activeModule === 'approvals' && (
            <ApprovalsView
              approvals={filteredApprovals}
              sites={sites}
              employees={filteredEmployees}
              selectedSiteFilter={selectedSiteFilter}
              onOpenApproval={setSelectedApprovalItem}
              onQuickApprove={handleQuickApprove}
              onAddNewApproval={handleAddNewApproval}
              canApprove={!isEmployee}
              currentEmployeeId={isEmployee ? currentUser.employeeId : undefined}
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

      {/* Mobile Bottom Navigation Bar (Phone Only) */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenLiveCheckIn={() => setIsLiveCheckInOpen(true)}
        onToggleMobileDrawer={() => setIsMobileNavOpen((prev) => !prev)}
      />

      {/* Global Modals */}
      <PaySlipModal
        record={selectedPayrollForSlip}
        onClose={() => setSelectedPayrollForSlip(null)}
      />

      <ApprovalDetailModal
        item={selectedApprovalItem}
        onClose={() => setSelectedApprovalItem(null)}
        onUpdateStatus={handleUpdateApprovalStatus}
        canApprove={!isEmployee}
      />

      <LiveCheckInModal
        isOpen={isLiveCheckInOpen}
        onClose={() => setIsLiveCheckInOpen(false)}
        employees={employees}
        sites={sites}
        attendanceRecords={attendanceRecords}
        onCheckInSuccess={handleCheckInSuccess}
        onCheckOut={handleCheckOut}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        sites={sites}
        onAddEmployee={handleAddEmployee}
      />

      <EditEmployeeModal
        isOpen={isEditEmployeeOpen}
        employee={selectedEmployeeForEdit}
        onClose={() => {
          setIsEditEmployeeOpen(false);
          setSelectedEmployeeForEdit(null);
        }}
        sites={sites}
        onUpdateEmployee={handleUpdateEmployee}
      />

      <EditAttendanceModal
        record={editingAttendanceRecord}
        onClose={() => setEditingAttendanceRecord(null)}
        onSave={(recordId, updates) => {
          handleEditAttendance(recordId, updates);
          setEditingAttendanceRecord(null);
        }}
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
