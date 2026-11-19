import React from 'react';

export interface SignatureParty {
  roleTitle: string;
  name: string;
  positionTitle: string;
  customNote?: string;
}

export interface PrintSignatureBlockProps {
  location?: string;
  dateStr?: string;
  creator?: SignatureParty;
  approver?: SignatureParty;
  employee?: SignatureParty;
  alwaysVisible?: boolean;
  className?: string;
}

export const PrintSignatureBlock: React.FC<PrintSignatureBlockProps> = ({
  location = 'Banjarmasin',
  dateStr,
  creator = {
    roleTitle: 'Dibuat & Divalidasi oleh,',
    name: 'Dewi Anggraini',
    positionTitle: 'Admin Keuangan & HRD',
  },
  approver = {
    roleTitle: 'Mengetahui & Menyetujui,',
    name: 'Navyzar',
    positionTitle: 'Pemilik / Direktur Utama',
  },
  employee,
  alwaysVisible = false,
  className = '',
}) => {
  const formattedDate =
    dateStr ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const columnsCount = employee ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div
      className={`${alwaysVisible ? 'block' : 'hidden print:block'} pt-6 mt-6 border-t border-slate-300 break-inside-avoid ${className}`}
    >
      <div className="text-right text-[10px] text-slate-600 mb-4 font-medium">
        {location}, {formattedDate}
      </div>

      <div className={`grid ${columnsCount} gap-6 text-center text-xs`}>
        {/* Pihak 1: Pembuat / Admin */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">{creator.roleTitle}</p>
            <p className="font-bold text-slate-800 text-[11px]">{creator.positionTitle}</p>
          </div>
          <div className="mt-14">
            <div className="w-40 mx-auto border-b border-slate-700 mb-1" />
            <p className="font-bold text-slate-900 text-xs">{creator.name}</p>
            {creator.customNote && (
              <p className="text-[9px] text-slate-500">{creator.customNote}</p>
            )}
          </div>
        </div>

        {/* Pihak 2 (Opsional): Karyawan / Penerima Tugas */}
        {employee && (
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">{employee.roleTitle}</p>
              <p className="font-bold text-slate-800 text-[11px]">{employee.positionTitle}</p>
            </div>
            <div className="mt-14">
              <div className="w-40 mx-auto border-b border-slate-700 mb-1" />
              <p className="font-bold text-slate-900 text-xs">{employee.name}</p>
              {employee.customNote && (
                <p className="text-[9px] text-slate-500">{employee.customNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Pihak 3: Pimpinan / Direktur Utama */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">{approver.roleTitle}</p>
            <p className="font-bold text-slate-800 text-[11px]">{approver.positionTitle}</p>
          </div>
          <div className="mt-14">
            <div className="w-40 mx-auto border-b border-slate-700 mb-1" />
            <p className="font-bold text-slate-900 text-xs">{approver.name}</p>
            {approver.customNote && (
              <p className="text-[9px] text-slate-500">{approver.customNote}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-mono">
        <span>PT Bumi Raya Propertindo · Sistem Informasi HRIS Properti</span>
        <span>Halaman dicetak secara otomatis melalui sistem HRIS internal</span>
      </div>
    </div>
  );
};
