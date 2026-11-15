'use client';

import Image from 'next/image';
import React from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Clock, Banknote, CheckSquare,
  BarChart3, Building, LogOut, X,
} from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa';
import { DeveloperBranding } from '@/components/ui';

interface SidebarProps {
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  pendingApprovalsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

// Opsi 1: Tiga Dunia Spesifik — Navigasi disesuaikan 100% untuk peran masing-masing
const getNavItemsForRole = (role: 'SUPER_ADMIN' | 'SITE_MANAGER' | 'EMPLOYEE') => {
  if (role === 'EMPLOYEE') {
    return [
      { id: 'attendance' as ActiveNavModule, label: 'Presensi & Riwayat', icon: Clock, badge: false },
      { id: 'payroll' as ActiveNavModule, label: 'Slip Gaji Saya', icon: Banknote, badge: false },
      { id: 'approvals' as ActiveNavModule, label: 'Pengajuan Saya', icon: CheckSquare, badge: true },
    ];
  }

  if (role === 'SITE_MANAGER') {
    // Dewi Anggraini: Admin & Keuangan
    return [
      { id: 'dashboard' as ActiveNavModule, label: 'Beranda Operasional', icon: LayoutDashboard, badge: false },
      { id: 'employees' as ActiveNavModule, label: 'Data Tim (4 Orang)', icon: Users, badge: false },
      { id: 'attendance' as ActiveNavModule, label: 'Monitoring Presensi', icon: Clock, badge: false },
      { id: 'payroll' as ActiveNavModule, label: 'Gaji & Kasbon Tim', icon: Banknote, badge: false },
      { id: 'approvals' as ActiveNavModule, label: 'Verifikasi Pengajuan', icon: CheckSquare, badge: true },
    ];
  }

  // SUPER_ADMIN: Navyzar (Pemilik / Direktur)
  return [
    { id: 'dashboard' as ActiveNavModule, label: 'Ringkasan Eksekutif', icon: LayoutDashboard, badge: false },
    { id: 'employees' as ActiveNavModule, label: 'Data Tim', icon: Users, badge: false },
    { id: 'attendance' as ActiveNavModule, label: 'Monitoring Presensi', icon: Clock, badge: false },
    { id: 'payroll' as ActiveNavModule, label: 'Rekap Penggajian', icon: Banknote, badge: false },
    { id: 'approvals' as ActiveNavModule, label: 'Persetujuan Direktur', icon: CheckSquare, badge: true },
    { id: 'reports' as ActiveNavModule, label: 'Laporan Bisnis', icon: BarChart3, badge: false },
    { id: 'settings' as ActiveNavModule, label: 'Pengaturan', icon: Building, badge: false },
  ];
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  pendingApprovalsCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'SUPER_ADMIN';

  // Menu items berbasis peran nyata (Role-Dedicated)
  const visibleNavItems = getNavItemsForRole(userRole);

  const handleItemClick = (id: ActiveNavModule) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside className="w-64 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full max-h-dvh md:h-screen border-r border-slate-800 select-none overflow-hidden">
      {/* =========================================================================
          ZONA 1: KOP ATAS (PERMANENTLY FIXED & TIDAK IKUT TERGESER)
          ========================================================================= */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800/80">
        {/* Brand Header */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-slate-700/80 shadow-md">
              <Image
                src="/property-hris.png"
                alt="Logo PT Bumi Raya Propertindo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                Property HRIS
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold truncate">
                Griya Bumi Raya
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

        {/* User Identity & Logout Button */}
        <div className="px-3 pb-2">
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs"
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
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-rose-200 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 hover:text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Corporate Site Status Card (Compact 1-Baris agar Muat di Layar HP Compact) */}
        <div className="px-3 pb-2">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-[11px] gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate text-[11px]">
                {currentUser?.siteName || 'Griya Bumi Raya'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">4 Tim</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONA 2: DAFTAR MENU MODUL (SCROLLABLE MANDIRI JIKA LAYAR PENDEK)
          ========================================================================= */}
      <div className="px-3 py-1 flex-1 min-h-0 overflow-y-auto space-y-0.5 sm:space-y-1">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
              className={`w-full flex items-center justify-between px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0f766e] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
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
          ZONA 3: FOOTER SIMPEL & TOMBOL PASANG PWA (COMPACT & MERAPAT KE ATAS)
          ========================================================================= */}
      <div className="shrink-0 bg-slate-950/80 border-t border-slate-800/90 p-2.5 pb-4 md:pb-2.5 space-y-1.5">
        <PWAInstallButton
          variant="pill"
          size="xs"
          customLabel="Pasang di Layar HP"
          className="w-full text-slate-300 hover:text-white"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
          <span>Property HRIS · v1.0</span>
          <DeveloperBranding variant="dark" size="xs" />
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
