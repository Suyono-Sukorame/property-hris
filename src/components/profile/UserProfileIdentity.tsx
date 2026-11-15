'use client';

import React from 'react';
import { AuthUser } from '@/types/auth';
import { Shield, HardHat, UserCheck, MapPin, Briefcase, Hash, Building2 } from 'lucide-react';

interface UserProfileIdentityProps {
  user: AuthUser;
  className?: string;
}

export const UserProfileIdentity: React.FC<UserProfileIdentityProps> = ({ user, className = '' }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isSiteManager = user.role === 'SITE_MANAGER';

  const RoleIcon = isSuperAdmin ? Shield : isSiteManager ? HardHat : UserCheck;

  const roleBadgeStyle = isSuperAdmin
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isSiteManager
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-teal-50 text-[#0f766e] border-teal-200';

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Header Identitas: Avatar + Nama + Email */}
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div
            className="w-13 h-13 rounded-2xl text-white font-extrabold text-base flex items-center justify-center shadow-sm border-2 border-white ring-2 ring-slate-200"
            style={{ backgroundColor: user.avatarColor || '#0f766e' }}
          >
            {user.initials}
          </div>
          {/* Status Indikator Aktif (Online) */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"
            title="Sesi Aktif"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
              {user.name}
            </h4>
          </div>
          <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
            {user.email}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeStyle}`}>
              <RoleIcon className="w-3 h-3" />
              <span>{user.roleLabel}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {user.title}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Rincian Kerja A-Z (Responsif 1 Kolom di Dropdown Mobile, 2 Kolom di Layar Lebar) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#0f766e]" />
            Lokasi Tugas
          </span>
          <p className="font-semibold text-slate-800 text-[11px] truncate" title={user.siteName || 'Kantor Pusat & Semua Proyek'}>
            {user.siteName || 'Kantor Pusat & Proyek'}
          </p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-[#0f766e]" />
            Divisi Kerja
          </span>
          <p className="font-semibold text-slate-800 text-[11px] truncate">
            {user.division || 'Manajemen'}
          </p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Hash className="w-3 h-3 text-[#0f766e]" />
            ID Pegawai / Akun
          </span>
          <p className="font-mono font-semibold text-slate-800 text-[11px] truncate">
            {user.employeeId || user.id}
          </p>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#0f766e]" />
            Status Kerja
          </span>
          <p className="font-semibold text-emerald-700 text-[11px] truncate">
            Karyawan Tetap
          </p>
        </div>
      </div>
    </div>
  );
};
