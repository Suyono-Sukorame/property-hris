import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.trim().toLowerCase();

  let styleClasses = '';
  let dotColor = '';

  if (norm === 'aktif' || norm === 'hadir' || norm === 'disetujui' || norm === 'dibayar' || norm === 'tepat waktu') {
    styleClasses = 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]';
    dotColor = 'bg-[#0f766e]';
  } else if (norm === 'terlambat' || norm === 'draft' || norm === 'menunggu approval hr' || norm === 'menunggu pengawas lapangan' || norm === 'pending' || norm === 'penting') {
    styleClasses = 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]';
    dotColor = 'bg-[#d97706]';
  } else if (norm === 'cuti' || norm === 'nonaktif' || norm === 'izin lapangan' || norm === 'biasa') {
    styleClasses = 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]';
    dotColor = 'bg-[#64748b]';
  } else if (norm === 'ditolak' || norm === 'krisis' || norm === 'alpa' || norm === 'luar geofence') {
    styleClasses = 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
    dotColor = 'bg-[#dc2626]';
  } else {
    styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    dotColor = 'bg-slate-500';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] font-semibold tracking-[0.03em]'
      : 'px-2.5 py-1 text-xs font-semibold tracking-[0.03em]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase shrink-0 transition-colors ${sizeClasses} ${styleClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} aria-hidden="true" />
      <span className="whitespace-nowrap">{status}</span>
    </span>
  );
};
