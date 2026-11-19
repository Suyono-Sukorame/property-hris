'use client';

import React, { useState } from 'react';
import { PayrollRecord } from '@/types/hris';
import { Modal } from '@/components/ui';
import { Download, FileSpreadsheet, Building2, CheckCircle2 } from 'lucide-react';

interface BankExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PayrollRecord[];
  period: string;
}

export type ExportFormat = 'LEDGER_FULL' | 'BCA_PAYROLL' | 'MANDIRI_MCM' | 'GENERAL_BANK';

export const BankExportModal: React.FC<BankExportModalProps> = ({
  isOpen,
  onClose,
  records,
  period,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('LEDGER_FULL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Helper to extract clean account number from string like "Bank BCA 1234-5678-90 a.n Dewi Anggraini"
  const extractAccountInfo = (paymentMethod: string) => {
    const raw = paymentMethod || '';
    const match = raw.match(/(\d[\d\s-]+\d)/);
    const accountNum = match ? match[1].replace(/[\s-]/g, '') : '-';
    const anMatch = raw.match(/a\.n\s+(.+)$/i);
    const accountHolder = anMatch ? anMatch[1].trim() : '';
    return { accountNum, accountHolder };
  };

  const handleDownload = () => {
    let csvContent = '';
    const cleanPeriodSlug = period.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    let filename = `payroll_${cleanPeriodSlug}.csv`;

    if (selectedFormat === 'LEDGER_FULL') {
      filename = `ledger_payroll_hr_${cleanPeriodSlug}.csv`;
      const headers = [
        'ID Slip',
        'NIK',
        'Nama Karyawan',
        'Jabatan',
        'Site Proyek',
        'Gaji Pokok',
        'Tunjangan Jabatan',
        'Tunjangan Site',
        'Tunjangan K3',
        'Uang Makan & Transport',
        'Upah Lembur',
        'Jam Lembur',
        'Total Penghasilan Bruto',
        'BPJS Ketenagakerjaan',
        'BPJS Kesehatan',
        'Pajak PPh 21',
        'Potongan Keterlambatan',
        'Potongan Kasbon',
        'Total Potongan',
        'Gaji Bersih Diterima',
        'Status',
        'Metode Pembayaran',
        'Tanggal Pembayaran',
      ];
      const rows = records.map((r) => [
        r.id,
        r.nik,
        `"${r.employeeName}"`,
        `"${r.jobCode}"`,
        `"${r.siteName}"`,
        r.gajiPokok,
        r.tunjanganJabatan,
        r.tunjanganProyekLapangan,
        r.tunjanganK3,
        r.uangMakanTransport,
        r.upahLembur,
        r.lemburHours,
        r.totalEarnings,
        r.potonganBPJSTK,
        r.potonganBPJSKes,
        r.potonganPPh21,
        r.potonganKeterlambatan || 0,
        r.potonganKasbon || 0,
        r.totalDeductions,
        r.gajiBersih,
        r.status,
        `"${r.paymentMethod}"`,
        `"${r.disbursementDate}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    } else if (selectedFormat === 'BCA_PAYROLL') {
      filename = `klikbca_payroll_${cleanPeriodSlug}.csv`;
      // BCA Payroll Format: Rekening Penerima, Nominal, Nama Penerima, Berita
      const headers = ['Nomor_Rekening_Tujuan', 'Nominal_Transfer', 'Nama_Penerima', 'Berita_Transfer'];
      const rows = records.map((r) => {
        const { accountNum, accountHolder } = extractAccountInfo(r.paymentMethod);
        return [
          accountNum,
          r.gajiBersih,
          `"${accountHolder || r.employeeName}"`,
          `"Gaji ${period} - ${r.employeeName}"`,
        ];
      });
      csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    } else if (selectedFormat === 'MANDIRI_MCM') {
      filename = `mandiri_mcm_payroll_${cleanPeriodSlug}.csv`;
      // Mandiri Cash Management: No Rekening, Nama, Nominal, Keterangan
      const headers = ['BENEFICIARY_ACCOUNT', 'BENEFICIARY_NAME', 'AMOUNT', 'REMARK'];
      const rows = records.map((r) => {
        const { accountNum, accountHolder } = extractAccountInfo(r.paymentMethod);
        return [
          accountNum,
          `"${accountHolder || r.employeeName}"`,
          r.gajiBersih,
          `"Payroll ${period}"`,
        ];
      });
      csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    } else {
      filename = `rekap_transfer_bank_${cleanPeriodSlug}.csv`;
      // General format
      const headers = ['NIK', 'Nama Karyawan', 'Nomor Rekening & Bank', 'Nominal Transfer Bersih', 'Status'];
      const rows = records.map((r) => [
        r.nik,
        `"${r.employeeName}"`,
        `"${r.paymentMethod}"`,
        r.gajiBersih,
        r.status,
      ]);
      csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ekspor Data Penggajian & Transfer Bank"
      subtitle={`Periode: ${period} · ${records.length} Karyawan`}
      maxWidth="md"
      headerColor="#0f766e"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh File CSV</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Pilih format file ekspor sesuai kebutuhan audit internal perusahaan atau integrasi bulk upload
          internet banking:
        </p>

        <div className="space-y-2.5">
          {/* Option 1: Full Ledger */}
          <label
            onClick={() => setSelectedFormat('LEDGER_FULL')}
            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              selectedFormat === 'LEDGER_FULL'
                ? 'border-[#0f766e] bg-teal-50/30 ring-1 ring-[#0f766e]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              checked={selectedFormat === 'LEDGER_FULL'}
              onChange={() => setSelectedFormat('LEDGER_FULL')}
              className="mt-1 text-[#0f766e] focus:ring-teal-500/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-[#0f766e]" />
                <span>Ledger Internal HR & Payroll (Lengkap)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Format lengkap seluruh komponen gaji, tunjangan K3, lembur, kasbon, denda, BPJS, dan PPh 21
                untuk arsip pembukuan keuangan.
              </p>
            </div>
          </label>

          {/* Option 2: BCA Payroll */}
          <label
            onClick={() => setSelectedFormat('BCA_PAYROLL')}
            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              selectedFormat === 'BCA_PAYROLL'
                ? 'border-[#0f766e] bg-teal-50/30 ring-1 ring-[#0f766e]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              checked={selectedFormat === 'BCA_PAYROLL'}
              onChange={() => setSelectedFormat('BCA_PAYROLL')}
              className="mt-1 text-[#0f766e] focus:ring-teal-500/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Format BCA Payroll (KlikBCA Bisnis)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Template CSV siap unggah ke menu Multi-Transfer / Payroll KlikBCA Bisnis (No Rekening, Nominal,
                Nama, Berita).
              </p>
            </div>
          </label>

          {/* Option 3: Mandiri MCM */}
          <label
            onClick={() => setSelectedFormat('MANDIRI_MCM')}
            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              selectedFormat === 'MANDIRI_MCM'
                ? 'border-[#0f766e] bg-teal-50/30 ring-1 ring-[#0f766e]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              checked={selectedFormat === 'MANDIRI_MCM'}
              onChange={() => setSelectedFormat('MANDIRI_MCM')}
              className="mt-1 text-[#0f766e] focus:ring-teal-500/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Format Mandiri MCM (Cash Management)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Struktur kolom standar untuk upload transaksi massal payroll pada portal Mandiri Cash
                Management.
              </p>
            </div>
          </label>

          {/* Option 4: General Bank */}
          <label
            onClick={() => setSelectedFormat('GENERAL_BANK')}
            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              selectedFormat === 'GENERAL_BANK'
                ? 'border-[#0f766e] bg-teal-50/30 ring-1 ring-[#0f766e]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exportFormat"
              checked={selectedFormat === 'GENERAL_BANK'}
              onChange={() => setSelectedFormat('GENERAL_BANK')}
              className="mt-1 text-[#0f766e] focus:ring-teal-500/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Format Ringkas (Rekap Rekening & Nominal)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Ringkasan tabel simpel nomor rekening, bank, nama, dan nominal transfer bersih untuk teller /
                administrasi manual.
              </p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
};
