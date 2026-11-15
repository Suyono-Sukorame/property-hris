'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { UserProfileIdentity } from './UserProfileIdentity';
import { X, LogOut, QrCode, ShieldCheck, AlertTriangle, UserCog } from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  onOpenIDCard?: () => void;
  onOpenEditProfile: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenIDCard,
  onOpenEditProfile,
}) => {
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Gelap dengan Blur Halus */}
      <div
        onClick={() => {
          setIsConfirmingLogout(false);
          onClose();
        }}
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
        aria-hidden="true"
      />

      {/* Dropdown Mengambang dari Kanan Atas (Lebar ~50% Layar Mobile, Menempel di Icon User) */}
      <div className="fixed top-14 sm:top-16 right-2 sm:right-4 w-[55vw] min-w-70 max-w-sm sm:w-96 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150">
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[82vh] ring-1 ring-slate-900/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Profil Pengguna
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsConfirmingLogout(false);
                onClose();
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Tutup Panel Profil"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel Body (Scrollable) */}
          <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 text-xs">
            {/* Kartu Identitas A-Z */}
            <UserProfileIdentity user={user} />

            {/* Aksi Pintasan: Edit Profil & Kartu ID */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                Pengaturan &amp; Akses Pengguna
              </span>

              {/* Tombol Edit Profil */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="w-full h-9 px-3 rounded-xl bg-[#0f766e]/10 hover:bg-[#0f766e]/15 border border-[#0f766e]/20 text-[#0f766e] font-semibold text-xs transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <UserCog className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
                  <span className="truncate">Edit Profil Saya</span>
                </span>
                <span className="text-[10px] font-bold text-[#0f766e] group-hover:underline shrink-0">
                  Ubah &rarr;
                </span>
              </button>

              {/* Tombol Kartu ID Digital */}
              {onOpenIDCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIDCard();
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <QrCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Kartu ID &amp; Barcode</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 group-hover:underline shrink-0">
                    Buka &rarr;
                  </span>
                </button>
              )}
            </div>

            {/* Info Keamanan & Lisensi */}
            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-1.5 text-emerald-900 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Sesi aman · PT Bumi Raya Propertindo</span>
            </div>
          </div>

          {/* Panel Footer: Zona Keluar Akun */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 bg-slate-50/90">
            {isConfirmingLogout ? (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-medium bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Yakin ingin keluar dari akun?</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingLogout(false)}
                    className="h-8 px-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="h-8 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Ya, Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingLogout(true)}
                className="w-full h-8.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
