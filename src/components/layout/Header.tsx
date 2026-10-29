'use client';
import React from 'react';
import { ActiveNavModule, PropertySite } from '@/types/hris';
import { ChevronRight, MapPin, Smartphone, UserPlus } from 'lucide-react';

interface HeaderProps {
  activeModule: ActiveNavModule;
  selectedSiteFilter: string;
  onSelectSiteFilter: (siteId: string) => void;
  sites: PropertySite[];
  onOpenLiveCheckIn: () => void;
  onOpenAddEmployee: () => void;
}

const MODULE_TITLES: Record<ActiveNavModule, string> = {
  dashboard: 'Ringkasan Eksekutif & Operasional Properti',
  employees: 'Data Karyawan & Personil Proyek',
  attendance: 'Absensi & Presensi Lapangan',
  payroll: 'Ledger Penggajian & Slip Gaji',
  approvals: 'Matriks Persetujuan Berjenjang',
  reports: 'Laporan & K3 Compliance Properti',
  settings: 'Pengaturan Proyek & Geofence',
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  selectedSiteFilter,
  onSelectSiteFilter,
  sites,
  onOpenLiveCheckIn,
  onOpenAddEmployee,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Breadcrumb Trail */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Property HRIS</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <h1 className="text-sm font-bold text-slate-900 truncate tracking-tight">
          {MODULE_TITLES[activeModule]}
        </h1>
      </div>

      {/* Zone 2: Project Site Filter Selector */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
        <MapPin className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lokasi:</span>
        <select
          value={selectedSiteFilter}
          onChange={(e) => onSelectSiteFilter(e.target.value)}
          aria-label="Filter Berdasarkan Lokasi Properti"
          className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
        >
          <option value="ALL">Semua Kawasan Properti (4 Site)</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Zone 3: Primary Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenLiveCheckIn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0f766e]" />
          <span>Simulasi Presensi GPS</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddEmployee}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah Karyawan</span>
        </button>
      </div>
    </header>
  );
};
