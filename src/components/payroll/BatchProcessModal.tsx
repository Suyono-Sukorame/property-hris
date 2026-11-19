'use client';

import React, { useState } from 'react';
import { PayrollRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { Modal } from '@/components/ui';
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Calendar,
  CreditCard,
  Users,
} from 'lucide-react';

interface BatchProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PayrollRecord[];
  period: string;
  onConfirmBatch: (
    selectedIds: string[],
    disbursementDate: string,
    transferNote: string
  ) => Promise<void> | void;
}

export const BatchProcessModal: React.FC<BatchProcessModalProps> = ({
  isOpen,
  onClose,
  records,
  period,
  onConfirmBatch,
}) => {
  // Only records that are not yet 'Dibayar'
  const eligibleRecords = records.filter((r) => r.status !== 'Dibayar');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    eligibleRecords.map((r) => r.id)
  );

  // Sync selectedIds when eligible records change or modal opens
  React.useEffect(() => {
    setSelectedIds(eligibleRecords.map((r) => r.id));
  }, [isOpen, records]);

  const [disbursementDate, setDisbursementDate] = useState(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });
  const [transferNote, setTransferNote] = useState('Transfer Payroll Resmi Rekening Bank Karyawan');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRecords = eligibleRecords.filter((r) => selectedIds.includes(r.id));
  const totalNetPay = selectedRecords.reduce((acc, r) => acc + r.gajiBersih, 0);
  const totalEarnings = selectedRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const totalDeductions = selectedRecords.reduce((acc, r) => acc + r.totalDeductions, 0);

  // Group by Bank
  const bankBreakdown = selectedRecords.reduce((acc, r) => {
    const bankName = r.paymentMethod.split(' ')[1] || r.paymentMethod.split(' ')[0] || 'Bank Lain';
    acc[bankName] = (acc[bankName] || 0) + r.gajiBersih;
    return acc;
  }, {} as Record<string, number>);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === eligibleRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleRecords.map((r) => r.id));
    }
  };

  const handleToggleRecord = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !isAgreed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirmBatch(selectedIds, disbursementDate, transferNote);
      onClose();
    } catch (err) {
      console.error('Batch payroll error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi & Eksekusi Payroll Massal"
      subtitle={`Periode: ${period}`}
      maxWidth="2xl"
      headerColor="#0f766e"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Terpilih: <strong className="text-slate-800">{selectedIds.length}</strong> dari{' '}
            {eligibleRecords.length} karyawan
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || !isAgreed || isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Memproses Transfer...'
                  : `Eksekusi Pembayaran (${FORMAT_IDR(totalNetPay)})`}
              </span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notice alert */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Otorisasi Finansial & Persetujuan Direksi</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Tindakan ini akan mengesahkan pencairan gaji, memotong denda keterlambatan/kasbon otomatis,
              dan menandai status karyawan menjadi <strong className="font-bold">Dibayar</strong> serta
              mengunci data slip gaji periode ini.
            </p>
          </div>
        </div>

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Penghasilan Bruto
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-slate-900 block mt-0.5">
              {FORMAT_IDR(totalEarnings)}
            </span>
            <span className="text-[10px] text-slate-500">Gaji + Tunjangan + Lembur</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-500 block tracking-wider">
              Total Potongan & Pajak
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-700 block mt-0.5">
              -{FORMAT_IDR(totalDeductions)}
            </span>
            <span className="text-[10px] text-rose-600">BPJS, PPh21, Kasbon, Denda</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
              Total Pencairan Bersih
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#065f46] block mt-0.5">
              {FORMAT_IDR(totalNetPay)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Total Dana Diperlukan</span>
          </div>
        </div>

        {/* Bank Breakdown */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-500" />
            Distribusi Bank Penerima
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(bankBreakdown).map(([bank, amount]) => (
              <span
                key={bank}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                {bank}: <strong className="font-mono text-slate-900">{FORMAT_IDR(amount)}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Employee Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Pilih Karyawan yang Dicairkan ({selectedIds.length}/{eligibleRecords.length})
            </span>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-[#0f766e] hover:underline font-semibold cursor-pointer text-[11px]"
            >
              {selectedIds.length === eligibleRecords.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {eligibleRecords.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Semua karyawan pada periode ini telah berstatus Dibayar.
              </div>
            ) : (
              eligibleRecords.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRecord(r.id)}
                        className="rounded text-[#0f766e] focus:ring-teal-500/20 w-4 h-4 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{r.employeeName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {r.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {FORMAT_IDR(r.gajiBersih)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{r.siteName}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-slate-600 font-medium block text-xs mb-1">
              Tanggal Pencairan / Transfer
            </label>
            <input
              type="text"
              value={disbursementDate}
              onChange={(e) => setDisbursementDate(e.target.value)}
              placeholder="Contoh: 31 Oktober 2026"
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block text-xs mb-1">
              Catatan / Referensi Batch
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="Keterangan transfer"
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>

        {/* Checkbox Agreement */}
        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 rounded text-[#0f766e] focus:ring-teal-500/20 w-4 h-4 cursor-pointer"
            />
            <span className="text-slate-700 leading-tight">
              Saya mengonfirmasi bahwa penghitungan gaji, potongan kehadiran, dan nomor rekening penerima
              telah diverifikasi dan siap ditransfer.
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
};
