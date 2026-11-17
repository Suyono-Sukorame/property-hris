'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthUser } from '@/types/auth';
import { getAccountPresentation } from '@/lib/accountPresentation';

interface AccountOptionButtonProps {
  user: AuthUser;
  onSelect: (user: AuthUser) => void;
}

export const AccountOptionButton: React.FC<AccountOptionButtonProps> = ({ user, onSelect }) => {
  const { Icon, roleBadge, roleBadgeClass, dutyDescription } = getAccountPresentation(user);

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="w-full p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center gap-3 group cursor-pointer"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
        style={{ backgroundColor: user.avatarColor }}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
            {user.name}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleBadgeClass}`}>
            {roleBadge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
          {dutyDescription}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
    </button>
  );
};
