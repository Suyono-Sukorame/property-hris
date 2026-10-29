'use client';

import React from 'react';
import { HRISProvider, useHRIS } from '@/context/HRISContext';
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased">
      {/* Sidebar Navigation */}
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
    <HRISProvider>
      <HRISApp />
    </HRISProvider>
  );
}
