'use client';

import Image from 'next/image';
import React from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Clock, Banknote, CheckSquare,
  BarChart3, Building, HardHat, ShieldCheck, LogOut, X,
} from 'lucide-react';

interface SidebarProps {
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  pendingApprovalsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const allNavItems: {
  id: ActiveNavModule;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: boolean;
  roles: ('SUPER_ADMIN' | 'SITE_MANAGER' | 'EMPLOYEE')[];
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'SITE_MANAGER'] },
  { id: 'employees', label: 'Data Karyawan', icon: Users, roles: ['SUPER_ADMIN', 'SITE_MANAGER'] },
  { id: 'attendance', label: 'Presensi Lapangan', icon: Clock, roles: ['SUPER_ADMIN', 'SITE_MANAGER', 'EMPLOYEE'] },
  { id: 'payroll', label: 'Penggajian', icon: Banknote, roles: ['SUPER_ADMIN', 'EMPLOYEE'] },
  { id: 'approvals', label: 'Persetujuan', icon: CheckSquare, badge: true, roles: ['SUPER_ADMIN', 'SITE_MANAGER', 'EMPLOYEE'] },
  { id: 'reports', label: 'Laporan & K3', icon: BarChart3, roles: ['SUPER_ADMIN', 'SITE_MANAGER'] },
  { id: 'settings', label: 'Pengaturan Proyek', icon: Building, roles: ['SUPER_ADMIN'] },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  pendingApprovalsCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'SUPER_ADMIN';

  // Filter menu items based on active role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleItemClick = (id: ActiveNavModule) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside className="w-64 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shrink-0 h-dvh max-h-dvh md:h-screen border-r border-slate-800 select-none overflow-hidden">
      {/* =========================================================================
          ZONA 1: KOP ATAS (PERMANENTLY FIXED & TIDAK IKUT TERGESER)
          ========================================================================= */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800/80">
        {/* Brand Header */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-700/80 shadow-md">
              <Image
                src="/property-hris.png"
                alt="Logo PT Bumi Raya Propertindo"
                width={40}
                height={40}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                Property HRIS
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold truncate">
                Bumi Raya Propertindo
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Corporate Site Status Card */}
        <div className="px-3 pb-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                {userRole === 'SUPER_ADMIN' ? 'Kantor Pusat' : 'Kawasan Proyek'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="font-semibold text-white truncate text-[11px]">
              {currentUser?.siteName || '4 Kawasan Properti Aktif'}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
              <HardHat className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Wilayah Kalimantan Selatan</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONA 2: DAFTAR MENU MODUL (SCROLLABLE MANDIRI JIKA LAYAR PENDEK)
          ========================================================================= */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1">
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu Navigasi
        </p>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const badgeCount = item.badge ? pendingApprovalsCount : 0;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0f766e] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {badgeCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-white text-[#0f766e]' : 'bg-amber-500 text-slate-900'
                }`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          ZONA 3: FOOTER PROFIL & K3 (PERMANENTLY STICKY BOTTOM)
          ========================================================================= */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800/80 pb-6 md:pb-2">
        {/* Current User Profile & Logout Button (Utama: Tampil Langsung & Tidak Tertutup Navigation Bar) */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs"
              style={{ backgroundColor: currentUser?.avatarColor || '#0f766e' }}
            >
              {currentUser?.initials || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Pengguna'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium truncate">
                {currentUser?.roleLabel || 'Operator'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Keluar dari Akun"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-200 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 hover:text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Safety Compliance Mini Badge */}
        <div className="p-2 mx-3 mt-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-[10px] text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="font-semibold block text-emerald-200 truncate">K3 Zero Accident</span>
            <span className="text-[9px] text-emerald-400/80 truncate">Audit SMK3 Konstruksi Valid</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible on md and up) */}
      <div className="hidden md:flex shrink-0 sticky top-0 h-screen z-40">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Only Visible on mobile when toggled) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex h-dvh max-h-dvh overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />
          {/* Drawer Body */}
          <div className="relative z-10 flex h-full max-h-dvh animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
