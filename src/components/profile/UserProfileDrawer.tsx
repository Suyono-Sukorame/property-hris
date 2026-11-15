'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { UserProfileIdentity } from './UserProfileIdentity';
import { PWAInstallButton } from '@/components/pwa';
import { X, LogOut, QrCode, ShieldCheck, Smartphone, AlertTriangle } from 'lucide-react';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
  onOpenIDCard?: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenIDCard,
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
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Container Adaptif: Bottom Sheet di Mobile, Popover / Modal di Desktop */}
      <div className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-16 sm:right-4 sm:left-auto sm:max-w-md w-full z-50 animate-in slide-in-from-bottom-5 sm:slide-in-from-top-2 sm:zoom-in-95 duration-200">
        <div
          className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle Bar */}
          <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-slate-300" />
          </div>

          {/* Panel Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Profil Akun Terverifikasi
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsConfirmingLogout(false);
                onClose();
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Tutup Panel Profil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body (Scrollable) */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Kartu Identitas A-Z */}
            <UserProfileIdentity user={user} />

            {/* Aksi & Pintasan Penting */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                Fitur &amp; Akses Pengguna
              </span>

              {/* Tombol Kartu ID Digital */}
              {onOpenIDCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIDCard();
                  }}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#0f766e]" />
                    <span>Kartu ID &amp; Barcode Digital</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#0f766e] group-hover:underline">
                    Buka Kartu &rarr;
                  </span>
                </button>
              )}

              {/* Tombol Pasang Aplikasi di HP (PWA) */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-xs truncate">Aplikasi Layar Utama</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Pasang di HP untuk akses 1-ketuk tanpa browser
                  </p>
                </div>
                <PWAInstallButton
                  variant="primary"
                  size="xs"
                  customLabel="Pasang"
                  className="shrink-0"
                />
              </div>
            </div>

            {/* Info Keamanan & Lisensi */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2 text-emerald-900 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sesi terenkripsi aman · PT Bumi Raya Propertindo</span>
            </div>
          </div>

          {/* Panel Footer: Zona Keluar Akun */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/90">
            {isConfirmingLogout ? (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-amber-800 text-[11px] font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Apakah Anda yakin ingin keluar dari akun ini?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingLogout(false)}
                    className="h-9 px-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Ya, Keluar Akun</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingLogout(true)}
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
