'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { UserProfileIdentity } from './UserProfileIdentity';
import { X, LogOut, AlertTriangle, UserCog } from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  onOpenEditProfile: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
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

      {/* Dropdown Mengambang dari Kanan Atas (Lebar Ringkas & Pas) */}
      <div className="fixed top-14 sm:top-16 right-2 sm:right-4 w-72 sm:w-80 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150 select-none">
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-900/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
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

          {/* Panel Body: Identitas Ringkas + Tombol Edit Profil */}
          <div className="p-3.5 space-y-3">
            {/* Kartu Identitas Ringkas (Avatar + Nama + Email + Jabatan) */}
            <UserProfileIdentity user={user} />

            {/* Aksi CRUD Profil & Keamanan Akun */}
            <div className="pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="w-full h-9.5 px-3 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 text-[#0f766e] font-semibold text-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2 truncate">
                  <UserCog className="w-4 h-4 text-[#0f766e] shrink-0" />
                  <span className="truncate">Edit Profil &amp; Kata Sandi</span>
                </span>
                <span className="text-[10px] font-bold text-[#0f766e] group-hover:underline shrink-0">
                  Ubah &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Panel Footer: Aksi Logout */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/90">
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
