'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus } from '@/types/hris';
import { X, ClipboardEdit, CheckCircle, AlertTriangle } from 'lucide-react';

interface EditAttendanceModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSave: (recordId: string, updates: Partial<AttendanceRecord>) => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Hadir', 'Terlambat', 'Cuti', 'Izin Lapangan', 'Alpa'];

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  record,
  onClose,
  onSave,
}) => {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [lateMinutes, setLateMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [ppeCompliance, setPpeCompliance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (record) {
      // Strip WITA suffix for input[time]
      setCheckInTime(record.checkInTime.replace(' WITA', ''));
      setCheckOutTime(record.checkOutTime?.replace(' WITA', '') || '');
      setStatus(record.status);
      setLateMinutes(record.lateMinutes);
      setNotes(record.notes || '');
      setPpeCompliance(record.ppeCompliance);
      setSaved(false);
    }
  }, [record]);

  if (!record) return null;

  const handleSave = () => {
    setIsSaving(true);
    const updates: Partial<AttendanceRecord> = {
      checkInTime: checkInTime ? `${checkInTime} WITA` : record.checkInTime,
      checkOutTime: checkOutTime ? `${checkOutTime} WITA` : undefined,
      status,
      lateMinutes: Number(lateMinutes),
      notes,
      ppeCompliance,
    };
    onSave(record.id, updates);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 900);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-800 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardEdit className="w-4 h-4 text-slate-300" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Koreksi Data Presensi</h2>
              <p className="text-[11px] text-slate-400 truncate">
                {record.employeeName} · {record.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Info Strip */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Koreksi ini akan disimpan ke sistem dan Supabase. Pastikan data yang diubah sudah diverifikasi.
            </span>
          </div>

          {/* Check-In / Check-Out Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Jam Masuk
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Jam Pulang
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="Belum absen pulang"
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Status & Late Minutes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Status Kehadiran
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30 cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Menit Keterlambatan
              </label>
              <input
                type="number"
                min={0}
                max={480}
                value={lateMinutes}
                onChange={(e) => setLateMinutes(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
          </div>

          {/* APD Compliance for Field vs Office Notice */}
          {record.siteId === 'SITE-HQ' || record.shift.includes('Kantor') ? (
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-700">
              <span className="font-medium">Standar Lingkungan Kantor (Non-Site Proyek)</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Bebas Kewajiban APD
              </span>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-2">
                Kepatuhan APD K3
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ppeCompliance}
                  onChange={(e) => setPpeCompliance(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="font-medium text-slate-800">APD Lengkap (Helm + Rompi + Sepatu Safety)</span>
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Catatan / Alasan Koreksi
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Contoh: Koreksi GPS error, input manual dari absensi kertas"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || saved}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              saved
                ? 'text-white bg-emerald-600'
                : 'text-white bg-slate-800 hover:bg-slate-700'
            } disabled:opacity-60`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {saved ? 'Tersimpan!' : isSaving ? 'Menyimpan...' : 'Simpan Koreksi'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

