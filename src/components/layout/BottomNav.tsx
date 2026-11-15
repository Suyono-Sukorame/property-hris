'use client';

import React, { useState, useEffect } from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { useHRIS } from '@/context/HRISContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Banknote,
  Fingerprint,
  LogOut,
  CheckCircle2,
  Users,
  CheckSquare,
  Building,
  BarChart3,
  Menu,
  Clock,
} from 'lucide-react';

interface BottomNavProps {
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  onOpenLiveCheckIn: () => void;
  onToggleMobileDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onSelectModule,
  onOpenLiveCheckIn,
  onToggleMobileDrawer,
}) => {
  const { currentUser } = useAuth();
  const { attendanceRecords, sites, handleCheckInSuccess, handleCheckOut } = useHRIS();
  const role = currentUser?.role || 'SUPER_ADMIN';

  // Mount-safe check for today's date (prevents Next.js prerender mismatch)
  const [todayStr, setTodayStr] = useState<string>('');
  useEffect(() => {
    setTodayStr(new Date().toISOString().slice(0, 10));
  }, []);

  // Check personal attendance status today
  const myEmpId = currentUser?.employeeId;
  const myTodayRecord =
    todayStr && myEmpId
      ? attendanceRecords.find((r) => r.employeeId === myEmpId && r.date === todayStr)
      : null;

  const hasCheckedIn =
    !!myTodayRecord &&
    myTodayRecord.status !== 'Cuti' &&
    myTodayRecord.status !== 'Izin Lapangan';
  const hasCheckedOut = !!myTodayRecord?.checkOutTime && myTodayRecord.checkOutTime !== '-';

  // 1-Tap Direct Attendance Handler for Employee Bottom Button
  const handleEmployeeCenterClick = () => {
    if (!hasCheckedIn) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hh}:${mm}`;

      const targetSite = sites.find((s) => s.id === (currentUser?.siteId || 'SITE-GRIYA')) || sites[0];
      const isOffice = targetSite?.category === 'Corporate Head Office' || targetSite?.id === 'SITE-HQ' || targetSite?.category === 'Kantor';

      const isLate = isOffice
        ? now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30)
        : now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
      const lateMinutes = isOffice
        ? isLate ? (now.getHours() - 8) * 60 + (now.getMinutes() - 30) : 0
        : isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0;

      const shiftLabel = isOffice
        ? 'Shift Kantor Pusat (08:30 - 17:30)'
        : 'Shift Proyek Pagi (07:00 - 16:00)';

      const newRec: import('@/types/hris').AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId: currentUser?.employeeId || 'EMP-2025-003',
        employeeName: currentUser?.name || 'Rudi Hartono',
        jobCode: (currentUser as any)?.jobCode || 'LAP-001',
        division: (currentUser as any)?.division || 'Operasional Lapangan',
        siteId: targetSite?.id || 'SITE-GRIYA',
        siteName: targetSite?.name || currentUser?.siteName || 'Griya Bumi Raya',
        date: new Date().toISOString().slice(0, 10),
        checkInTime: `${currentTimeStr} WITA`,
        shift: shiftLabel,
        status: isLate ? 'Terlambat' : 'Hadir',
        lateMinutes,
        geofenceDistanceMeters: 0,
        geofenceVerified: true,
        biometricVerified: true,
        ppeCompliance: true,
        workMode: isOffice ? 'WFO' : 'Site Proyek',
        deviceInfo: 'Smartphone GPS Geotagged (1-Tap Nav)',
        notes: isOffice ? 'Presensi operasional kantor pusat' : 'Presensi langsung diverifikasi di area proyek',
      };

      handleCheckInSuccess(newRec);
      onSelectModule('attendance');
      return;
    }

    if (hasCheckedIn && !hasCheckedOut && myTodayRecord) {
      handleCheckOut(myTodayRecord.id);
      onSelectModule('attendance');
      return;
    }

    onOpenLiveCheckIn();
  };

  // Dynamic center button config based on current status
  const getCenterAction = () => {
    if (hasCheckedIn && hasCheckedOut) {
      return {
        label: 'Selesai',
        Icon: CheckCircle2,
        btnColor: 'bg-emerald-800 hover:bg-emerald-900 border-slate-900',
        textColor: 'text-emerald-300',
        title: 'Presensi Hari Ini Selesai',
      };
    }
    if (hasCheckedIn) {
      return {
        label: 'Pulang',
        Icon: LogOut,
        btnColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30 border-slate-900',
        textColor: 'text-amber-400',
        title: 'Absen Pulang Sekarang',
      };
    }
    return {
      label: 'Masuk',
      Icon: Fingerprint,
      btnColor: 'bg-[#0f766e] hover:bg-[#115e59] shadow-[#0f766e]/30 border-slate-900',
      textColor: 'text-emerald-400',
      title: 'Absen Masuk Sekarang',
    };
  };

  const centerAction = getCenterAction();
  const CenterIcon = centerAction.Icon;

  // 1. SUPER_ADMIN Navigation (Direktur / Pemilik)
  // [Beranda] [Karyawan] [🟢 Masuk] [Persetujuan] [Pengaturan]
  if (role === 'SUPER_ADMIN') {
    const isReports = activeModule === 'reports';
    const isPayroll = activeModule === 'payroll';

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
        {/* Tab 1: Beranda */}
        <button
          type="button"
          onClick={() => onSelectModule('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'dashboard'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Beranda</span>
        </button>

        {/* Tab 2: Karyawan */}
        <button
          type="button"
          onClick={() => onSelectModule('employees')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'employees'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Karyawan</span>
        </button>

        {/* Center Tab: Action Button (Masuk/Pulang) */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenLiveCheckIn}
            title={centerAction.title}
            className={`w-12 h-12 rounded-full ${centerAction.btnColor} text-white flex items-center justify-center shadow-lg border-3 active:scale-95 transition-all cursor-pointer`}
          >
            <CenterIcon className="w-5 h-5 text-white" />
          </button>
          <span className={`text-[9px] font-extrabold ${centerAction.textColor} mt-0.5 uppercase tracking-wider`}>
            {centerAction.label}
          </span>
        </div>

        {/* Tab 4: Persetujuan (atau Laporan jika sedang dibuka) */}
        <button
          type="button"
          onClick={() => onSelectModule(isReports ? 'reports' : 'approvals')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'approvals' || isReports
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {isReports ? (
            <BarChart3 className="w-4 h-4 mb-0.5" />
          ) : (
            <CheckSquare className="w-4 h-4 mb-0.5" />
          )}
          <span>{isReports ? 'Laporan' : 'Persetujuan'}</span>
        </button>

        {/* Tab 5: Pengaturan (atau Gaji jika sedang dibuka) */}
        <button
          type="button"
          onClick={() => onSelectModule(isPayroll ? 'payroll' : 'settings')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'settings' || isPayroll
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {isPayroll ? (
            <Banknote className="w-4 h-4 mb-0.5" />
          ) : (
            <Building className="w-4 h-4 mb-0.5" />
          )}
          <span>{isPayroll ? 'Gaji' : 'Pengaturan'}</span>
        </button>
      </nav>
    );
  }

  // 2. SITE_MANAGER Navigation (Admin & Keuangan / Dewi Anggraini)
  // [Beranda] [Presensi Tim] (🟢 Masuk) [Gaji & Kasbon] [Persetujuan]
  if (role === 'SITE_MANAGER') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
        <button
          type="button"
          onClick={() => onSelectModule('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectModule('attendance')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'attendance' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Presensi</span>
        </button>

        {/* Center Tab: Action Button (Masuk/Pulang) */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenLiveCheckIn}
            title={centerAction.title}
            className={`w-12 h-12 rounded-full ${centerAction.btnColor} text-white flex items-center justify-center shadow-lg border-3 active:scale-95 transition-all cursor-pointer`}
          >
            <CenterIcon className="w-5 h-5 text-white" />
          </button>
          <span className={`text-[9px] font-extrabold ${centerAction.textColor} mt-0.5 uppercase tracking-wider`}>
            {centerAction.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelectModule('payroll')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'payroll' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Banknote className="w-4 h-4 mb-0.5" />
          <span>Gaji</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectModule('approvals')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'approvals' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Persetujuan</span>
        </button>
      </nav>
    );
  }

  // 3. EMPLOYEE Navigation (Self-Service: Andi / Rudi)
  // [Riwayat] [Slip Gaji] (🟢 Masuk / Pulang) [Pengajuan] [Menu]
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
      {/* Tab 1: Riwayat (Halaman Riwayat Presensi & Kehadiran) */}
      <button
        type="button"
        onClick={() => onSelectModule('attendance')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          activeModule === 'attendance' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <CalendarCheck className="w-4 h-4 mb-0.5" />
        <span>Riwayat</span>
      </button>

      {/* Tab 2: Slip Gaji */}
      <button
        type="button"
        onClick={() => onSelectModule('payroll')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          activeModule === 'payroll' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Banknote className="w-4 h-4 mb-0.5" />
        <span>Slip Gaji</span>
      </button>

      {/* Center Tab: Action Button Dinamis 1-Tap (Masuk / Pulang / Selesai) */}
      <div className="-mt-5 flex flex-col items-center">
        <button
          type="button"
          onClick={handleEmployeeCenterClick}
          title={centerAction.title}
          className={`w-12 h-12 rounded-full ${centerAction.btnColor} text-white flex items-center justify-center shadow-lg border-3 active:scale-95 transition-all cursor-pointer`}
        >
          <CenterIcon className="w-5 h-5 text-white" />
        </button>
        <span className={`text-[9px] font-extrabold ${centerAction.textColor} mt-0.5 uppercase tracking-wider`}>
          {centerAction.label}
        </span>
      </div>

      {/* Tab 4: Pengajuan */}
      <button
        type="button"
        onClick={() => onSelectModule('approvals')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          activeModule === 'approvals' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <CheckSquare className="w-4 h-4 mb-0.5" />
        <span>Pengajuan</span>
      </button>

      {/* Tab 5: Menu */}
      <button
        type="button"
        onClick={onToggleMobileDrawer}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
