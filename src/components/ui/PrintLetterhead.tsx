import React from 'react';
import Image from 'next/image';

export interface PrintLetterheadProps {
  title: string;
  docNumber?: string;
  period?: string;
  classification?: string;
  alwaysVisible?: boolean;
  className?: string;
}

export const PrintLetterhead: React.FC<PrintLetterheadProps> = ({
  title,
  docNumber,
  period,
  classification = 'DOKUMEN RESMI INTERNAL',
  alwaysVisible = false,
  className = '',
}) => {
  return (
    <div
      className={`${alwaysVisible ? 'block' : 'hidden print:block'} pb-4 mb-5 border-b-2 border-slate-900 ${className}`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Identitas Perusahaan */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
            <Image
              src="/property-hris.png"
              alt="Logo PT Bumi Raya Propertindo"
              width={48}
              height={48}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              PT Bumi Raya Propertindo
            </h1>
            <p className="text-[10px] font-semibold text-[#0f766e]">
              Sistem Manajemen SDM & Presensi Lapangan
            </p>
            <p className="text-[9px] text-slate-600 mt-0.5 leading-relaxed">
              Kalimantan Selatan
            </p>
          </div>
        </div>

        {/* Informasi Dokumen */}
        <div className="text-right shrink-0">
          <span className="inline-block text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
            {classification}
          </span>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mt-1 uppercase">
            {title}
          </h2>
          {docNumber && (
            <p className="font-mono text-[9px] text-slate-600 font-semibold mt-0.5">
              {docNumber}
            </p>
          )}
          {period && (
            <p className="text-[10px] text-slate-700 mt-0.5">
              Periode: <strong className="font-bold text-slate-900">{period}</strong>
            </p>
          )}
        </div>
      </div>
      {/* Garis aksen ganda khas kop surat resmi */}
      <div className="w-full border-b border-slate-400 mt-2" />
    </div>
  );
};
