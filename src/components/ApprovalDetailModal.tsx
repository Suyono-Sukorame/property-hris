import React, { useState } from 'react';
import { ApprovalItem } from '../types/hris';
import { FORMAT_IDR } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { X, CheckCircle2, AlertCircle, Clock, Check, Ban, FileText } from 'lucide-react';

interface ApprovalDetailModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  onUpdateStatus: (itemId: string, newStatus: 'Disetujui' | 'Ditolak', reviewNote: string) => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  item,
  onClose,
  onUpdateStatus,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleAction = (status: 'Disetujui' | 'Ditolak') => {
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateStatus(item.id, status, reviewNote || (status === 'Disetujui' ? 'Disetujui sesuai SOP Properti' : 'Ditolak'));
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0f766e] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-200 font-semibold block">
              {item.ticketNumber}
            </span>
            <h2 className="text-base font-bold tracking-tight text-white mt-0.5">
              Workflow Matriks Persetujuan & Dokumen Lapangan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-800 text-xs">
          {/* Main Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={item.status} size="sm" />
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                  Prioritas: {item.priority}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Diajukan: {item.dateRequested}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {item.type}
              </h3>
            </div>

            {item.costEstimate && (
              <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-right">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase block">
                  Estimasi Biaya / Alokasi
                </span>
                <span className="font-mono font-bold text-sm text-[#065f46] tabular-nums">
                  {FORMAT_IDR(item.costEstimate)}
                </span>
              </div>
            )}
          </div>

          {/* Requester & Site Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Pemohon
              </span>
              <span className="font-bold text-slate-800 text-xs block">
                {item.employeeName}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {item.jobCode}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Divisi & Departemen
              </span>
              <span className="font-medium text-slate-800 text-xs block">
                {item.division}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Lokasi Penugasan Proyek
              </span>
              <span className="font-medium text-slate-800 text-xs block truncate">
                {item.siteName}
              </span>
              {item.duration && (
                <span className="text-[11px] text-[#0f766e] font-semibold block mt-0.5">
                  Durasi: {item.duration}
                </span>
              )}
            </div>
          </div>

          {/* Detail Description */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Deskripsi & Rincian Teknis Pekerjaan
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
              {item.description}
            </div>
          </div>

          {/* Step-by-Step Approval Progress Trail */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Jejak Tahapan Persetujuan Berjenjang (Audit Trail)
            </span>

            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-200">
              {item.steps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isRejected = step.status === 'rejected';

                return (
                  <div key={idx} className="flex items-start gap-3.5 relative">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        isDone
                          ? 'bg-[#ecfdf5] border-[#0f766e] text-[#0f766e]'
                          : isRejected
                          ? 'bg-rose-50 border-rose-500 text-rose-600'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isRejected ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 text-xs">
                          {step.role}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Peninjau: <strong className="text-slate-800">{step.actorName}</strong>
                      </p>
                      {step.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                          &quot;{step.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action note input if pending */}
          {item.status.includes('Menunggu') && (
            <div className="pt-3 border-t border-slate-200">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Catatan Peninjauan / Verifikasi Lapangan (Opsional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Tuliskan catatan teknis K3, volume pengecoran, atau instruksi anggaran..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen tersinkronisasi otomatis dengan SOP HR Properti</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>

            {item.status.includes('Menunggu') && (
              <>
                <button
                  type="button"
                  onClick={() => handleAction('Ditolak')}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Tolak Pengajuan
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('Disetujui')}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
                >
                  <Check className="w-4 h-4" />
                  Setujui Pengajuan
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
