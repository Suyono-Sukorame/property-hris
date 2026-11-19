'use client';

import React, { useState } from 'react';
import { Camera, X, CheckCircle2, LogIn, LogOut } from 'lucide-react';

export interface AttendancePhotoPairProps {
  checkInPhotoUrl?: string;
  checkOutPhotoUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  employeeName?: string;
  initials?: string;
  avatarColor?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const AttendancePhotoPair: React.FC<AttendancePhotoPairProps> = ({
  checkInPhotoUrl,
  checkOutPhotoUrl,
  checkInTime = '07:00',
  checkOutTime,
  employeeName = 'Karyawan',
  initials = 'KR',
  avatarColor = '#0f766e',
  size = 'md',
  className = '',
}) => {
  const [activeModal, setActiveModal] = useState<'IN' | 'OUT' | null>(null);

  const thumbSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const hasCheckOut = checkOutTime && checkOutTime !== '-';

  return (
    <>
      <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
        {/* 1. THUMBNAIL FOTO MASUK */}
        <div className="relative group">
          <div
            onClick={() => checkInPhotoUrl && setActiveModal('IN')}
            title={checkInPhotoUrl ? `Foto Masuk (${checkInTime})` : `Masuk: ${checkInTime}`}
            className={`relative overflow-hidden rounded-xl border border-emerald-300 shadow-2xs ${thumbSize} ${
              checkInPhotoUrl
                ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all active:scale-95'
                : 'bg-emerald-50 text-emerald-800'
            }`}
            style={!checkInPhotoUrl ? { backgroundColor: avatarColor } : undefined}
          >
            {checkInPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={checkInPhotoUrl}
                alt={`Foto Masuk ${employeeName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white text-[10px] select-none">
                {initials}
              </div>
            )}

            {/* Badge label IN */}
            <div className="absolute bottom-0 inset-x-0 bg-emerald-700/90 text-white text-[7px] font-mono font-bold text-center leading-tight py-0.5 select-none">
              IN
            </div>
          </div>
        </div>

        {/* 2. THUMBNAIL FOTO PULANG */}
        <div className="relative group">
          <div
            onClick={() => checkOutPhotoUrl && setActiveModal('OUT')}
            title={
              checkOutPhotoUrl
                ? `Foto Pulang (${checkOutTime})`
                : hasCheckOut
                ? `Pulang: ${checkOutTime}`
                : 'Belum presensi pulang'
            }
            className={`relative overflow-hidden rounded-xl border ${
              checkOutPhotoUrl
                ? 'border-blue-400 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all active:scale-95'
                : hasCheckOut
                ? 'border-slate-300 bg-slate-100'
                : 'border-dashed border-slate-300 bg-slate-50/80'
            } shadow-2xs ${thumbSize}`}
          >
            {checkOutPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={checkOutPhotoUrl}
                alt={`Foto Pulang ${employeeName}`}
                className="w-full h-full object-cover"
              />
            ) : hasCheckOut ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-[9px] font-mono">
                OUT
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px] font-mono select-none">
                —
              </div>
            )}

            {/* Badge label OUT */}
            <div
              className={`absolute bottom-0 inset-x-0 ${
                checkOutPhotoUrl ? 'bg-blue-700/90 text-white' : 'bg-slate-300/80 text-slate-600'
              } text-[7px] font-mono font-bold text-center leading-tight py-0.5 select-none`}
            >
              OUT
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ZOOM MODAL DUAL PHOTOS ─────────────────────────────── */}
      {activeModal && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Switcher Tabs */}
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold">Bukti Presensi Selfie</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector Tab Masuk / Pulang */}
            <div className="flex border-b border-slate-200 bg-slate-100 p-1 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => checkInPhotoUrl && setActiveModal('IN')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeModal === 'IN'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                } ${!checkInPhotoUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Masuk ({checkInTime})</span>
              </button>

              <button
                type="button"
                onClick={() => checkOutPhotoUrl && setActiveModal('OUT')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeModal === 'OUT'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                } ${!checkOutPhotoUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <LogOut className="w-3.5 h-3.5 text-blue-600" />
                <span>Pulang ({checkOutTime || '—'})</span>
              </button>
            </div>

            {/* Photo Display */}
            <div className="p-4 bg-slate-950 flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModal === 'IN' ? checkInPhotoUrl : checkOutPhotoUrl}
                alt={`Foto Presensi ${employeeName}`}
                className="w-full max-h-72 aspect-square object-cover rounded-xl border border-slate-800 shadow-md"
              />
              <span className="mt-2 text-[10px] text-slate-400 font-mono">
                {activeModal === 'IN'
                  ? `Foto Check-In Pagi: ${checkInTime}`
                  : `Foto Check-Out Sore: ${checkOutTime || '-'}`}
              </span>
            </div>

            {/* Info footer */}
            <div className="p-3.5 space-y-2 bg-slate-50 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block truncate">{employeeName}</span>
                  <span className="text-[10px] text-slate-500 block">Karyawan PT Bumi Raya Propertindo</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#065f46] border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-[#0f766e]" />
                  Terverifikasi
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
