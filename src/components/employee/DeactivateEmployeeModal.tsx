'use client';

import React, { useState } from 'react';
import { Employee } from '@/types/hris';
import { Modal } from '@/components/ui';
import { AlertTriangle, UserX, Lock } from 'lucide-react';

interface DeactivateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: (
    employeeId: string,
    mode: 'deactivate' | 'permanent',
    details: {
      reason: string;
      effectiveDate: string;
      notes: string;
      blockLogin: boolean;
    }
  ) => Promise<void> | void;
}

const TERMINATION_REASONS = [
  'Pengunduran Diri (Resign)',
  'Habis Masa Kontrak Kerja (SPK Selesai)',
  'Pemutusan Hubungan Kerja (PHK)',
  'Pelanggaran Berat K3 / Kedisiplinan Kerja',
  'Pensiun / Usia Kerja',
  'Kondisi Kesehatan / Medis',
  'Lainnya',
];

export const DeactivateEmployeeModal: React.FC<DeactivateEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirm,
}) => {
  const [deleteMode, setDeleteMode] = useState<'deactivate' | 'permanent'>('deactivate');
  const [reason, setReason] = useState(TERMINATION_REASONS[0]);
  const [effectiveDate, setEffectiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [blockLogin, setBlockLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(employee.id, deleteMode, {
        reason,
        effectiveDate,
        notes,
        blockLogin,
      });
      onClose();
    } catch (err) {
      console.error('Error deactivating employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deleteMode === 'deactivate' ? 'Nonaktifkan Karyawan' : 'Hapus Karyawan Permanen'}
      subtitle={`${employee.name} · ${employee.jobCode} · ${employee.siteName}`}
      maxWidth="md"
      headerColor={deleteMode === 'deactivate' ? '#d97706' : '#dc2626'}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              deleteMode === 'deactivate'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Memproses...'
                : deleteMode === 'deactivate'
                  ? 'Konfirmasi Nonaktifkan'
                  : 'Hapus Permanen'}
            </span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Perubahan Status Personil Proyek</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Karyawan yang dinonaktifkan tidak akan muncul lagi di daftar presensi harian aktif lokasi
              proyek, namun data histori penggajian dan slip gaji terdahulu tetap tersimpan untuk arsip.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setDeleteMode('deactivate')}
            className={`py-2 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
              deleteMode === 'deactivate'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nonaktifkan (Arsip)
          </button>
          <button
            type="button"
            onClick={() => setDeleteMode('permanent')}
            className={`py-2 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
              deleteMode === 'permanent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hapus Permanen
          </button>
        </div>

        {/* Reason and Date */}
        {deleteMode === 'deactivate' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Alasan Penonaktifan / Terminasi
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {TERMINATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tanggal Efektif Berakhir
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Catatan Serah Terima / Keterangan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Contoh: APD dan berkas proyek sudah diserahkan ke Site Manager"
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockLogin}
                  onChange={(e) => setBlockLogin(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500/20 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Blokir hak akses login akun sistem karyawan ini secara otomatis
                </span>
              </label>
            </div>
          </div>
        )}

        {deleteMode === 'permanent' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            <p className="font-bold mb-1">Peringatan Penghapusan Permanen:</p>
            <p className="leading-relaxed">
              Tindakan ini akan menghapus seluruh data karyawan {employee.name} dari database. Tindakan ini
              tidak dapat dibatalkan. Jika Anda hanya ingin menghentikan masa kerja, pilih opsi{' '}
              <strong>Nonaktifkan (Arsip)</strong>.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};
