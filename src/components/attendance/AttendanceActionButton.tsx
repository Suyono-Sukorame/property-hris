'use client';

import React from 'react';
import { Camera, Fingerprint, LogOut, CheckCircle2, Clock } from 'lucide-react';

export interface AttendanceActionButtonProps {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isLeaveToday?: boolean;
  onOpenCheckInModal: (tab?: 'ATTENDANCE' | 'LEAVE') => void;
  onCheckOut?: () => void;
  variant?: 'hero' | 'compact' | 'nav-center';
  className?: string;
  disabled?: boolean;
}

export const AttendanceActionButton: React.FC<AttendanceActionButtonProps> = ({
  hasCheckedIn,
  hasCheckedOut,
  isLeaveToday = false,
  onOpenCheckInModal,
  onCheckOut,
  variant = 'hero',
  className = '',
  disabled = false,
}) => {
  // 1. KASUS SUDAH LENGKAP ATAU CUTI
  if (isLeaveToday) {
    if (variant === 'nav-center') {
      return (
        <button
          type="button"
          onClick={() => onOpenCheckInModal('LEAVE')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-amber-600 cursor-pointer ${className}`}
          title="Laporan Izin/Cuti Hari Ini"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Izin/Cuti</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled
        className={`py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 cursor-default ${className}`}
      >
        <Clock className="w-4 h-4 text-amber-500" />
        <span>Tercatat Izin / Cuti Resmi</span>
      </button>
    );
  }

  if (hasCheckedIn && hasCheckedOut) {
    if (variant === 'nav-center') {
      return (
        <button
          type="button"
          onClick={() => onOpenCheckInModal('ATTENDANCE')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-emerald-600 cursor-pointer ${className}`}
          title="Presensi Hari Ini Lengkap"
        >
          <CheckCircle2 className="w-5 h-5 text-[#0f766e]" />
          <span className="text-[10px] font-bold mt-0.5">Lengkap</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onOpenCheckInModal('ATTENDANCE')}
        className={`py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-100 transition-all ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />
        <span>Presensi Hari Ini Lengkap (Lihat Struk)</span>
      </button>
    );
  }

  // 2. KASUS SEDANG BEKERJA (SUDAH MASUK, BELUM PULANG)
  if (hasCheckedIn && !hasCheckedOut) {
    const handleAction = () => {
      if (onCheckOut) {
        onCheckOut();
      } else {
        onOpenCheckInModal('ATTENDANCE');
      }
    };

    if (variant === 'nav-center') {
      return (
        <button
          type="button"
          onClick={handleAction}
          disabled={disabled}
          className={`flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full bg-linear-to-b from-[#0f766e] to-teal-800 text-white shadow-lg shadow-teal-900/30 border-4 border-slate-900 active:scale-95 transition-all cursor-pointer ${className}`}
          title="Absen Pulang Sekarang"
        >
          <LogOut className="w-5 h-5 text-white" />
          <span className="text-[9px] font-bold tracking-tight">Pulang</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleAction}
        disabled={disabled}
        className={`py-3.5 px-4 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 ${className}`}
      >
        <LogOut className="w-4.5 h-4.5" />
        <span>Presensi Pulang Sekarang</span>
      </button>
    );
  }

  // 3. KASUS BELUM ABSEN MASUK (WAJIB BUKA MODAL DENGAN KAMERA & GPS)
  if (variant === 'nav-center') {
    return (
      <button
        type="button"
        onClick={() => onOpenCheckInModal('ATTENDANCE')}
        disabled={disabled}
        className={`flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full bg-linear-to-b from-[#0f766e] to-teal-800 text-white shadow-lg shadow-teal-900/30 border-4 border-slate-900 active:scale-95 transition-all cursor-pointer ${className}`}
        title="Buka Kamera Selfie & GPS untuk Absen Masuk"
      >
        <Camera className="w-5 h-5 text-emerald-200" />
        <span className="text-[9px] font-bold tracking-tight">Absen</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenCheckInModal('ATTENDANCE')}
      disabled={disabled}
      className={`py-3.5 px-4 rounded-xl bg-linear-to-r from-[#0f766e] to-teal-700 hover:from-[#115e59] hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Camera className="w-4.5 h-4.5 text-emerald-200" />
        <Fingerprint className="w-4.5 h-4.5 text-emerald-300" />
      </div>
      <span>Presensi Masuk (Selfie &amp; GPS)</span>
    </button>
  );
};

export default AttendanceActionButton;
