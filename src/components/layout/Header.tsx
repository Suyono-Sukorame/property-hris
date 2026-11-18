'use client';

import React from 'react';
import Image from 'next/image';
import { ActiveNavModule, PropertySite } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, MapPin, Smartphone, Shield, HardHat, UserCheck } from 'lucide-react';
import { UserProfileHub } from '@/components/profile';

interface HeaderProps {
  activeModule: ActiveNavModule;
  selectedSiteFilter: string;
  onSelectSiteFilter: (siteId: string) => void;
  sites: PropertySite[];
  onOpenLiveCheckIn: () => void;
  onOpenAddEmployee?: () => void;
  onToggleMobileNav?: () => void;
  onOpenEmployeeIDCard?: () => void;
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
  onOpenEmployeeIDCard,
}) => {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'SUPER_ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const RoleIcon = isSuperAdmin ? Shield : userRole === 'SITE_MANAGER' ? HardHat : UserCheck;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shrink-0">
      {/* Zone 1: Mobile App Logo & Title */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleMobileNav ? (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden w-8 h-8 rounded-xl overflow-hidden border border-slate-200/90 shadow-xs flex items-center justify-center bg-white shrink-0 active:scale-95 transition-transform cursor-pointer"
            aria-label="Buka Menu Aplikasi"
            title="Menu Property HRIS"
          >
            <Image
              src="/property-hris.png"
              alt="Logo Property HRIS"
              width={32}
              height={32}
              priority
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          <div className="md:hidden w-8 h-8 rounded-xl overflow-hidden border border-slate-200/90 shadow-xs flex items-center justify-center bg-white shrink-0">
            <Image
              src="/property-hris.png"
              alt="Logo Property HRIS"
              width={32}
              height={32}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="hidden sm:inline text-xs font-semibold text-slate-400 whitespace-nowrap">Property HRIS</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-300 shrink-0" />
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
            <span className="sm:hidden">
              {!isSuperAdmin && userRole !== 'SITE_MANAGER'
                ? activeModule === 'attendance'
                  ? 'Riwayat'
                  : activeModule === 'payroll'
                  ? 'Slip Gaji'
                  : activeModule === 'approvals'
                  ? 'Pengajuan'
                  : MODULE_TITLES_SHORT[activeModule]
                : MODULE_TITLES_SHORT[activeModule]}
            </span>
            <span className="hidden sm:inline">
              {!isSuperAdmin && userRole !== 'SITE_MANAGER'
                ? activeModule === 'attendance'
                  ? 'Presensi & Riwayat Saya'
                  : activeModule === 'payroll'
                  ? 'Slip Gaji Saya'
                  : activeModule === 'approvals'
                  ? 'Pengajuan & Permohonan Saya'
                  : MODULE_TITLES[activeModule]
                : MODULE_TITLES[activeModule]}
            </span>
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
        {/* Tombol Presensi GPS di Header hanya untuk Admin/Site Manager di Desktop (disembunyikan di Mobile & untuk Karyawan) */}
        {!isSuperAdmin && userRole !== 'SITE_MANAGER' ? null : (
          <button
            type="button"
            onClick={onOpenLiveCheckIn}
            className="hidden md:inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Presensi GPS</span>
          </button>
        )}

        {/* Unified Executive User Profile Hub (1 Tombol Terpadu Lengkap A-Z) */}
        <div className="pl-1 sm:pl-2 border-l border-slate-200">
          <UserProfileHub
            user={currentUser}
            activeModule={activeModule}
            onLogout={logout}
            onOpenIDCard={onOpenEmployeeIDCard}
          />
        </div>
      </div>
    </header>
  );
};
