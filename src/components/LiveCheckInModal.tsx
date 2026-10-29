import React, { useState } from 'react';
import { Employee, PropertySite, AttendanceRecord } from '../types/hris';
import { X, MapPin, CheckCircle, Shield, AlertTriangle, Smartphone, UserCheck } from 'lucide-react';

interface LiveCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  sites: PropertySite[];
  onCheckInSuccess: (record: AttendanceRecord) => void;
}

export const LiveCheckInModal: React.FC<LiveCheckInModalProps> = ({
  isOpen,
  onClose,
  employees,
  sites,
  onCheckInSuccess,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(38); // 38 meters default
  const [helmetChecked, setHelmetChecked] = useState(true);
  const [vestChecked, setVestChecked] = useState(true);
  const [bootsChecked, setBootsChecked] = useState(true);
  const [notes, setNotes] = useState('Presensi harian proyek konstruksi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const isWithinGeofence = simulatedDistance <= currentSite.geofenceRadiusMeters;
  const isPpeComplete = helmetChecked && vestChecked && bootsChecked;

  const handleExecuteCheckIn = () => {
    setIsProcessing(true);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Determine status
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      jobCode: currentEmp.jobCode,
      division: currentEmp.division,
      siteId: currentSite.id,
      siteName: currentSite.name,
      date: '2026-10-29',
      checkInTime: currentTime,
      shift: 'Shift Proyek Pagi (07:00 - 16:00)',
      status: isWithinGeofence ? (isLate ? 'Terlambat' : 'Hadir') : 'Terlambat',
      lateMinutes: isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0,
      geofenceDistanceMeters: simulatedDistance,
      geofenceVerified: isWithinGeofence,
      biometricVerified: true,
      ppeCompliance: isPpeComplete,
      deviceInfo: 'Site Kiosk GPS Biometric (Active Tablet)',
      notes: notes || 'Presensi langsung diverifikasi di area proyek',
    };

    setTimeout(() => {
      onCheckInSuccess(newRecord);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0f766e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Simulasi Presensi GPS Lapangan & Verifikasi K3
              </h2>
              <p className="text-[11px] text-emerald-100">
                Sistem Validasi Geofence & Standar Keselamatan Properti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-slate-800 text-xs space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Pilih Karyawan / Personil Lapangan
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.jobCode} - {emp.division})
                </option>
              ))}
            </select>
          </div>

          {/* Project Site Selection */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Pilih Lokasi Proyek / Penugasan
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} (Radius Toleransi: {site.geofenceRadiusMeters}m)
                </option>
              ))}
            </select>
          </div>

          {/* Geofence GPS Simulation Slider */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0f766e]" />
                Simulasi Jarak Posisi GPS ke Titik Pusat Site
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                {simulatedDistance} meter
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="400"
              step="5"
              value={simulatedDistance}
              onChange={(e) => setSimulatedDistance(Number(e.target.value))}
              className="w-full accent-[#0f766e] cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>0m (Tengah Site)</span>
              <span>Batas Radius: {currentSite.geofenceRadiusMeters}m</span>
              <span>400m (Jauh)</span>
            </div>

            {/* Geofence Status Indicator */}
            <div className={`mt-3 p-2.5 rounded-lg border flex items-center gap-2 text-xs font-medium ${
              isWithinGeofence
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {isWithinGeofence ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GPS Valid: Anda berada di dalam zona perimeter proyek ({simulatedDistance}m &le; {currentSite.geofenceRadiusMeters}m).</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Peringatan Geofence: Jarak Anda {simulatedDistance}m melebihi radius batas ({currentSite.geofenceRadiusMeters}m).</span>
                </>
              )}
            </div>
          </div>

          {/* K3 PPE Checklist */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0f766e]" />
              Verifikasi Kepatuhan Alat Pelindung Diri (K3 Lapangan)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={helmetChecked}
                  onChange={(e) => setHelmetChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="text-xs font-medium text-slate-700">Helm Proyek K3</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vestChecked}
                  onChange={(e) => setVestChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="text-xs font-medium text-slate-700">Rompi Reflektif</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bootsChecked}
                  onChange={(e) => setBootsChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="text-xs font-medium text-slate-700">Sepatu Safety</span>
              </label>
            </div>
          </div>

          {/* Activity Note */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Catatan Aktivitas / Penugasan Lapangan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pengawasan pemasangan begisting & tulangan"
              className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExecuteCheckIn}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            {isProcessing ? 'Memverifikasi...' : 'Konfirmasi Check-In Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};
