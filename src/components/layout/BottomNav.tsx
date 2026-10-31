'use client';

import React from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Clock, Banknote, Menu, Smartphone,
  Users, CheckSquare, BarChart3, Building,
} from 'lucide-react';

interface BottomNavProps {
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  onOpenLiveCheckIn: () => void;
  onToggleMobileDrawer: () => void;
}

// Modules accessible only via the sidebar drawer (not in the 4 main tabs)
const SECONDARY_MODULES: Partial<Record<ActiveNavModule, { label: string; icon: React.FC<{ className?: string }> }>> = {
  employees: { label: 'Karyawan',   icon: Users },
  approvals: { label: 'Persetujuan', icon: CheckSquare },
  reports:   { label: 'Laporan',    icon: BarChart3 },
  settings:  { label: 'Pengaturan', icon: Building },
};

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onSelectModule,
  onOpenLiveCheckIn,
  onToggleMobileDrawer,
}) => {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'EMPLOYEE';

  // Determine if current module is a "secondary" one (shows via drawer)
  const secondaryInfo = SECONDARY_MODULES[activeModule];
  const isOnSecondary = Boolean(secondaryInfo);
  const Tab5Icon  = secondaryInfo?.icon ?? Menu;
  const tab5Label = secondaryInfo?.label ?? 'Menu';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom select-none">
      {/* Tab 1: Dashboard / Home */}
      <button
        type="button"
        onClick={() => onSelectModule(isEmployee ? 'attendance' : 'dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          (isEmployee ? activeModule === 'attendance' : activeModule === 'dashboard')
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span>{isEmployee ? 'Presensi' : 'Beranda'}</span>
      </button>

      {/* Tab 2: Attendance / Presensi */}
      <button
        type="button"
        onClick={() => onSelectModule('attendance')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          activeModule === 'attendance'
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Clock className="w-4 h-4 mb-0.5" />
        <span>Riwayat</span>
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

      {/* Tab 4: Slip Gaji */}
      <button
        type="button"
        onClick={() => onSelectModule('payroll')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          activeModule === 'payroll'
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Banknote className="w-4 h-4 mb-0.5" />
        <span>Slip Gaji</span>
      </button>

      {/* Tab 5: Dynamic — shows active secondary module OR menu drawer */}
      <button
        type="button"
        onClick={onToggleMobileDrawer}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
          isOnSecondary
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Tab5Icon className="w-4 h-4 mb-0.5" />
        <span>{tab5Label}</span>
      </button>
    </nav>
  );
};
