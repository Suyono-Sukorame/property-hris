'use client';

import React, { useState } from 'react';
import { PropertySite } from '@/types/hris';
import { PageHeader } from '@/components/ui';
import { ProjectManagementModal } from '@/components/settings';
import {
  Building,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle,
  Sliders,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Archive,
} from 'lucide-react';

interface SettingsViewProps {
  sites: PropertySite[];
  employees: Array<{ id: string; name: string }>;
  onUpdateSiteRadius: (siteId: string, radius: number) => void;
  onAddProject: (project: Partial<PropertySite>) => void;
  onUpdateProject: (projectId: string, project: Partial<PropertySite>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sites,
  employees,
  onUpdateSiteRadius,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [siteRadii, setSiteRadii] = useState<{ [id: string]: number }>(() => {
    const init: { [id: string]: number } = {};
    sites.forEach((s) => {
      init[s.id] = s.geofenceRadiusMeters;
    });
    return init;
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Project Management Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PropertySite | null>(null);

  // Policy state
  const [toleranceMinutes, setToleranceMinutes] = useState(15);
  const [bpjsRate, setBpjsRate] = useState(3.0);
  const [k3BonusRate, setK3BonusRate] = useState(1500000);

  const handleRadiusChange = (id: string, val: number) => {
    setSiteRadii((prev) => ({ ...prev, [id]: val }));
    onUpdateSiteRadius(id, val);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: PropertySite) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (projectData: Partial<PropertySite>) => {
    if (editingProject) {
      onUpdateProject(editingProject.id, projectData);
    } else {
      onAddProject(projectData);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      onDeleteProject(projectId);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  const getStatusColor = (status: PropertySite['status']) => {
    switch (status) {
      case 'Konstruksi Aktif':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pemasaran Aktif':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Finishing & Handover':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Operasional Kantor':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Pengaturan Sistem & Proyek"
        subtitle="Konfigurasi radius geofence GPS proyek, toleransi jam kerja, dan parameter payroll."
        icon={<Building className="w-5 h-5 text-[#0f766e]" />}
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] font-mono text-[10px] font-bold border border-teal-200">
            {sites.length} Lokasi Terdaftar
          </span>
        }
      />

      {/* Save Success Notice */}
      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs shadow-xs animate-in fade-in duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Pengaturan proyek dan radius presensi berhasil disimpan.
          </span>
        </div>
      )}

      {/* Project Management Section - NEW */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0f766e]" />
              Kelola Proyek Properti
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tambah, edit, atau hapus data proyek properti yang terdaftar di sistem.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProject}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sites.map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3 text-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold">
                      {site.code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusColor(site.status)}`}>
                      {site.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{site.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{site.category}</p>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {site.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-lg font-extrabold text-[#065f46]">
                    {site.projectProgressPercentage}%
                  </div>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    Progress
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Site Manager:</span>
                  <p className="font-bold text-slate-900 truncate">{site.siteManager}</p>
                </div>
                <div>
                  <span className="text-slate-500">Workforce:</span>
                  <p className="font-bold text-slate-900">{site.activeWorkforce} Tim</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleEditProject(site)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(site.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {sites.length === 0 && (
          <div className="p-8 text-center">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Belum ada proyek terdaftar</p>
            <p className="text-xs text-slate-500 mt-1">
              Klik tombol "Tambah Proyek Baru" untuk mendaftarkan proyek pertama Anda.
            </p>
          </div>
        )}
      </div>

      {/* Geofence Perimeter Management */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0f766e]" />
              Pengaturan Lokasi & Radius Presensi
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Atur batas radius maksimal presensi karyawan dari titik koordinat GPS proyek.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sites.map((site) => {
            const currentRadius = siteRadii[site.id] ?? site.geofenceRadiusMeters;

            return (
              <div
                key={site.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold">
                      {site.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{site.name}</h4>
                    <p className="text-[11px] text-slate-500">{site.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-base font-extrabold text-[#065f46]">
                      {currentRadius}m
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      Batas Radius
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <input
                    type="range"
                    min="50"
                    max="400"
                    step="25"
                    value={currentRadius}
                    onChange={(e) => handleRadiusChange(site.id, Number(e.target.value))}
                    className="w-full accent-[#0f766e] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50m (Ketat)</span>
                    <span>200m (Standar)</span>
                    <span>400m (Zona Luas)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shifts & Policy Regulations */}
      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-xs">
        {/* Working Shifts */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0f766e]" />
              Jadwal Shift Kerja
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jadwal operasional validasi jam masuk & keterlambatan presensi.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Shift Lapangan (Konstruksi)</span>
                <span className="text-[11px] text-slate-500">Pekerjaan struktur, pembesian, bekisting</span>
              </div>
              <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                07:00 - 16:00 WITA
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Shift Kantor & Direksi</span>
                <span className="text-[11px] text-slate-500">Legal, perizinan, administrasi, HR</span>
              </div>
              <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                08:30 - 17:30 WITA
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Shift Pengecoran (Malam)</span>
                <span className="text-[11px] text-slate-500">Khusus cor beton ready-mix & pompa</span>
              </div>
              <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                19:00 - 04:00 WITA
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
              Toleransi Keterlambatan (Menit)
            </label>
            <input
              type="number"
              value={toleranceMinutes}
              onChange={(e) => setToleranceMinutes(Number(e.target.value))}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
        </div>

        {/* Allowances & K3 Rates */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0f766e]" />
                Parameter Payroll & BPJS
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pengaturan parameter perhitungan penggajian karyawan.
              </p>
            </div>

            <div className="space-y-3.5 mt-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                  Potongan BPJS Ketenagakerjaan (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bpjsRate}
                  onChange={(e) => setBpjsRate(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                  Tunjangan Sertifikat AK3 Konstruksi (IDR)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={k3BonusRate}
                  onChange={(e) => setK3BonusRate(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-800">
                Pembaruan parameter akan otomatis dihitung pada siklus payroll periode berikutnya.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Project Management Modal */}
      {isProjectModalOpen && (
        <ProjectManagementModal
          key={editingProject?.id ?? 'new'}
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          project={editingProject}
          employees={employees}
          existingSites={sites}
        />
      )}
    </div>
  );
};
