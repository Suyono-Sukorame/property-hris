'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { PayrollRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import { X, Printer, CheckCircle, Mail, Building2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 overflow-hidden select-none">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Fixed Header Bar (Always Visible) */}
        <div className="shrink-0 bg-slate-900 px-4 sm:px-6 py-3 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-[#80d5cb] shrink-0" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-200 truncate">
              Pratinjau Dokumen Resmi · Slip Gaji Karyawan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Sheet Container (Starts from top without getting cut off) */}
        <div id="printable-slip" className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 text-xs">
          {/* Header Kop Perusahaan */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 sm:pb-6 border-b-2 border-slate-900 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                  <Image
                    src="/property-hris.png"
                    alt="Logo PT Bumi Raya Propertindo"
                    width={36}
                    height={36}
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 uppercase">
                  PT Bumi Raya Propertindo Tbk
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                Kawasan Gedung Menara Bumi Raya Lt. 3-5, Jl. Jend. Ahmad Yani Km. 4.5 No. 21, Banjarmasin, Kalimantan Selatan 70238
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400">
                Divisi Human Capital & Payroll Operasional Properti · Dokumen Rahasia (Confidential)
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                Slip No: {record.id}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                SLIP GAJI KARYAWAN
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Periode: <strong className="text-slate-900">{record.period}</strong>
              </div>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-5 sm:my-6 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Nama Karyawan
              </span>
              <span className="font-bold text-slate-900 text-xs block truncate mt-0.5">
                {record.employeeName}
              </span>
              <span className="text-[10px] font-mono text-slate-500">NIK: {record.nik}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Jabatan & Divisi
              </span>
              <span className="font-semibold text-slate-900 text-xs block truncate mt-0.5">
                {record.division}
              </span>
              <span className="text-[10px] font-mono font-medium text-[#0f766e]">
                {record.jobCode}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Penempatan Site
              </span>
              <span className="font-semibold text-slate-900 text-xs block truncate mt-0.5">
                {record.siteName}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Area Proyek Terverifikasi</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Metode Pembayaran
              </span>
              <span className="font-semibold text-slate-900 text-xs block truncate mt-0.5">
                {record.paymentMethod}
              </span>
              <span className="text-[10px] text-slate-500">Tgl Bayar: {record.disbursementDate}</span>
            </div>
          </div>

          {/* Two-Column Earnings & Deductions Ledger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4">
            {/* Box A: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  A. Penghasilan & Tunjangan
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">(IDR)</span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px]">
                <div className="px-3.5 py-2 flex justify-between">
                  <span className="text-slate-600">Gaji Pokok Dasar</span>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.gajiPokok)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <span className="text-slate-600">Tunjangan Jabatan Struktural</span>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.tunjanganJabatan)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <span className="text-slate-600">Tunjangan Proyek Lapangan (Site)</span>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.tunjanganProyekLapangan)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <span className="text-slate-600">Tunjangan Sertifikasi K3 & HSE</span>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.tunjanganK3)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <span className="text-slate-600">Uang Makan & Transportasi Lapangan</span>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.uangMakanTransport)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <div>
                    <span className="text-slate-600">Upah Lembur Konstruksi</span>
                    {record.lemburHours > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono block">({record.lemburHours} Jam Terverifikasi)</span>
                    )}
                  </div>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.upahLembur)}</span>
                </div>
                <div className="px-3.5 py-2.5 bg-emerald-50/50 flex justify-between items-center font-bold text-slate-900 border-t border-slate-200">
                  <span>Total Penghasilan Bruto</span>
                  <span className="font-mono text-emerald-700 text-xs sm:text-sm">{FORMAT_IDR(record.totalEarnings)}</span>
                </div>
              </div>
            </div>

            {/* Box B: Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  B. Potongan & Pajak
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">(IDR)</span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px]">
                <div className="px-3.5 py-2 flex justify-between">
                  <div>
                    <span className="text-slate-600">BPJS Ketenagakerjaan (JHT, JKK, JKM)</span>
                    <span className="text-[9px] text-slate-400 block">Porsi Karyawan 3%</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.potonganBPJSTK)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <div>
                    <span className="text-slate-600">BPJS Kesehatan</span>
                    <span className="text-[9px] text-slate-400 block">Porsi Karyawan 1%</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.potonganBPJSKes)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <div>
                    <span className="text-slate-600">PPh Pasal 21 Terutang</span>
                    <span className="text-[9px] text-slate-400 block">TER Bulanan Kemenkeu</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.potonganPPh21)}</span>
                </div>
                <div className="px-3.5 py-2 flex justify-between">
                  <div>
                    <span className="text-slate-600">Potongan Keterlambatan</span>
                    <span className="text-[9px] text-slate-400 block">Kebijakan Presensi Site</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">{FORMAT_IDR(record.potonganKeterlambatan)}</span>
                </div>
                <div className="px-3.5 py-2.5 bg-rose-50/40 flex justify-between items-center font-bold text-slate-900 border-t border-slate-200">
                  <span>Total Potongan</span>
                  <span className="font-mono text-rose-600 text-xs sm:text-sm">{FORMAT_IDR(record.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Highlight Banner */}
          <div className="my-5 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#0f766e] to-[#115e59] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-200 block">
                Total Gaji Bersih Diterima (Take Home Pay)
              </span>
              <p className="text-[11px] text-emerald-100/90 mt-0.5">
                Ditransfer ke rekening resmi karyawan tanpa potongan tersembunyi
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white block">
                {FORMAT_IDR(record.gajiBersih)}
              </span>
              <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                <StatusBadge status={record.status} size="sm" />
                <span className="text-[10px] text-emerald-200 font-mono">Status: {record.status}</span>
              </div>
            </div>
          </div>

          {/* Legal Notes & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-slate-200 text-center">
            <div>
              <p className="text-[11px] text-slate-500 mb-10">
                Dihitung & Divalidasi oleh,<br />
                <strong className="text-slate-800">Finance & Payroll Officer</strong>
              </p>
              <div className="w-36 mx-auto border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-900 text-xs">Ratna Kumalasari, S.Psi.</p>
              <p className="text-[10px] text-slate-400">Head of Human Capital & Payroll</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 mb-10">
                Disetujui oleh,<br />
                <strong className="text-slate-800">Direksi Operasional Properti</strong>
              </p>
              <div className="w-36 mx-auto border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-900 text-xs">Ir. Bagus Wicaksono, M.T.</p>
              <p className="text-[10px] text-slate-400">Senior Project Director</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Fixed Action Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Slip / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={emailSent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {emailSent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Slip Terkirim</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>Kirim Email</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
