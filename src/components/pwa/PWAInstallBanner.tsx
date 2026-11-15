'use client';

import React from 'react';
import Image from 'next/image';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';

interface PWAInstallBannerProps {
  /** Posisi banner: 'bottom' (default, di atas bottom nav di mobile) atau 'top' */
  position?: 'bottom' | 'top';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  position = 'bottom',
  className = '',
}) => {
  const {
    isInstallable,
    isStandalone,
    isDismissed,
    isIOSPromptOpen,
    promptInstall,
    dismissBanner,
    closeIOSPrompt,
  } = usePWAInstall();

  // Jika sudah terinstall, atau user telah menutup banner, atau browser tidak mendukung install, jangan tampilkan banner
  if (isStandalone || isDismissed || !isInstallable) {
    return (
      <IOSInstallModal
        isOpen={isIOSPromptOpen}
        onClose={closeIOSPrompt}
      />
    );
  }

  const positionClasses =
    position === 'bottom'
      ? 'bottom-16 sm:bottom-5 inset-x-3 sm:inset-x-auto sm:right-5 sm:max-w-md'
      : 'top-3 inset-x-3 sm:inset-x-auto sm:right-5 sm:max-w-md';

  return (
    <>
      <div
        className={`fixed z-40 animate-in slide-in-from-bottom-3 duration-300 ${positionClasses} ${className}`}
      >
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3">
          {/* Logo App */}
          <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 shadow-xs border border-slate-200 overflow-hidden">
            <Image
              src="/property-hris.png"
              alt="Logo Property HRIS"
              width={36}
              height={36}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          {/* Info Text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                Pasang Aplikasi di HP
              </h4>
              <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#0f766e] text-white uppercase tracking-wider">
                Resmi
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5">
              Akses cepat layar penuh &amp; hemat kuota
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={promptInstall}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#0f766e] hover:bg-[#0d6962] active:scale-95 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang</span>
            </button>

            <button
              type="button"
              onClick={dismissBanner}
              title="Tutup banner"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal panduan iOS jika Safari */}
      <IOSInstallModal
        isOpen={isIOSPromptOpen}
        onClose={closeIOSPrompt}
      />
    </>
  );
};
