'use client';

import React, { useState } from 'react';
import { Camera, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SelfieThumbnailProps {
  photoUrl?: string;
  employeeName?: string;
  initials?: string;
  avatarColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showModalOnClick?: boolean;
  className?: string;
  caption?: string;
}

export const SelfieThumbnail: React.FC<SelfieThumbnailProps> = ({
  photoUrl,
  employeeName = 'Karyawan',
  initials = 'KR',
  avatarColor = '#0f766e',
  size = 'sm',
  showModalOnClick = true,
  className = '',
  caption,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px] rounded-md',
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
  };

  const handleOpen = (e: React.MouseEvent) => {
    if (showModalOnClick && photoUrl) {
      e.stopPropagation();
      setIsOpenModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        title={photoUrl ? 'Klik untuk melihat foto selfie presensi' : employeeName}
        className={`relative shrink-0 overflow-hidden border border-slate-200/90 shadow-2xs ${
          sizeClasses[size]
        } ${photoUrl && showModalOnClick ? 'cursor-pointer hover:ring-2 hover:ring-[#0f766e]/40 transition-all active:scale-95' : ''} ${className}`}
        style={!photoUrl ? { backgroundColor: avatarColor } : undefined}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`Foto Selfie ${employeeName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-white uppercase select-none">
            {initials}
          </div>
        )}

        {photoUrl && size !== 'xs' && (
          <div className="absolute bottom-0 right-0 bg-emerald-600/90 text-white p-0.5 rounded-tl-sm">
            <Camera className="w-2 h-2" />
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ZOOM MODAL ────────────────────────────────────────── */}
      {isOpenModal && photoUrl && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpenModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-xs w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0f766e] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-200" />
                <h3 className="text-xs font-bold truncate">Bukti Selfie Presensi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo */}
            <div className="p-3 bg-slate-900 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={`Foto Selfie ${employeeName}`}
                className="w-full max-h-80 aspect-square object-cover rounded-xl border border-slate-800"
              />
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

              {caption && (
                <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80">
                  {caption}
                </p>
              )}

              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
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

export default SelfieThumbnail;
