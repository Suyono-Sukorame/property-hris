'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { PayrollRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import { X, Printer, Download, CheckCircle, Mail, Building2 } from 'lucide-react';

interface PaySlipModalProps {
  record: PayrollRecord | null;
  onClose: () => void;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({ record, onClose }) => {
  const [emailSent, setEmailSent] = useState(false);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#80d5cb]" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-200">
              Pratinjau Dokumen Resmi · Slip Gaji Karyawan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Sheet Container */}
        <div id="printable-slip" className="p-8 bg-white text-slate-900 text-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                  <Image
                    src="/property-hris.png"
                    alt="Logo PT Bumi Raya Propertindo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                  PT Bumi Raya Propertindo Tbk
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kawasan Gedung Menara Bumi Raya Lt. 3-5, Jl. Jend. Ahmad Yani Km. 4.5 No. 21, Banjarmasin, Kalimantan Selatan 70238
              </p>
              <p className="text-[10px] text-slate-400">
                Divisi Human Capital & Payroll Operasional Properti · Dokumen Rahasia (Confidential)
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded text-slate-800 font-bold uppercase tracking-wider text-[11px] mb-1">
                SLIP GAJI KARYAWAN
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Periode: <span className="font-mono text-slate-900">{record.period}</span>
              </p>
              <div className="mt-1 flex items-center sm:justify-end gap-1.5">
                <StatusBadge status={record.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Employee Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-2 border-b border-slate-200 bg-slate-50/70 p-4 rounded-lg">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Nama Karyawan
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {record.employeeName}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block">
                {record.jobCode}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Nomor Induk / NIK
              </span>
              <span className="font-mono font-medium text-slate-800 block text-xs">
                {record.nik}
              </span>
              <span className="text-[11px] text-slate-600 block">
                {record.division}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Penempatan Site
              </span>
              <span className="font-semibold text-slate-800 block truncate">
                {record.siteName}
              </span>
              <span className="text-[10px] text-[#0f766e] font-semibold block">
                Area Proyek Terverifikasi
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Metode Pembayaran
              </span>
              <span className="font-medium text-slate-800 block text-[11px] truncate">
                {record.paymentMethod}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Tgl Bayar: {record.disbursementDate}
              </span>
            </div>
          </div>

          {/* High Density Split Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800 tracking-wide uppercase text-[11px]">
                  A. Penghasilan & Tunjangan
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">
                  (IDR)
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-600">Gaji Pokok Dasar</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.gajiPokok)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-600">Tunjangan Jabatan Struktural</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.tunjanganJabatan)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center bg-emerald-50/20">
                  <span className="text-slate-700 font-medium">Tunjangan Proyek Lapangan (Site)</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.tunjanganProyekLapangan)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-600">Tunjangan Sertifikasi K3 & HSE</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.tunjanganK3)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-600">Uang Makan & Transportasi Lapangan</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.uangMakanTransport)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">Upah Lembur Konstruksi</span>
                    {record.lemburHours > 0 && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ({record.lemburHours} Jam SPL Disetujui)
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.upahLembur)}
                  </span>
                </div>
                <div className="px-4 py-3 bg-slate-50 flex justify-between items-center font-bold text-slate-900 border-t border-slate-200">
                  <span>Total Penghasilan Bruto</span>
                  <span className="font-mono text-sm tabular-nums text-[#0f766e]">
                    {FORMAT_IDR(record.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800 tracking-wide uppercase text-[11px]">
                  B. Potongan & Pajak
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">
                  (IDR)
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">BPJS Ketenagakerjaan (JHT, JKK, JKM)</span>
                    <span className="text-[10px] text-slate-400 block">Porsi Karyawan 3%</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.potonganBPJSTK)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">BPJS Kesehatan</span>
                    <span className="text-[10px] text-slate-400 block">Porsi Karyawan 1%</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.potonganBPJSKes)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">PPh Pasal 21 Terutang</span>
                    <span className="text-[10px] text-slate-400 block">TER Bulanan Kemenkeu</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.potonganPPh21)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">Potongan Keterlambatan</span>
                    <span className="text-[10px] text-slate-400 block">Kebijakan Presensi Site</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {FORMAT_IDR(record.potonganKeterlambatan)}
                  </span>
                </div>
                {/* Spacer row to match heights */}
                <div className="px-4 py-2.5 flex justify-between items-center opacity-0 pointer-events-none">
                  <span>-</span>
                  <span>-</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center opacity-0 pointer-events-none">
                  <span>-</span>
                  <span>-</span>
                </div>
                <div className="px-4 py-3 bg-slate-50 flex justify-between items-center font-bold text-slate-900 border-t border-slate-200">
                  <span>Total Potongan</span>
                  <span className="font-mono text-sm tabular-nums text-rose-700">
                    {FORMAT_IDR(record.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Payout Ledger Banner */}
          <div className="mt-4 p-5 rounded-xl bg-[#0f766e] text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold block">
                Total Gaji Bersih Diterima (Take Home Pay)
              </span>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                Ditransfer langsung ke rekening terdaftar karyawan
              </p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums block text-white">
                {FORMAT_IDR(record.gajiBersih)}
              </span>
              <span className="text-[10px] font-mono text-emerald-200 uppercase tracking-widest">
                IDR · NETT SETTLED
              </span>
            </div>
          </div>

          {/* Legal Signatures Strip */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200 text-center">
            <div>
              <p className="text-[11px] text-slate-500 mb-12">
                Dibuat & Diverifikasi oleh,<br />
                <strong className="text-slate-800">Finance & Payroll Officer</strong>
              </p>
              <div className="w-36 mx-auto border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-900 text-xs">Ibu Sandra Dewi, S.E.</p>
              <p className="text-[10px] text-slate-400">Head of Payroll & Tax Administration</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 mb-12">
                Disetujui oleh,<br />
                <strong className="text-slate-800">Direksi Human Capital</strong>
              </p>
              <div className="w-36 mx-auto border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-900 text-xs">Ir. Hendra Gunawan, S.T.</p>
              <p className="text-[10px] text-slate-400">VP Human Capital & Project Governance</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak / Cetak PDF
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={emailSent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs disabled:opacity-50"
            >
              {emailSent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Slip Terkirim</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-slate-600" />
                  Kirim ke Email
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
