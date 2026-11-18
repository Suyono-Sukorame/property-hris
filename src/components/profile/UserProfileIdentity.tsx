'use client';

import React from 'react';
import { AuthUser } from '@/types/auth';
import { Shield, HardHat, UserCheck } from 'lucide-react';

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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Avatar Bulat / Rounded dengan Status Online */}
      <div className="relative shrink-0">
        <div
          className="w-11 h-11 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-xs border border-white/20"
          style={{ backgroundColor: user.avatarColor || '#0f766e' }}
        >
          {user.initials}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"
          title="Sesi Aktif"
        />
      </div>

      {/* Info Akun Ringkas */}
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
          {user.name}
        </h4>
        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
          {user.email}
        </p>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${roleBadgeStyle}`}>
            <RoleIcon className="w-2.5 h-2.5" />
            <span>{user.roleLabel}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate">
            {user.title}
          </span>
        </div>
      </div>
    </div>
  );
};
