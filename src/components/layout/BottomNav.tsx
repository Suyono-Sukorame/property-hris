'use client';

import React from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  Banknote,
  Smartphone,
  Users,
  CheckSquare,
  Building,
  BarChart3,
  Menu,
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
  const role = currentUser?.role || 'SUPER_ADMIN';

  // 1. SUPER_ADMIN Navigation (Direktur / Pemilik)
  // [Beranda] [Karyawan] [🟢 Presensi GPS] [Persetujuan] [Pengaturan]
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

        {/* Center Tab: Action Button (PRESENSI GPS LAPANGAN) */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenLiveCheckIn}
            title="Buka Presensi GPS"
            className="w-12 h-12 rounded-full bg-[#0f766e] hover:bg-[#115e59] text-white flex items-center justify-center shadow-lg shadow-[#0f766e]/30 border-3 border-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-emerald-100" />
          </button>
          <span className="text-[9px] font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wider">
            Presensi GPS
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
          onClick={() => onSelectModule('employees')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeModule === 'employees' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Karyawan</span>
        </button>

        <div className="-mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenLiveCheckIn}
            title="Buka Presensi GPS"
            className="w-12 h-12 rounded-full bg-[#0f766e] hover:bg-[#115e59] text-white flex items-center justify-center shadow-lg shadow-[#0f766e]/30 border-3 border-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-emerald-100" />
          </button>
          <span className="text-[9px] font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wider">
            Presensi GPS
          </span>
        </div>

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
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
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

      <div className="-mt-5 flex flex-col items-center">
        <button
          type="button"
          onClick={onOpenLiveCheckIn}
          title="Buka Presensi GPS"
          className="w-12 h-12 rounded-full bg-[#0f766e] hover:bg-[#115e59] text-white flex items-center justify-center shadow-lg shadow-[#0f766e]/30 border-3 border-slate-900 active:scale-95 transition-all cursor-pointer"
        >
          <Smartphone className="w-5 h-5 text-emerald-100" />
        </button>
        <span className="text-[9px] font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wider">
          Presensi GPS
        </span>
      </div>

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
