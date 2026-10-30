'use client';

import React, { useState } from 'react';
import { ActiveNavModule, PropertySite } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, MapPin, Smartphone, UserPlus, Shield, HardHat, UserCheck, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  activeModule: ActiveNavModule;
  selectedSiteFilter: string;
  onSelectSiteFilter: (siteId: string) => void;
  sites: PropertySite[];
  onOpenLiveCheckIn: () => void;
  onOpenAddEmployee: () => void;
  onToggleMobileNav?: () => void;
}

const MODULE_TITLES: Record<ActiveNavModule, string> = {
  dashboard: 'Dashboard & Ringkasan Proyek',
  employees: 'Data Karyawan & Proyek',
  attendance: 'Presensi Lapangan & Lokasi GPS',
  payroll: 'Penggajian & Slip Gaji',
  approvals: 'Persetujuan Tiket & Dokumen',
  reports: 'Laporan & K3 Properti',
  settings: 'Pengaturan Proyek & Lokasi',
};

const MODULE_TITLES_SHORT: Record<ActiveNavModule, string> = {
  dashboard: 'Dashboard',
  employees: 'Karyawan',
  attendance: 'Presensi',
  payroll: 'Gaji',
  approvals: 'Persetujuan',
  reports: 'Laporan K3',
  settings: 'Pengaturan',
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  selectedSiteFilter,
  onSelectSiteFilter,
  sites,
  onOpenLiveCheckIn,
  onOpenAddEmployee,
  onToggleMobileNav,
}) => {
  const { currentUser, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userRole = currentUser?.role || 'SUPER_ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const RoleIcon = isSuperAdmin ? Shield : userRole === 'SITE_MANAGER' ? HardHat : UserCheck;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shrink-0">
      {/* Zone 1: Mobile Hamburger & Title */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="hidden sm:inline text-xs font-semibold text-slate-400 whitespace-nowrap">Property HRIS</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-300 shrink-0" />
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
            <span className="sm:hidden">{MODULE_TITLES_SHORT[activeModule]}</span>
            <span className="hidden sm:inline">{MODULE_TITLES[activeModule]}</span>
          </h1>
        </div>

        {/* Role Pill */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 ml-2">
          <RoleIcon className="w-3 h-3 text-[#0f766e]" />
          <span>{currentUser?.roleLabel || 'Super Admin'}</span>
        </div>
      </div>

      {/* Zone 2: Project Site Filter Selector (Tablet & Desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shrink-0">
        <MapPin className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lokasi:</span>
        {isSuperAdmin ? (
          <select
            value={selectedSiteFilter}
            onChange={(e) => onSelectSiteFilter(e.target.value)}
            aria-label="Filter Berdasarkan Lokasi Properti"
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-50 truncate"
          >
            <option value="ALL">Semua Proyek Aktif</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-bold text-[#0f766e] max-w-50 truncate">
            {currentUser?.siteName || 'Site Terdaftar'}
          </span>
        )}
      </div>

      {/* Zone 3: Primary Action Buttons & Mobile Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenLiveCheckIn}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0f766e]" />
          <span className="hidden xs:inline">Presensi GPS</span>
          <span className="xs:hidden">Presensi</span>
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={onOpenAddEmployee}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        )}

        {/* User Identity & Logout Button (Accessible Everywhere on Mobile & Desktop) */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-slate-200">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
            style={{ backgroundColor: currentUser?.avatarColor || '#0f766e' }}
            title={`${currentUser?.name || 'Pengguna'} (${currentUser?.roleLabel || 'Operator'})`}
          >
            {currentUser?.initials || 'U'}
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Keluar dari Akun"
            className="p-1 sm:p-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            aria-label="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            <span className="hidden xl:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Keluar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Apakah Anda yakin ingin keluar dari akun ini?</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-0.5">
              <span className="font-semibold block text-slate-800">{currentUser?.name}</span>
              <span className="text-[11px] text-slate-500 block truncate">{currentUser?.email} · {currentUser?.roleLabel}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
