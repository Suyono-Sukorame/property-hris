import React from 'react';
import { ActiveNavModule } from '../types/hris';
import {
  LayoutDashboard,
  Users,
  Clock,
  Banknote,
  CheckSquare,
  BarChart3,
  Building,
  HardHat,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  pendingApprovalsCount,
}) => {
  const navItems: { id: ActiveNavModule; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Ringkasan Eksekutif', icon: LayoutDashboard },
    { id: 'employees', label: 'Data Karyawan & Site', icon: Users },
    { id: 'attendance', label: 'Absensi & Presensi Lapangan', icon: Clock },
    { id: 'payroll', label: 'Penggajian & Slip Gaji', icon: Banknote },
    { id: 'approvals', label: 'Matriks Persetujuan', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'reports', label: 'Laporan & K3 Properti', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan Proyek & Geofence', icon: Building },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0f766e] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-inner border border-emerald-400/20">
          BRP
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-white uppercase truncate">
            Property HRIS
          </h1>
          <p className="text-[11px] text-emerald-400/80 font-medium truncate">
            Bumi Raya Propertindo
          </p>
        </div>
      </div>

      {/* Corporate Site Status Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Sistem Terpusat
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <p className="font-semibold text-white truncate">4 Kawasan Properti Aktif</p>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>660 Total Tenaga Kerja</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-2 flex-1 space-y-1">
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Modul Operasional
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#0f766e] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white text-[#0f766e]' : 'bg-amber-500 text-slate-900'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Compliance Badge */}
      <div className="p-3 mx-3 mb-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold block text-emerald-200">K3 Zero Accident</span>
          <span className="text-[10px] text-emerald-400/80">Audit SMK3 Konstruksi Valid</span>
        </div>
      </div>

      {/* Current Operator Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-400/30">
          HG
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">
            Ir. Hendra Gunawan
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            VP Human Capital & Sites
          </p>
        </div>
      </div>
    </aside>
  );
};
