'use client';

import React from 'react';
import { Calendar, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { PayrollStatus } from '@/types/hris';

interface PayrollPeriodSelectorProps {
  periods: string[];
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  onOpenGenerateModal?: () => void;
  statusSummary?: {
    total: number;
    paid: number;
    approved: number;
    draft: number;
  };
  canManage?: boolean;
}

export const PayrollPeriodSelector: React.FC<PayrollPeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onSelectPeriod,
  onOpenGenerateModal,
  statusSummary,
  canManage = true,
}) => {
  const isAllPaid = statusSummary && statusSummary.total > 0 && statusSummary.paid === statusSummary.total;
  const hasPending = statusSummary && (statusSummary.draft > 0 || statusSummary.approved > 0);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Period Selection & Status */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0f766e] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Periode Penggajian Aktif
            </span>
            <div className="relative inline-block mt-0.5">
              <select
                value={selectedPeriod}
                onChange={(e) => onSelectPeriod(e.target.value)}
                aria-label="Pilih Periode Penggajian"
                className="font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-colors"
              >
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pill for the Selected Period */}
        {statusSummary && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            {isAllPaid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Periode Selesai (100% Dibayar)</span>
              </span>
            ) : hasPending ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Proses Berjalan ({statusSummary.paid}/{statusSummary.total} Dibayar)
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span>{statusSummary.total} Slip Terdaftar</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Action to Generate Next Period */}
      {canManage && onOpenGenerateModal && (
        <button
          type="button"
          onClick={onOpenGenerateModal}
          className="h-8.5 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f766e] bg-teal-50/80 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Buat Periode Baru</span>
        </button>
      )}
    </div>
  );
};
