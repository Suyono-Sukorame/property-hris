'use client';

import React, { useState } from 'react';
import { PropertySite } from '@/types/hris';
import {
  Building,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface SettingsViewProps {
  sites: PropertySite[];
  onUpdateSiteRadius: (siteId: string, radius: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sites,
  onUpdateSiteRadius,
}) => {
  const [siteRadii, setSiteRadii] = useState<{ [id: string]: number }>(() => {
    const init: { [id: string]: number } = {};
    sites.forEach((s) => {
      init[s.id] = s.geofenceRadiusMeters;
    });
    return init;
  });

  const [savedNotice, setSavedNotice] = useState(false);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Save Success Notice */}
      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs shadow-xs animate-in fade-in duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Pengaturan proyek dan radius presensi berhasil disimpan.
          </span>
        </div>
      )}

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
    </div>
  );
};
