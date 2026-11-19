'use client';

import React, { useState, useEffect } from 'react';
import { PropertySite, SystemSettings } from '@/types/hris';
import { DEFAULT_SYSTEM_SETTINGS } from '@/data/mockData';
import { PageHeader, SectionCard, Input, Button } from '@/components/ui';
import { ProjectManagementModal } from '@/components/settings';
import {
  Building,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  sites: PropertySite[];
  employees: Array<{ id: string; name: string }>;
  systemSettings?: SystemSettings;
  onSaveSettings?: (settings: SystemSettings) => Promise<void> | void;
  onUpdateSiteRadius: (siteId: string, radius: number) => void;
  onAddProject: (project: Partial<PropertySite>) => void;
  onUpdateProject: (projectId: string, project: Partial<PropertySite>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sites,
  employees,
  systemSettings = DEFAULT_SYSTEM_SETTINGS,
  onSaveSettings,
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

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Project Management Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PropertySite | null>(null);

  // Policy & Payroll Parameters State (Synced with systemSettings prop)
  const [toleranceMinutes, setToleranceMinutes] = useState(systemSettings.toleranceMinutes);
  const [lateDeductionPerMinute, setLateDeductionPerMinute] = useState(systemSettings.lateDeductionPerMinute);
  const [bpjsRate, setBpjsRate] = useState(systemSettings.bpjsRate);
  const [k3BonusRate, setK3BonusRate] = useState(systemSettings.k3BonusRate);
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState(systemSettings.overtimeRatePerHour);

  useEffect(() => {
    if (systemSettings) {
      setToleranceMinutes(systemSettings.toleranceMinutes);
      setLateDeductionPerMinute(systemSettings.lateDeductionPerMinute);
      setBpjsRate(systemSettings.bpjsRate);
      setK3BonusRate(systemSettings.k3BonusRate);
      setOvertimeRatePerHour(systemSettings.overtimeRatePerHour);
    }
  }, [systemSettings]);

  const handleRadiusChange = (id: string, val: number) => {
    setSiteRadii((prev) => ({ ...prev, [id]: val }));
    onUpdateSiteRadius(id, val);
  };

  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemSettings = {
      toleranceMinutes: Number(toleranceMinutes) || 0,
      lateDeductionPerMinute: Number(lateDeductionPerMinute) || 0,
      bpjsRate: Number(bpjsRate) || 0,
      k3BonusRate: Number(k3BonusRate) || 0,
      overtimeRatePerHour: Number(overtimeRatePerHour) || 0,
      updatedAt: new Date().toISOString(),
    };

    if (onSaveSettings) {
      await onSaveSettings(updated);
    }

    setSavedNotice('Seluruh parameter shift, toleransi, dan formula payroll berhasil disimpan permanen!');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua parameter ke standar default developer properti?')) {
      setToleranceMinutes(DEFAULT_SYSTEM_SETTINGS.toleranceMinutes);
      setLateDeductionPerMinute(DEFAULT_SYSTEM_SETTINGS.lateDeductionPerMinute);
      setBpjsRate(DEFAULT_SYSTEM_SETTINGS.bpjsRate);
      setK3BonusRate(DEFAULT_SYSTEM_SETTINGS.k3BonusRate);
      setOvertimeRatePerHour(DEFAULT_SYSTEM_SETTINGS.overtimeRatePerHour);

      if (onSaveSettings) {
        onSaveSettings(DEFAULT_SYSTEM_SETTINGS);
      }

      setSavedNotice('Parameter sistem telah dikembalikan ke standar default dan disimpan!');
      setTimeout(() => setSavedNotice(null), 4000);
    }
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
    setSavedNotice('Data proyek berhasil diperbarui.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      onDeleteProject(projectId);
      setSavedNotice('Proyek berhasil dihapus.');
      setTimeout(() => setSavedNotice(null), 3000);
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
      {/* 1. Page Header */}
      <PageHeader
        title="Pengaturan Sistem & Proyek"
        subtitle="Konfigurasi radius geofence GPS proyek, shift kerja, toleransi absensi, dan parameter payroll permanen."
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
          <span className="font-bold">{savedNotice}</span>
        </div>
      )}

      {/* 2. Project Management Section */}
      <SectionCard
        title="Kelola Proyek Properti"
        subtitle="Tambah, edit, atau hapus data proyek properti yang terdaftar di sistem."
        icon={<Building className="w-4 h-4 text-[#0f766e]" />}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddProject}
            icon={<Plus className="w-4 h-4" />}
            className="rounded-xl font-bold"
          >
            Tambah Proyek Baru
          </Button>
        }
      >
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditProject(site)}
                  icon={<Edit2 className="w-3 h-3 text-blue-600" />}
                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 rounded-lg text-[11px]"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteProject(site.id)}
                  icon={<Trash2 className="w-3 h-3 text-rose-600" />}
                  className="rounded-lg text-[11px]"
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>

        {sites.length === 0 && (
          <div className="p-8 text-center">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Belum ada proyek terdaftar</p>
            <p className="text-xs text-slate-500 mt-1">
              Klik tombol &quot;Tambah Proyek Baru&quot; untuk mendaftarkan proyek pertama Anda.
            </p>
          </div>
        )}
      </SectionCard>

      {/* 3. Geofence Perimeter Management */}
      <SectionCard
        title="Pengaturan Lokasi & Radius Presensi"
        subtitle="Atur batas radius maksimal presensi karyawan dari titik koordinat GPS proyek."
        icon={<MapPin className="w-4 h-4 text-[#0f766e]" />}
      >
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
                    max="500"
                    step="25"
                    value={currentRadius}
                    onChange={(e) => handleRadiusChange(site.id, Number(e.target.value))}
                    className="w-full accent-[#0f766e] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50m (Ketat)</span>
                    <span>200m (Standar)</span>
                    <span>500m (Zona Luas)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 4. Shift, Toleransi, dan Parameter Payroll Form */}
      <form onSubmit={handleSaveParameters} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-xs">
          {/* Working Shifts & Tolerance */}
          <SectionCard
            title="Jadwal Shift Kerja & Toleransi"
            subtitle="Jadwal operasional validasi jam masuk dan batas toleransi keterlambatan presensi."
            icon={<Clock className="w-4 h-4 text-[#0f766e]" />}
            badge={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <Sparkles className="w-3 h-3" />
                Aktif
              </span>
            }
          >
            <div className="space-y-2.5 mb-4">
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Shift Lapangan (Konstruksi)</span>
                  <span className="text-[11px] text-slate-500">Pekerjaan struktur, tukang, kenek, mandor</span>
                </div>
                <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  07:00 - 16:00 WITA
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Shift Kantor & Direksi</span>
                  <span className="text-[11px] text-slate-500">Legal, perizinan, administrasi, keuangan, HR</span>
                </div>
                <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  08:30 - 17:30 WITA
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Shift Pengecoran (Malam)</span>
                  <span className="text-[11px] text-slate-500">Khusus cor beton ready-mix & pompa proyek</span>
                </div>
                <span className="self-start sm:self-auto font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  19:00 - 04:00 WITA
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3.5">
              <Input
                label="Toleransi Keterlambatan"
                type="number"
                min={0}
                max={120}
                suffix="Menit"
                value={toleranceMinutes}
                onChange={(e) => setToleranceMinutes(Number(e.target.value))}
                hint="Karyawan yang presensi dalam rentang toleransi ini tidak dihitung terlambat."
              />

              <Input
                label="Tarif Denda Telat (per menit)"
                type="number"
                min={0}
                step={500}
                prefix="Rp"
                suffix="/ menit"
                value={lateDeductionPerMinute}
                onChange={(e) => setLateDeductionPerMinute(Number(e.target.value))}
                hint="Dikalikan otomatis dengan total menit keterlambatan pada slip gaji."
              />
            </div>
          </SectionCard>

          {/* Parameter Payroll & BPJS */}
          <SectionCard
            title="Parameter Payroll & Tunjangan"
            subtitle="Konfigurasi potongan BPJS, tunjangan AK3, dan upah lembur per jam yang tersimpan permanen."
            icon={<Shield className="w-4 h-4 text-[#0f766e]" />}
            badge={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-[#0f766e] border border-teal-200 text-[10px] font-semibold">
                Tersimpan Permanen
              </span>
            }
          >
            <div className="space-y-3.5">
              <Input
                label="Potongan BPJS Ketenagakerjaan"
                type="number"
                min={0}
                max={20}
                step={0.1}
                suffix="%"
                value={bpjsRate}
                onChange={(e) => setBpjsRate(Number(e.target.value))}
                hint="Persentase potongan iuran BPJS TK dari gaji pokok karyawan tetap."
              />

              <Input
                label="Tunjangan Sertifikat AK3 Konstruksi"
                type="number"
                min={0}
                step={50000}
                prefix="Rp"
                value={k3BonusRate}
                onChange={(e) => setK3BonusRate(Number(e.target.value))}
                hint="Diberikan khusus untuk personel lapangan yang memiliki sertifikat K3 aktif."
              />

              <Input
                label="Tarif Upah Lembur Konstruksi"
                type="number"
                min={0}
                step={5000}
                prefix="Rp"
                suffix="/ jam"
                value={overtimeRatePerHour}
                onChange={(e) => setOvertimeRatePerHour(Number(e.target.value))}
                hint="Dasar perhitungan upah lembur lembur cor malam / hari libur proyek."
              />

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Penyimpanan Permanen Aktif
                </p>
                <p className="text-[10px] text-emerald-700 leading-relaxed">
                  Perubahan akan langsung tersimpan di sistem dan diaplikasikan pada perhitungan absensi dan siklus payroll berikutnya.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Global Save / Reset Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Terakhir diperbarui:{' '}
            <span className="font-mono font-semibold text-slate-700">
              {systemSettings.updatedAt
                ? new Date(systemSettings.updatedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Standar Default'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleResetDefaults}
              icon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
              className="rounded-xl text-xs w-full sm:w-auto"
            >
              Reset Default
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold w-full sm:w-auto"
            >
              Simpan Perubahan Permanen
            </Button>
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
