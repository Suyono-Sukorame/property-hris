'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 select-none">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h1 className="text-base sm:text-lg font-bold text-slate-100">
        Memuat Ulang Sesi Presensi
      </h1>

      <p className="text-xs text-slate-400 max-w-xs text-center mt-1.5 mb-5 leading-relaxed">
        {error?.message || 'Sistem mendeteksi kendala pada antarmuka. Tekan tombol di bawah untuk menyegarkan.'}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/';
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
}
