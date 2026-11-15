'use client';

import React from 'react';
import Image from 'next/image';
import { X, Share2, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-white p-0.5">
              <Image
                src="/property-hris.png"
                alt="Logo HRIS"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                Pasang di Layar Utama HP
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                iPhone / iPad (iOS Safari)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Tutup panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Step by step instructions */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Pasang <strong>Property HRIS</strong> di layar utama iPhone Anda agar terbuka seketika dalam mode <strong>layar penuh (full screen)</strong> tanpa bilah alamat browser.
          </p>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                  Ketuk ikon <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#0f766e] font-bold"><Share2 className="w-3.5 h-3.5" /> Bagikan</span> di bilah bawah Safari.
                </p>
                <p className="text-[11px] text-slate-500">
                  Ikon kotak dengan tanda panah mengarah ke atas di bagian bawah layar iPhone Anda.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                  Pilih <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-bold"><PlusSquare className="w-3.5 h-3.5 text-[#0f766e]" /> Tambah ke Layar Utama</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Gulir ke bawah pada menu bagikan, lalu ketuk opsi <em>Add to Home Screen</em>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Ketuk tombol <span className="text-[#0f766e] font-bold">&quot;Tambah&quot; (Add)</span> di sudut kanan atas.
                </p>
                <p className="text-[11px] text-slate-500">
                  Ikon resmi Property HRIS akan langsung muncul di beranda handphone Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ukuran ringan &lt; 2 MB, tidak memakan memori ponsel dan bebas pembaruan ribet.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#0f766e]/90 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Saya Mengerti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
