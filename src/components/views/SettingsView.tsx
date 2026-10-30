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
    <div className="space-y-6">
      {/* Save Success Notice */}
      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">
            Pengaturan proyek dan radius presensi berhasil disimpan.
          </span>
        </div>
      )}

      {/* Geofence Perimeter Management */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0f766e]" />
              Pengaturan Lokasi & Radius Presensi Proyek
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur batas radius maksimal presensi karyawan dari titik tengah proyek.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => {
            const currentRadius = siteRadii[site.id] ?? site.geofenceRadiusMeters;

            return (
              <div
                key={site.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-semibold">
                      {site.code}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{site.name}</h4>
                    <p className="text-[11px] text-slate-500">{site.location}</p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600">
                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700">
                      Batas Radius Presensi
                    </span>
                    <span className="font-mono font-bold text-[#065f46]">
                      {currentRadius} meter
                    </span>
                  </div>

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
                    <span>200m (Standar Masterplan)</span>
                    <span>400m (Zona Luas)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shifts & Policy Regulations */}
      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Working Shifts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0f766e]" />
              Jadwal Shift Kerja
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jadwal operasional yang digunakan dalam validasi keterlambatan presensi.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Shift Proyek Pagi (Konstruksi)</span>
                <span className="text-[11px] text-slate-500">Pekerjaan struktur, pembesian, bekisting</span>
              </div>
              <span className="font-mono font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
                07:00 - 16:00 WITA
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Shift Kantor & Direksi (Banjarmasin HQ)</span>
                <span className="text-[11px] text-slate-500">Legal, perizinan tanah, finansial, HR</span>
              </div>
              <span className="font-mono font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
                08:30 - 17:30 WITA
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Shift Pengecoran Malam (Cor Beton)</span>
                <span className="text-[11px] text-slate-500">Khusus penuangan ready-mix beton & pompa</span>
              </div>
              <span className="font-mono font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
                19:00 - 04:00 WITA
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Toleransi Keterlambatan Presensi (Menit)
            </label>
            <input
              type="number"
              value={toleranceMinutes}
              onChange={(e) => setToleranceMinutes(Number(e.target.value))}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
        </div>

        {/* Allowances & K3 Rates */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0f766e]" />
                Pengaturan Tunjangan & Potongan
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pengaturan parameter perhitungan penggajian.
              </p>
            </div>

            <div className="space-y-3.5 mt-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Persentase Potongan BPJS Ketenagakerjaan (Karyawan) %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bpjsRate}
                  onChange={(e) => setBpjsRate(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tunjangan Standar Sertifikat AK3 Konstruksi (IDR)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={k3BonusRate}
                  onChange={(e) => setK3BonusRate(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-800">
                Pembaruan parameter akan langsung dihitung pada siklus payroll periode berikutnya.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
