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

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  selectedSiteFilter,
  onSelectSiteFilter,
  sites,
  onOpenLiveCheckIn,
  onOpenAddEmployee,
}) => {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'SUPER_ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const RoleIcon = isSuperAdmin ? Shield : userRole === 'SITE_MANAGER' ? HardHat : UserCheck;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shrink-0">
      {/* Zone 1: Mobile App Logo & Title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Logo Aplikasi di Mobile (Branding Logo — tidak membuka menu) */}
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

        <div className="flex items-center gap-1.5 min-w-0">
          {/* Nama Aplikasi di samping logo (Selalu tampil di mobile & desktop) */}
          <span className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap tracking-tight">
            Property HRIS
          </span>

          {/* Breadcrumb Modul Aktif di Tablet & Desktop */}
          <span className="hidden md:inline-flex items-center gap-1.5 min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-slate-600 truncate tracking-tight">
              {!isSuperAdmin && userRole !== 'SITE_MANAGER'
                ? activeModule === 'attendance'
                  ? 'Presensi & Riwayat Saya'
                  : activeModule === 'payroll'
                  ? 'Slip Gaji Saya'
                  : activeModule === 'approvals'
                  ? 'Pengajuan & Permohonan Saya'
                  : MODULE_TITLES[activeModule]
                : MODULE_TITLES[activeModule]}
            </h1>
          </span>
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
        {/* Tombol Presensi GPS di Header hanya untuk Site Manager di Desktop (disembunyikan di Mobile, Karyawan, & Pemilik/SUPER_ADMIN) */}
        {userRole === 'SITE_MANAGER' && (
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
          />
        </div>
      </div>
    </header>
  );
};
