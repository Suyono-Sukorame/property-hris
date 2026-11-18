'use client';

import React, { useState } from 'react';
import { PropertySite } from '@/types/hris';
import { X, Save, MapPin, Building2, Users, Sparkles } from 'lucide-react';
import { generateProjectCode, getCategoryCode } from '@/utils/projectCodeGenerator';

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<PropertySite>) => void;
  project?: PropertySite | null;
  employees: Array<{ id: string; name: string }>;
  existingSites: PropertySite[];
}

const PROJECT_CATEGORIES = [
  'Perumahan',
  'Ruko / Komersial',
  'Tanah Kavling',
  'Kantor',
  'Mixed-Use Residential',
  'High-Rise Commercial',
  'Township Masterplan',
  'Corporate Head Office',
] as const;

const PROJECT_STATUS = [
  'Pemasaran Aktif',
  'Konstruksi Aktif',
  'Finishing & Handover',
  'Operasional Kantor',
] as const;

export const ProjectManagementModal: React.FC<ProjectManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  employees,
  existingSites,
}) => {
  const [formData, setFormData] = useState<Partial<PropertySite>>(() =>
    project
      ? { ...project }
      : {
          name: '',
          code: generateProjectCode('Perumahan', existingSites),
          category: 'Perumahan',
          location: '',
          latitude: -3.32,
          longitude: 114.59,
          geofenceRadiusMeters: 200,
          activeWorkforce: 0,
          siteManager: '',
          projectProgressPercentage: 0,
          status: 'Pemasaran Aktif',
        }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (
    field: keyof PropertySite,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-regenerate code when category changes (only for new project)
    if (field === 'category' && !project) {
      const newCode = generateProjectCode(value as string, existingSites);
      setFormData((prev) => ({ ...prev, code: newCode }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f766e] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                {project ? 'Edit Proyek Properti' : 'Tambah Proyek Baru'}
              </h2>
              <p className="text-xs text-slate-600">
                {project ? 'Perbarui informasi proyek yang sudah ada' : 'Daftarkan proyek properti baru ke sistem'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/80 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0f766e]" />
              Informasi Dasar Proyek
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nama Proyek *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Contoh: Griya Bumi Raya Residence"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kode Proyek {!project && <span className="text-emerald-600">● Auto-Generated</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    readOnly={!project}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="GBR-XXX-01"
                    className={`w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] ${
                      !project ? 'bg-emerald-50/50 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                  {!project && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>
                {!project && (
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Format: GBR-{getCategoryCode(formData.category || 'Perumahan')}-XX (otomatis berdasarkan kategori)
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Kategori Proyek *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Status Proyek *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                >
                  {PROJECT_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0f766e]" />
              Lokasi & Koordinat GPS
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Alamat Lokasi *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Jl. Ahmad Yani Km 8, Landasan Ulin"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', Number(e.target.value))}
                  placeholder="-3.320000"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', Number(e.target.value))}
                  placeholder="114.590000"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Radius (m) *
                </label>
                <input
                  type="number"
                  step="25"
                  min="50"
                  max="500"
                  required
                  value={formData.geofenceRadiusMeters}
                  onChange={(e) => handleChange('geofenceRadiusMeters', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                />
              </div>
            </div>
          </div>

          {/* Team & Progress Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f766e]" />
              Tim & Progress Proyek
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Site Manager *
                </label>
                <select
                  required
                  value={formData.siteManager}
                  onChange={(e) => handleChange('siteManager', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                >
                  <option value="">Pilih Site Manager</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Target Workforce
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activeWorkforce}
                  onChange={(e) => handleChange('activeWorkforce', Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Progress Proyek: {formData.projectProgressPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.projectProgressPercentage}
                onChange={(e) => handleChange('projectProgressPercentage', Number(e.target.value))}
                className="w-full accent-[#0f766e] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0% (Mulai)</span>
                <span>50% (Setengah Jalan)</span>
                <span>100% (Selesai)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Catatan:</strong> Field bertanda (*) wajib diisi. Koordinat GPS dapat diperoleh dari Google Maps.
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-300 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{project ? 'Simpan Perubahan' : 'Tambah Proyek'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
