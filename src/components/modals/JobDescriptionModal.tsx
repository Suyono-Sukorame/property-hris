'use client';

import React, { useState, useEffect } from 'react';
import { JobDescription } from '@/types/jobdesc';
import { X, UserPlus, Pencil, Trash2, Plus, X as XIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface JobDescriptionFormData {
  jobCode: string;
  title: string;
  division: string;
  level: 'Direksi / Eksekutif' | 'Manajemen Proyek' | 'Spesialis Ahli' | 'Teknis & Lapangan';
  reportsTo: string;
  purpose: string;
  responsibilities: { category: string; items: string[] }[];
  authorities: string[];
  kpiTargets: { metric: string; target: string; weight: number; frequency: string }[];
  qualifications: {
    education: string;
    experience: string;
    certifications: string[];
  };
}

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialData?: JobDescription | null;
  onSubmit: (data: JobDescriptionFormData) => void;
  onDelete?: (jobCode: string) => void;
  existingJobCodes?: string[];
  isLoading?: boolean;
}

export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  mode = 'add',
  initialData,
  onSubmit,
  onDelete,
  existingJobCodes = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<JobDescriptionFormData>({
    jobCode: '',
    title: '',
    division: 'Pemasaran & Penjualan',
    level: 'Spesialis Ahli',
    reportsTo: '-',
    purpose: '',
    responsibilities: [],
    authorities: [],
    kpiTargets: [],
    qualifications: {
      education: '',
      experience: '',
      certifications: [],
    },
  });

  const [expandedResponsibility, setExpandedResponsibility] = useState<number | null>(null);
  const [expandedKPI, setExpandedKPI] = useState<number | null>(null);

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        jobCode: initialData.jobCode,
        title: initialData.title,
        division: initialData.division,
        level: initialData.level,
        reportsTo: initialData.reportsTo,
        purpose: initialData.purpose,
        responsibilities: initialData.responsibilities,
        authorities: initialData.authorities,
        kpiTargets: initialData.kpiTargets,
        qualifications: initialData.qualifications,
      });
    } else {
      setFormData({
        jobCode: '',
        title: '',
        division: 'Pemasaran & Penjualan',
        level: 'Spesialis Ahli',
        reportsTo: '-',
        purpose: '',
        responsibilities: [],
        authorities: [],
        kpiTargets: [],
        qualifications: {
          education: '',
          experience: '',
          certifications: [],
        },
      });
    }
  }, [initialData, isOpen, mode]);

  const handleAddResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, { category: '', items: [] }],
    }));
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateResponsibility = (index: number, field: 'category' | 'items', value: any) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => {
        if (i === index) {
          return field === 'category' 
            ? { ...resp, category: value }
            : { ...resp, items: value };
        }
        return resp;
      }),
    }));
  };

  const handleAddResponsibilityItem = (respIndex: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => {
        if (i === respIndex) {
          return { ...resp, items: [...resp.items, ''] };
        }
        return resp;
      }),
    }));
  };

  const handleRemoveResponsibilityItem = (respIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => {
        if (i === respIndex) {
          return { ...resp, items: resp.items.filter((_, j) => j !== itemIndex) };
        }
        return resp;
      }),
    }));
  };

  const handleUpdateResponsibilityItem = (respIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => {
        if (i === respIndex) {
          return {
            ...resp,
            items: resp.items.map((item, j) => j === itemIndex ? value : item),
          };
        }
        return resp;
      }),
    }));
  };

  const handleAddAuthority = () => {
    setFormData(prev => ({
      ...prev,
      authorities: [...prev.authorities, ''],
    }));
  };

  const handleRemoveAuthority = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authorities: prev.authorities.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAuthority = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      authorities: prev.authorities.map((auth, i) => i === index ? value : auth),
    }));
  };

  const handleAddKPI = () => {
    setFormData(prev => ({
      ...prev,
      kpiTargets: [...prev.kpiTargets, { metric: '', target: '', weight: 0, frequency: 'Bulanan' }],
    }));
  };

  const handleRemoveKPI = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kpiTargets: prev.kpiTargets.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateKPI = (index: number, field: keyof typeof formData.kpiTargets[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      kpiTargets: prev.kpiTargets.map((kpi, i) => {
        if (i === index) {
          return { ...kpi, [field]: value };
        }
        return kpi;
      }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobCode.trim() || !formData.title.trim()) {
      alert('Job Code dan Title wajib diisi');
      return;
    }

    onSubmit(formData);
  };

  const totalResponsibilities = formData.responsibilities.reduce((sum, r) => sum + r.items.length, 0);
  const totalKPIs = formData.kpiTargets.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Tambah Jobdesk Baru' : 'Edit Jobdesk'}
      subtitle={
        mode === 'add' ? 'Definisi jabatan baru & standar tanggung jawab' : 'Koreksi definisi jabatan yang ada'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Job Code & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Job Code *
            </label>
            <input
              type="text"
              value={formData.jobCode}
              onChange={(e) => setFormData(prev => ({ ...prev, jobCode: e.target.value.toUpperCase() }))}
              placeholder="Contoh: TKG-COR-001"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              required
            />
            {existingJobCodes.includes(formData.jobCode) && mode === 'edit' && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ Job code ini sudah ada untuk jabatan lain
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Title / Posisi *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Tukang Cor"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              required
            />
          </div>
        </div>

        {/* Division & Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Divisi
            </label>
            <select
              value={formData.division}
              onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            >
              <option value="Manajemen">Manajemen</option>
              <option value="Administrasi & Keuangan">Administrasi & Keuangan</option>
              <option value="Pemasaran & Penjualan">Pemasaran & Penjualan</option>
              <option value="Teknis Lapangan">Teknis Lapangan</option>
              <option value="Keamanan & Kebersihan">Keamanan & Kebersihan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            >
              <option value="Direksi / Eksekutif">Direksi / Eksekutif</option>
              <option value="Manajemen Proyek">Manajemen Proyek</option>
              <option value="Spesialis Ahli">Spesialis Ahli</option>
              <option value="Teknis & Lapangan">Teknis & Lapangan</option>
            </select>
          </div>
        </div>

        {/* Reports To */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
            Atasan Langsung
          </label>
          <input
            type="text"
            value={formData.reportsTo}
            onChange={(e) => setFormData(prev => ({ ...prev, reportsTo: e.target.value }))}
            placeholder="Contoh: Direktur Utama"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
            Tujuan Jabatan *
          </label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder="Deskripsikan tujuan dan tanggung jawab utama jabatan ini"
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] resize-none"
            required
          />
        </div>

        {/* Responsibilities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
              Tugas Pokok & Tanggung Jawab
            </label>
            <span className="text-[10px] text-slate-500">
              {totalResponsibilities} item tanggung jawab
            </span>
          </div>

          {formData.responsibilities.map((resp, respIndex) => (
            <div key={respIndex} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <input
                  type="text"
                  value={resp.category}
                  onChange={(e) => handleUpdateResponsibility(respIndex, 'category', e.target.value)}
                  placeholder={`Kategori ${respIndex + 1} (Contoh: Pengawasan Konstruksi)`}
                  className="flex-1 h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] mr-2"
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(respIndex)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus kategori"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {resp.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateResponsibilityItem(respIndex, itemIndex, e.target.value)}
                      placeholder={`Item tanggung jawab ${itemIndex + 1}`}
                      className="flex-1 h-8 px-2 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                    />
                    {resp.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibilityItem(respIndex, itemIndex)}
                        className="p-1 text-rose-400 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus item"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddResponsibilityItem(respIndex)}
                className="mt-2 px-3 py-1 text-xs font-medium text-[#0f766e] hover:bg-[#0f766e]/10 rounded transition-colors"
              >
                <Plus className="inline w-3 h-3 mr-1" />
                Tambah Item Tanggung Jawab
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddResponsibility}
            className="w-full py-2 text-xs font-semibold text-[#0f766e] border border-[#0f766e] border-dashed rounded-lg hover:bg-[#0f766e]/5 transition-colors"
          >
            <Plus className="inline w-3 h-3 mr-1" />
            Tambah Kategori Tugas Baru
          </button>
        </div>

        {/* Authorities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
              Wewenang & Otorisasi
            </label>
            <span className="text-[10px] text-slate-500">{formData.authorities.length} wewenang</span>
          </div>

          {formData.authorities.map((auth, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <span className="text-amber-600 text-xs">🔒</span>
              <input
                type="text"
                value={auth}
                onChange={(e) => handleUpdateAuthority(index, e.target.value)}
                placeholder={`Wewenang ${index + 1} (Contoh: Otorisasi pengeluaran hingga Rp 5 juta)`}
                className="flex-1 h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
              {formData.authorities.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAuthority(index)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddAuthority}
            className="w-full py-2 text-xs font-semibold text-[#0f766e] border border-[#0f766e] border-dashed rounded-lg hover:bg-[#0f766e]/5 transition-colors"
          >
            <Plus className="inline w-3 h-3 mr-1" />
            Tambah Wewenang Baru
          </button>
        </div>

        {/* KPI Targets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
              Target KPI
            </label>
            <span className="text-[10px] text-slate-500">{totalKPIs} target KPI</span>
          </div>

          {formData.kpiTargets.map((kpi, index) => (
            <div key={index} className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={kpi.metric}
                    onChange={(e) => handleUpdateKPI(index, 'metric', e.target.value)}
                    placeholder="Metrik KPI (Contoh: Unit Terjual)"
                    className="w-full h-9 px-3 bg-white border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={kpi.target}
                    onChange={(e) => handleUpdateKPI(index, 'target', e.target.value)}
                    placeholder="Target (Contoh: ≥ 5 unit)"
                    className="w-full h-9 px-3 bg-white border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={kpi.weight}
                    onChange={(e) => handleUpdateKPI(index, 'weight', Number(e.target.value))}
                    placeholder="Bobot (%)"
                    className="w-full h-9 px-3 bg-white border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={kpi.frequency}
                    onChange={(e) => handleUpdateKPI(index, 'frequency', e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Triwulan">Triwulan</option>
                    <option value="Semester">Semester</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
              </div>

              {formData.kpiTargets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveKPI(index)}
                  className="text-xs text-rose-600 hover:text-rose-800"
                >
                  Hapus KPI ini
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddKPI}
            className="w-full py-2 text-xs font-semibold text-[#0f766e] border border-[#0f766e] border-dashed rounded-lg hover:bg-[#0f766e]/5 transition-colors"
          >
            <Plus className="inline w-3 h-3 mr-1" />
            Tambah Target KPI Baru
          </button>
        </div>

        {/* Qualifications */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
            Kualifikasi & Persyaratan
          </label>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pendidikan Minimal</label>
            <input
              type="text"
              value={formData.qualifications.education}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                qualifications: { ...prev.qualifications, education: e.target.value }
              }))}
              placeholder="Contoh: SMA / S1 Ekonomi"
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Pengalaman Kerja
            </label>
            <input
              type="text"
              value={formData.qualifications.experience}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                qualifications: { ...prev.qualifications, experience: e.target.value }
              }))}
              placeholder="Contoh: 2+ tahun di bidang properti"
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Sertifikasi Wajib (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={formData.qualifications.certifications.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                qualifications: {
                  ...prev.qualifications,
                  certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }
              }))}
              placeholder="Contoh: Sertifikat AK3 Umum, K3 Konstruksi"
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                if (window.confirm('Yakin ingin menghapus jobdesk ini?')) {
                  onDelete(formData.jobCode);
                }
              }}
            >
              Hapus Jobdesk
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={mode === 'add' ? <UserPlus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              loading={isLoading}
              disabled={isLoading}
            >
              {mode === 'add' ? 'Simpan Jobdesk' : 'Perbarui Jobdesk'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
