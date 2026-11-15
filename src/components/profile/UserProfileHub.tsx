'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { UserProfileDrawer } from './UserProfileDrawer';
import { ChevronDown } from 'lucide-react';

interface UserProfileHubProps {
  user: AuthUser | null;
  onLogout: () => void;
  onOpenIDCard?: () => void;
  className?: string;
}

export const UserProfileHub: React.FC<UserProfileHubProps> = ({
  user,
  onLogout,
  onOpenIDCard,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Nama panggilan pendek untuk tampilan tablet & desktop
  const firstName = user.name.split(' ')[0] || user.name;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all active:scale-97 cursor-pointer text-left ${className}`}
        aria-label={`Buka Profil Akun ${user.name}`}
        title={`Profil Akun: ${user.name} (${user.roleLabel})`}
      >
        {/* Avatar Inisial Bulat */}
        <div className="relative shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-white shadow-2xs group-hover:scale-105 transition-transform"
            style={{ backgroundColor: user.avatarColor || '#0f766e' }}
          >
            {user.initials || 'U'}
          </div>
          {/* Status Online Indicator Dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>

        {/* User Short Label (Tablet & Desktop only) */}
        <div className="hidden sm:block text-left min-w-0 pr-0.5">
          <span className="block text-xs font-bold text-slate-800 group-hover:text-[#0f766e] transition-colors truncate max-w-28">
            {firstName}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium truncate max-w-28 leading-none">
            {user.roleLabel}
          </span>
        </div>

        {/* Chevron Icon Down */}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
      </button>

      {/* Drawer / Popover Adaptif */}
      <UserProfileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        onLogout={onLogout}
        onOpenIDCard={onOpenIDCard}
      />
    </>
  );
};
