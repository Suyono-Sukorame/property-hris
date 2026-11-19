'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Employee, EmployeeDocument, EmployeeDocumentCategory } from '@/types/hris';
import { Modal } from '@/components/ui';
import { optimizeDocumentToWebP, formatFileSize } from '@/utils/documentOptimizer';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Trash2,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  Plus,
  FileCheck,
} from 'lucide-react';

interface DocumentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdateDocuments: (employeeId: string, updatedDocs: EmployeeDocument[]) => Promise<void> | void;
  canEdit?: boolean;
}

const CATEGORY_LABELS: Record<EmployeeDocumentCategory, { label: string; color: string }> = {
  KTP: { label: 'KTP Personil', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  KONTRAK_KERJA: { label: 'Kontrak Kerja (PKWT/PKWTT)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SERTIFIKAT_K3: { label: 'Sertifikat Lisensi K3', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  IJAZAH: { label: 'Ijazah / Pendidikan', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  NPWP: { label: 'NPWP Pajak', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  LAINNYA: { label: 'Dokumen Lainnya', color: 'bg-teal-50 text-[#0f766e] border-teal-200' },
};

export const DocumentDossierModal: React.FC<DocumentDossierModalProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdateDocuments,
  canEdit = true,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'UPLOAD'>('LIST');
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);

  // Upload Form State
  const [docCategory, setDocCategory] = useState<EmployeeDocumentCategory>('KTP');
  const [docTitle, setDocTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [docNotes, setDocNotes] = useState('');

  // WebP Optimization State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<{
    dataUrl: string;
    originalSizeBytes: number;
    optimizedSizeBytes: number;
    reductionPercentage: number;
    fileName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!employee) return null;

  const documents = employee.documents || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsOptimizing(true);
    try {
      const cleanTargetName = `${employee.nik}_${docCategory.toLowerCase()}_${Date.now()}`;
      const res = await optimizeDocumentToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
        targetFileName: cleanTargetName,
      });

      setOptimizedResult({
        dataUrl: res.dataUrl,
        originalSizeBytes: res.originalSizeBytes,
        optimizedSizeBytes: res.optimizedSizeBytes,
        reductionPercentage: res.reductionPercentage,
        fileName: res.fileName,
      });

      if (!docTitle) {
        setDocTitle(
          docCategory === 'KTP'
            ? `KTP - ${employee.name}`
            : docCategory === 'KONTRAK_KERJA'
              ? `Kontrak Kerja ${employee.contractType} - ${employee.name}`
              : docCategory === 'SERTIFIKAT_K3'
                ? `Sertifikat K3 Konstruksi - ${employee.name}`
                : file.name.replace(/\.[^/.]+$/, '')
        );
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengonversi dokumen ke format WebP.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optimizedResult) {
      setErrorMsg('Silakan pilih file gambar dokumen yang akan diunggah.');
      return;
    }

    setIsSaving(true);
    try {
      const newDoc: EmployeeDocument = {
        id: `DOC-${Date.now()}`,
        category: docCategory,
        title: docTitle.trim() || `${docCategory} ${employee.name}`,
        fileUrl: optimizedResult.dataUrl,
        fileName: optimizedResult.fileName,
        fileSizeBytes: optimizedResult.optimizedSizeBytes,
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        expiryDate: expiryDate || undefined,
        notes: docNotes.trim() || undefined,
      };

      const updatedList = [newDoc, ...documents];
      await onUpdateDocuments(employee.id, updatedList);

      // Reset
      setOptimizedResult(null);
      setDocTitle('');
      setExpiryDate('');
      setDocNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('LIST');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan dokumen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    const updatedList = documents.filter((d) => d.id !== docId);
    await onUpdateDocuments(employee.id, updatedList);
    if (previewDoc?.id === docId) setPreviewDoc(null);
  };

  const handleDownload = (doc: EmployeeDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName || `${doc.title}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Berkas & Dokumen Digital Personil"
      subtitle={`${employee.name} · NIK: ${employee.nik} · ${employee.title}`}
      maxWidth="xl"
      headerColor="#0f766e"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500">
            Total {documents.length} berkas tersimpan (Format Terkompresi WebP)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'LIST'
                  ? 'bg-teal-50 text-[#0f766e] border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Daftar Berkas ({documents.length})</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => setActiveTab('UPLOAD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'UPLOAD'
                    ? 'bg-teal-50 text-[#0f766e] border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unggah Dokumen Baru</span>
              </button>
            )}
          </div>

          <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Auto-WebP HD
          </span>
        </div>

        {/* =========================================================================
            TAB 1: DAFTAR DOKUMEN
            ========================================================================= */}
        {activeTab === 'LIST' && (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-xs sm:text-sm">
                  Belum ada dokumen yang dilampirkan
                </h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                  Scan KTP, Kontrak PKWT, atau Sertifikat K3 dapat diunggah dengan kompresi otomatis WebP agar
                  penyimpanan ringan dan dokumen tetap tajam.
                </p>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('UPLOAD')}
                    className="mt-3.5 px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Berkas Sekarang</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const cat = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.LAINNYA;
                  const isExpiringSoon =
                    doc.expiryDate &&
                    new Date(doc.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={doc.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-500/50 transition-all flex flex-col justify-between shadow-2xs gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-block mb-1 ${cat.color}`}
                          >
                            {cat.label}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs truncate" title={doc.title}>
                            {doc.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {formatFileSize(doc.fileSizeBytes)} · WebP HD
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50 cursor-pointer hover:opacity-80 transition-opacity"
                          title="Klik untuk pratinjau dokumen"
                        >
                          <Image
                            src={doc.fileUrl}
                            alt={doc.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>

                      {/* Expiry Warning if available */}
                      {doc.expiryDate && (
                        <div
                          className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium ${
                            isExpiringSoon
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Berlaku s/d: {doc.expiryDate}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[10px] text-slate-400">Tgl: {doc.uploadedAt}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="p-1 text-[#0f766e] hover:bg-teal-50 rounded transition-colors cursor-pointer"
                            title="Unduh Format WebP"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Hapus Dokumen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: FORM UNGGAH & KONVERSI WEBP CERDAS
            ========================================================================= */}
        {activeTab === 'UPLOAD' && (
          <form onSubmit={handleSaveDocument} className="space-y-4">
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-[#0f766e]" />
                <span>Teknologi Kompresi Cerdas WebP HD</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Scan KTP, lembar SPK, atau lisensi K3 otomatis dikonversi ke format WebP resolusi tinggi.
                Ukuran file berkurang drastis hingga 85-95% namun tulisan dan angka NIK tetap tajam terbaca.
              </p>
            </div>

            {/* Category and Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Berkas</label>
                <select
                  value={docCategory}
                  onChange={(e) => {
                    const cat = e.target.value as EmployeeDocumentCategory;
                    setDocCategory(cat);
                    if (!docTitle) {
                      setDocTitle(
                        cat === 'KTP'
                          ? `KTP - ${employee.name}`
                          : cat === 'KONTRAK_KERJA'
                            ? `Kontrak Kerja ${employee.contractType}`
                            : cat === 'SERTIFIKAT_K3'
                              ? `Sertifikat K3 Konstruksi`
                              : ''
                      );
                    }
                  }}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                >
                  <option value="KTP">KTP Personil</option>
                  <option value="KONTRAK_KERJA">Kontrak Kerja (PKWT/PKWTT)</option>
                  <option value="SERTIFIKAT_K3">Sertifikat Lisensi K3 Konstruksi</option>
                  <option value="IJAZAH">Ijazah / Surat Pengalaman Kerja</option>
                  <option value="NPWP">NPWP Pajak</option>
                  <option value="LAINNYA">Dokumen Tambahan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul / Nama Dokumen
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Contoh: KTP Asli Navyzar"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {/* Upload Drag & Drop Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Foto / Scan Dokumen (JPG, PNG, atau WebP)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {optimizedResult ? (
                <div className="p-3 bg-white border border-teal-500/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Konversi WebP Berhasil!
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#0f766e] hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>

                  {/* Optimization Badge & Comparison */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-teal-50/50 border border-teal-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ukuran Asli</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {formatFileSize(optimizedResult.originalSizeBytes)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block">Ukuran WebP HD</span>
                      <span className="font-mono text-emerald-800 font-bold">
                        {formatFileSize(optimizedResult.optimizedSizeBytes)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#0f766e] font-bold block">Hemat Ruang</span>
                      <span className="font-mono text-emerald-600 font-extrabold">
                        {optimizedResult.reductionPercentage}% 🎉
                      </span>
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                    <Image
                      src={optimizedResult.dataUrl}
                      alt="Pratinjau WebP"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isOptimizing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0f766e] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {isOptimizing
                      ? 'Sedang mengonversi dan mengompres ke WebP HD...'
                      : 'Klik untuk pilih scan dokumen (JPG / PNG)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Otomatis dikonversi ke WebP ukuran super ringan tanpa buram
                  </p>
                </div>
              )}
            </div>

            {/* Optional Fields: Expiry Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masa Berlaku (Opsional untuk Kontrak / K3)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Dokumen (Opsional)
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Contoh: No Sertifikat K3: K3/1029/XI/2026"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Kembali ke Daftar
              </button>
              <button
                type="submit"
                disabled={!optimizedResult || isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Berkas WebP'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Pratinjau Dokumen High-Res */}
        {previewDoc && (
          <div
            className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{previewDoc.title}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Format: WebP HD · {formatFileSize(previewDoc.fileSizeBytes)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    className="p-1.5 text-[#0f766e] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="Unduh"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="relative w-full h-[60vh] bg-slate-950 rounded-xl overflow-hidden">
                <Image
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
