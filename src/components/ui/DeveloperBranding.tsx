'use client';

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface DeveloperBrandingProps {
  /** Gaya tema tampilan */
  variant?: 'dark' | 'light' | 'subtle' | 'badge';
  /** Ukuran teks */
  size?: 'xs' | 'sm';
  /** Tampilkan ikon panah eksternal */
  showIcon?: boolean;
  /** Teks awalan sebelum nama developer */
  prefixText?: string;
  /** Teks nama developer */
  developerName?: string;
  /** URL tautan portfolio / agensi */
  href?: string;
  className?: string;
}

export const DeveloperBranding: React.FC<DeveloperBrandingProps> = ({
  variant = 'dark',
  size = 'xs',
  showIcon = true,
  prefixText = 'Developed by',
  developerName = 'IonStack',
  href = 'https://ionstack.vercel.app/',
  className = '',
}) => {
  const sizeClass = size === 'xs' ? 'text-[10px] sm:text-[11px]' : 'text-xs';

  const variantStyles = {
    // Cocok untuk latar gelap (misal Login page dark, Sidebar dark)
    dark: 'text-slate-400 hover:text-slate-200',
    // Cocok untuk latar terang (misal kartu putih, modal, footer abu)
    light: 'text-slate-500 hover:text-slate-800',
    // Gaya subtle sangat halus
    subtle: 'text-slate-400 hover:text-emerald-700',
    // Gaya badge / pill kecil
    badge: 'px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80',
  };

  const linkAccentStyles = {
    dark: 'text-emerald-400 hover:text-emerald-300 font-semibold group-hover:underline',
    light: 'text-[#0f766e] hover:text-[#0b5c56] font-semibold group-hover:underline',
    subtle: 'text-emerald-600 hover:text-emerald-700 font-semibold group-hover:underline',
    badge: 'text-[#0f766e] font-bold group-hover:underline',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 transition-all group cursor-pointer ${sizeClass} ${variantStyles[variant]} ${className}`}
      title={`${prefixText} ${developerName} - Kunjungi situs resmi`}
    >
      <span>{prefixText}</span>
      <span className={`inline-flex items-center gap-1 ${linkAccentStyles[variant]}`}>
        <span>{developerName}</span>
        {showIcon && (
          <ExternalLink className="w-3 h-3 opacity-80 group-hover:opacity-100 transition-opacity" />
        )}
      </span>
    </a>
  );
};
