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
  Camera,
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
  const { attendanceRecords, sites, handleCheckInSuccess, handleCheckOut, pendingApprovalsCount } = useHRIS();
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

  // Attendance Action Handler for Employee Bottom Button (Selalu Buka Modal Kamera & GPS)
  const handleEmployeeCenterClick = () => {
    // Jika belum absen, WAJIB buka modal LiveCheckIn (Kamera Selfie & Geofence GPS)
    if (!hasCheckedIn) {
      onOpenLiveCheckIn();
      return;
    }

    // Jika sedang bekerja (sudah masuk, belum pulang), buka modal untuk selfie + GPS checkout
    if (hasCheckedIn && !hasCheckedOut) {
      onOpenLiveCheckIn();
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
      label: 'Absen',
      Icon: Camera,
      btnColor: 'bg-[#0f766e] hover:bg-[#115e59] shadow-[#0f766e]/30 border-slate-900',
      textColor: 'text-emerald-400',
      title: 'Buka Kamera Selfie & GPS untuk Absen Masuk',
    };
  };

  const centerAction = getCenterAction();
  const CenterIcon = centerAction.Icon;

  // 1. SUPER_ADMIN Navigation (Direktur / Pemilik)
  // [ 📊 Beranda ] [ 👥 Data Tim ] [ 💵 Gaji & Kasbon ] [ ✍️ Persetujuan ]
  if (role === 'SUPER_ADMIN') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-2 px-3 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
        {/* Tab 1: Beranda */}
        <button
          type="button"
          onClick={() => onSelectModule('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'dashboard'
              ? 'text-emerald-400 font-bold bg-white/5'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5 mb-1" />
          <span>Beranda</span>
        </button>

        {/* Tab 2: Data Tim */}
        <button
          type="button"
          onClick={() => onSelectModule('employees')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'employees'
              ? 'text-emerald-400 font-bold bg-white/5'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4.5 h-4.5 mb-1" />
          <span>Data Tim</span>
        </button>

        {/* Tab 3: Gaji & Kasbon */}
        <button
          type="button"
          onClick={() => onSelectModule('payroll')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'payroll'
              ? 'text-emerald-400 font-bold bg-white/5'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Banknote className="w-4.5 h-4.5 mb-1" />
          <span>Gaji & Kasbon</span>
        </button>

        {/* Tab 4: Persetujuan */}
        <button
          type="button"
          onClick={() => onSelectModule('approvals')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer relative ${
            activeModule === 'approvals'
              ? 'text-emerald-400 font-bold bg-white/5'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-4.5 h-4.5 mb-1" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-slate-900">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <span>Persetujuan</span>
        </button>
      </nav>
    );
  }

  // 2. SITE_MANAGER Navigation (Admin & Keuangan / Dewi Anggraini)
  // [ 📊 Beranda ] [ 🕒 Presensi Tim ] [ 💵 Gaji & Kasbon ] [ 📋 Verifikasi ]
  if (role === 'SITE_MANAGER') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-2 px-3 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
        <button
          type="button"
          onClick={() => onSelectModule('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'dashboard' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5 mb-1" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectModule('attendance')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'attendance' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4.5 h-4.5 mb-1" />
          <span>Presensi Tim</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectModule('payroll')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'payroll' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Banknote className="w-4.5 h-4.5 mb-1" />
          <span>Gaji & Kasbon</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectModule('approvals')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer relative ${
            activeModule === 'approvals' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-4.5 h-4.5 mb-1" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-slate-900">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <span>Verifikasi</span>
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
