'use client';

import React, { useState } from 'react';
import { Employee, PropertySite, AttendanceRecord } from '@/types/hris';
import { X, MapPin, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';

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
      deviceInfo: 'Smartphone GPS Geotagged (Mobile Web)',
      notes: notes || 'Presensi langsung diverifikasi di area proyek',
    };

    setTimeout(() => {
      onCheckInSuccess(newRecord);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
      <div 
        className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0f766e] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                Presensi GPS & Cek APD Lapangan
              </h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 truncate">
                Verifikasi Radius Lokasi & Standar K3 Proyek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs space-y-3.5">
          {/* Employee Selection */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Nama Karyawan
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
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
              Lokasi Proyek
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} (Batas Radius: {site.geofenceRadiusMeters}m)
                </option>
              ))}
            </select>
          </div>

          {/* Geofence GPS Simulation Slider */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-[#0f766e] shrink-0" />
                <span>Jarak dari Titik Proyek</span>
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
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

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0m (Tengah Proyek)</span>
              <span>Batas: {currentSite.geofenceRadiusMeters}m</span>
              <span>400m (Luar)</span>
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
                  <span>Posisi GPS Valid (Dalam Radius Proyek {currentSite.geofenceRadiusMeters}m)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Posisi Terlalu Jauh! Di luar radius {currentSite.geofenceRadiusMeters}m proyek</span>
                </>
              )}
            </div>
          </div>

          {/* PPE K3 Compliance Checklist */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Pemeriksaan Kelengkapan APD (K3)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={helmetChecked}
                  onChange={(e) => setHelmetChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="font-medium text-slate-800">Helm Proyek</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={vestChecked}
                  onChange={(e) => setVestChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="font-medium text-slate-800">Rompi Reflektif</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={bootsChecked}
                  onChange={(e) => setBootsChecked(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="font-medium text-slate-800">Sepatu Safety</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Catatan / Area Kerja
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pengecoran slab lantai 2 zona barat"
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
            />
          </div>
        </div>

        {/* Action Footer (Always Visible at Bottom) */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteCheckIn}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'Memproses Presensi...' : 'Konfirmasi Presensi GPS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
