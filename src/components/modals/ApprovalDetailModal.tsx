'use client';
import React, { useState } from 'react';
import { ApprovalItem } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Ban,
  FileText,
  User,
  Building,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';

interface ApprovalDetailModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  onUpdateStatus: (itemId: string, newStatus: 'Disetujui' | 'Ditolak', reviewNote: string) => void;
  canApprove?: boolean;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  item,
  onClose,
  onUpdateStatus,
  canApprove = true,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleAction = (status: 'Disetujui' | 'Ditolak') => {
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateStatus(
        item.id,
        status,
        reviewNote || (status === 'Disetujui' ? 'Disetujui sesuai SOP Properti' : 'Ditolak')
      );
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const isPending = item.status.includes('Menunggu');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in duration-200">
        {/* 1. Fixed Modal Top Header */}
        <div className="bg-[#0f766e] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-200 font-bold block">
              {item.ticketNumber}
            </span>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white mt-0.5">
              Detail Pengajuan &amp; Persetujuan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-slate-800 text-xs space-y-3.5">
          {/* Status & Priority Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <StatusBadge status={item.status} size="sm" />
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                  Prioritas: {item.priority}
                </span>
                <span className="text-slate-400 text-[10px] font-mono">
                  {item.dateRequested}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {item.type}
              </h3>
            </div>

            {item.costEstimate && (
              <div className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-right">
                <span className="text-[9px] text-emerald-700 font-semibold uppercase block">
                  Estimasi Biaya
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[#065f46] tabular-nums">
                  {FORMAT_IDR(item.costEstimate)}
                </span>
              </div>
            )}
          </div>

          {/* Compact Requester & Site Grid (2 columns on mobile, 3 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3" /> Pemohon
              </span>
              <span className="font-bold text-slate-900 text-xs block truncate">
                {item.employeeName}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {item.jobCode}
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                <Layers className="w-3 h-3" /> Divisi
              </span>
              <span className="font-medium text-slate-800 text-xs block truncate">
                {item.division}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                <Building className="w-3 h-3" /> Lokasi Proyek
              </span>
              <span className="font-medium text-slate-800 text-xs block truncate">
                {item.siteName}
              </span>
              {item.duration && (
                <span className="text-[10px] text-[#0f766e] font-semibold block">
                  Durasi: {item.duration}
                </span>
              )}
            </div>
          </div>

          {/* Detail Description */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Rincian Pengajuan
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed">
              {item.description}
            </div>
          </div>

          {/* Step-by-Step Approval Progress Trail */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Alur Persetujuan
            </span>

            <div className="space-y-2.5 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {item.steps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isRejected = step.status === 'rejected';

                return (
                  <div key={idx} className="flex items-start gap-2.5 relative">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        isDone
                          ? 'bg-emerald-50 border-[#0f766e] text-[#0f766e]'
                          : isRejected
                          ? 'bg-rose-50 border-rose-500 text-rose-600'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isRejected ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs">
                          {step.role}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Peninjau: <strong className="text-slate-800">{step.actorName}</strong>
                      </p>
                      {step.note && (
                        <p className="text-[10px] text-slate-500 italic mt-1 bg-white p-1.5 rounded-lg border border-slate-100">
                          &quot;{step.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action note input if pending and user has authority */}
          {isPending && canApprove && (
            <div className="pt-2 border-t border-slate-200">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Catatan Peninjauan (Opsional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Tuliskan catatan teknis K3, volume, atau instruksi anggaran..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* 3. Fixed Sticky Modal Footer (Optimized for Mobile Touch) */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>Persetujuan tercatat otomatis sesuai SOP perusahaan</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Tutup
            </button>

            {isPending && canApprove ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAction('Ditolak')}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 active:scale-95 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  <span>Tolak</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('Disetujui')}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Setujui</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
