'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { PayrollRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { Modal } from '@/components/ui';
import { Upload, CheckCircle2, Image as ImageIcon, X, Trash2, FileText } from 'lucide-react';

interface TransferProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
  onSave: (recordId: string, proofUrl: string, note?: string) => Promise<void> | void;
}

export const TransferProofModal: React.FC<TransferProofModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
}) => {
  const [proofUrl, setProofUrl] = useState<string>('');
  const [refNote, setRefNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (record) {
      setProofUrl(record.transferProofUrl || '');
      setRefNote(record.transferNote || '');
    }
  }, [record, isOpen]);

  if (!record) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Data URL preview (or Supabase Storage upload)
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setProofUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setProofUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(record.id, proofUrl, refNote);
      onClose();
    } catch (err) {
      console.error('Error saving transfer proof:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lampiran Bukti Transfer Bank"
      subtitle={`${record.employeeName} · ${record.period}`}
      maxWidth="md"
      headerColor="#0f766e"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Bukti Transfer'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Recipient summary box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Penerima Gaji:</span>
            <strong className="text-slate-900">{record.employeeName}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Rekening Tujuan:</span>
            <span className="font-mono text-slate-800">{record.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-semibold">Nominal Ditransfer:</span>
            <span className="font-mono font-bold text-base text-[#065f46]">
              {FORMAT_IDR(record.gajiBersih)}
            </span>
          </div>
        </div>

        {/* Upload proof image area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Unggah Foto / Screenshot Resi Transfer
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {proofUrl ? (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
              <div className="relative w-full h-52">
                <Image
                  src={proofUrl}
                  alt="Bukti Transfer Bank"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all cursor-pointer"
                title="Hapus foto resi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0f766e] flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Klik untuk unggah screenshot bukti transfer
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format PNG, JPG, atau WebP (Maks 5 MB)
              </p>
            </div>
          )}
        </div>

        {/* Reference / Note input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            No. Referensi / Catatan Transfer
          </label>
          <input
            type="text"
            value={refNote}
            onChange={(e) => setRefNote(e.target.value)}
            placeholder="Contoh: TRX-BCA-20261031-00452 a.n PT Bumi Raya"
            className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
      </form>
    </Modal>
  );
};
