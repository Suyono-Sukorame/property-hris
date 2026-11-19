'use client';

import React, { useState } from 'react';
import { Employee } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { Modal } from '@/components/ui';
import { Calendar, PlusCircle, AlertCircle, Users } from 'lucide-react';

interface GeneratePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPeriods: string[];
  employees: Employee[];
  onGenerate: (newPeriod: string) => Promise<void> | void;
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const GeneratePeriodModal: React.FC<GeneratePeriodModalProps> = ({
  isOpen,
  onClose,
  existingPeriods,
  employees,
  onGenerate,
}) => {
  const currentMonthIdx = new Date().getMonth();
  const nextMonthIdx = (currentMonthIdx + 1) % 12;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[nextMonthIdx]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const targetPeriod = `${selectedMonth} ${selectedYear}`;
  const isPeriodExist = existingPeriods.includes(targetPeriod);

  const activeEmployees = employees.filter((e) => e.status !== 'Nonaktif');
  const totalEstimatedPayroll = activeEmployees.reduce(
    (acc, e) =>
      acc +
      e.baseSalary +
      e.siteAllowance +
      e.k3Allowance +
      e.transportMealAllowance,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPeriodExist) {
      setErrorMsg(`Periode ${targetPeriod} sudah ada dalam sistem.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onGenerate(targetPeriod);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal membuat periode penggajian baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buka Periode Penggajian Baru"
      subtitle="Generate Draft Ledger Karyawan"
      maxWidth="md"
      headerColor="#0f766e"
      footer={
        <div className="flex items-center justify-between gap-2">
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
            disabled={isPeriodExist || isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Membuat Data...' : `Buka Periode ${targetPeriod}`}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600">
          Sistem akan men-generate draft slip gaji untuk seluruh personil aktif berdasarkan struktur gaji
          dan penempatan proyek terbaru.
        </p>

        {/* Month & Year Select */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-600 font-medium block text-xs mb-1">Bulan Penggajian</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setErrorMsg('');
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block text-xs mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setErrorMsg('');
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error / Warning if period already exists */}
        {isPeriodExist && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Periode <strong>{targetPeriod}</strong> sudah ada dalam daftar. Silakan pilih bulan lain atau
              kelola data pada periode tersebut.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Active Workforce Summary */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Karyawan Aktif:
            </span>
            <strong className="text-slate-900">{activeEmployees.length} Personil</strong>
          </div>

          <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-slate-200">
            <span className="font-medium">Estimasi Beban Gaji Pokok & Tunjangan:</span>
            <span className="font-mono font-bold text-slate-900">
              {FORMAT_IDR(totalEstimatedPayroll)}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
