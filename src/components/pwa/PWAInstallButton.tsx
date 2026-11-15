'use client';

import React from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'pill';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  customLabel?: string;
  className?: string;
  /** Apakah tetap tampil dengan status "Terpasang" jika sudah standalone */
  showWhenInstalled?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  customLabel,
  className = '',
  showWhenInstalled = false,
}) => {
  const {
    isStandalone,
    isIOSPromptOpen,
    promptInstall,
    closeIOSPrompt,
  } = usePWAInstall();

  // Jika sudah terinstall dalam mode standalone
  if (isStandalone) {
    if (!showWhenInstalled) return null;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Aplikasi Terpasang</span>
      </div>
    );
  }

  // Tipe styling berdasarkan variant
  const variantStyles = {
    primary:
      'bg-[#0f766e] hover:bg-[#0d6962] text-white border border-transparent shadow-xs',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent',
    pill:
      'bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700 rounded-full shadow-sm',
  };

  // Ukuran tombol
  const sizeStyles = {
    xs: 'h-7 px-2 text-[11px] rounded-lg gap-1',
    sm: 'h-8.5 px-3 text-xs rounded-xl gap-1.5',
    md: 'h-10 px-4 text-xs font-semibold rounded-xl gap-2',
  };

  const labelText = customLabel || 'Pasang di HP / Tablet';

  return (
    <>
      <button
        type="button"
        onClick={promptInstall}
        className={`inline-flex items-center justify-center font-medium transition-all active:scale-97 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        title="Pasang aplikasi di layar utama handphone atau tablet Anda"
      >
        <Smartphone className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        {showLabel && <span>{labelText}</span>}
        <Download className={size === 'xs' ? 'w-3 h-3 text-slate-400' : 'w-3 h-3 opacity-70'} />
      </button>

      <IOSInstallModal
        isOpen={isIOSPromptOpen}
        onClose={closeIOSPrompt}
      />
    </>
  );
};
