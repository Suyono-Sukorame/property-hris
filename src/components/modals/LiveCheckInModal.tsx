'use client';

import React, { useState, useEffect } from 'react';
import { Employee, PropertySite, AttendanceRecord } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui';
import {
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Users,
  HardHat,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

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
  const { currentUser } = useAuth();
  const isEmployeeUser = currentUser?.role === 'EMPLOYEE';

  // Find initial employee matching current user
  const initialEmp = employees.find(
    (e) =>
      (currentUser?.employeeId && e.id === currentUser.employeeId) ||
      (currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || employees[0];

  const [selectedEmpId, setSelectedEmpId] = useState(initialEmp?.id || employees[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(
    currentUser?.siteId || initialEmp?.siteId || sites[0]?.id || ''
  );
  const [simulatedDistance, setSimulatedDistance] = useState<number>(38); // 38 meters default (inside site)
  const [helmetChecked, setHelmetChecked] = useState(true);
  const [vestChecked, setVestChecked] = useState(true);
  const [bootsChecked, setBootsChecked] = useState(true);
  const [notes, setNotes] = useState('Presensi harian proyek konstruksi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [isKioskMode, setIsKioskMode] = useState(false);

  // Sync state whenever modal opens or current user changes
  useEffect(() => {
    if (isOpen) {
      setSubmittedRecord(null);
      setIsProcessing(false);
      if (initialEmp) {
        setSelectedEmpId(initialEmp.id);
        if (currentUser?.siteId || initialEmp.siteId) {
          setSelectedSiteId(currentUser?.siteId || initialEmp.siteId);
        }
      }
      setIsKioskMode(false);
    }
  }, [isOpen, currentUser, initialEmp]);

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || initialEmp || employees[0];
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const maxRadius = currentSite?.geofenceRadiusMeters || 200;
  const isWithinGeofence = simulatedDistance <= maxRadius;
  const isPpeComplete = helmetChecked && vestChecked && bootsChecked;

  const handleExecuteCheckIn = () => {
    if (!isWithinGeofence) return;

    setIsProcessing(true);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Standard work shift starts at 08:00
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const lateMinutes = isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      jobCode: currentEmp.jobCode,
      division: currentEmp.division,
      siteId: currentSite.id,
      siteName: currentSite.name,
      date: new Date().toISOString().slice(0, 10),
      checkInTime: `${currentTime} WITA`,
      shift: 'Shift Proyek Pagi (07:00 - 16:00)',
      status: isLate ? 'Terlambat' : 'Hadir',
      lateMinutes,
      geofenceDistanceMeters: simulatedDistance,
      geofenceVerified: true,
      biometricVerified: true,
      ppeCompliance: isPpeComplete,
      deviceInfo: 'Smartphone GPS Geotagged (Mobile Web)',
      notes: notes || 'Presensi langsung diverifikasi di area proyek',
    };

    setTimeout(() => {
      onCheckInSuccess(newRecord);
      setIsProcessing(false);
      setSubmittedRecord(newRecord);
    }, 450);
  };

  const handleCloseModal = () => {
    setSubmittedRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
      <div
        className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* =========================================================================
            HEADER BAR
            ========================================================================= */}
        <div className="bg-[#0f766e] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                {submittedRecord ? 'Bukti Presensi Lapangan Terverifikasi' : 'Presensi GPS & Cek APD Lapangan'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 truncate">
                {submittedRecord ? 'Tersimpan ke Sistem HRIS · Wilayah Kalsel' : 'Verifikasi Radius Lokasi & Standar K3 Proyek'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            VIEW A: SUCCESS RECEIPT SCREEN (Jika Presensi Berhasil Dikonfirmasi)
            ========================================================================= */}
        {submittedRecord ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs space-y-4">
            {/* Top Success Banner */}
            <div className="text-center py-3">
              <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#0f766e]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Presensi Berhasil Dikonfirmasi!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data kehadiran dan verifikasi APD Anda telah tercatat di server proyek.
              </p>
            </div>

            {/* Official Digital Attendance Ticket */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 shadow-xs">
              {/* Ticket Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <StatusBadge status={submittedRecord.status} size="sm" />
                  {submittedRecord.lateMinutes > 0 && (
                    <span className="text-[11px] font-mono text-amber-700 font-semibold">
                      +{submittedRecord.lateMinutes} menit
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Waktu Masuk</span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {submittedRecord.checkInTime}
                  </span>
                </div>
              </div>

              {/* Employee & Job Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Karyawan
                  </span>
                  <p className="font-bold text-slate-900 truncate mt-0.5">{submittedRecord.employeeName}</p>
                  <p className="font-mono text-[10px] text-slate-500">{submittedRecord.jobCode}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Penempatan Proyek
                  </span>
                  <p className="font-bold text-slate-900 truncate mt-0.5">{submittedRecord.siteName}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Radius {submittedRecord.geofenceDistanceMeters}m (Sesuai)</p>
                </div>
              </div>

              {/* PPE / K3 Status Breakdown */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Verifikasi Keselamatan Kerja (K3)
                </span>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {submittedRecord.ppeCompliance ? 'APD Lengkap (100%)' : 'Peringatan APD Tidak Lengkap'}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    Helm · Rompi · Sepatu Safety
                  </span>
                </div>
              </div>

              {/* Ticket ID Reference */}
              <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Ref ID: {submittedRecord.id}</span>
                <span>Geotagged Mobile GPS</span>
              </div>
            </div>

            {/* Bottom Done Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Selesai & Tutup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              VIEW B: ACTIVE CHECK-IN FORM (Formulir Presensi & APD)
              ========================================================================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs space-y-4">
            {/* Identity Card: Auto-detection for Employee vs Kiosk Select */}
            {isEmployeeUser && !isKioskMode ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                    style={{ backgroundColor: currentEmp.avatarColor || '#0f766e' }}
                  >
                    {currentEmp.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {currentEmp.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-[#065f46] text-[9px] font-bold uppercase tracking-wider shrink-0">
                        Akun Anda
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      {currentEmp.title} · <span className="font-mono text-slate-500">{currentEmp.jobCode}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Penempatan
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block max-w-37.5">
                    {currentSite.name}
                  </span>
                </div>
              </div>
            ) : (
              /* Kiosk Mode / Admin Selection */
              <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0f766e]" />
                    <span>Pilih Karyawan Lapangan</span>
                  </label>
                  {isEmployeeUser && (
                    <button
                      type="button"
                      onClick={() => setIsKioskMode(false)}
                      className="text-[10px] text-[#0f766e] font-semibold hover:underline cursor-pointer"
                    >
                      Kembali ke Akun Saya
                    </button>
                  )}
                </div>

                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    setSelectedEmpId(e.target.value);
                    if (emp?.siteId) setSelectedSiteId(emp.siteId);
                  }}
                  className="w-full h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.title} - {emp.jobCode})
                    </option>
                  ))}
                </select>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                    Lokasi Proyek Penugasan
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] cursor-pointer"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} (Radius Maksimal: {site.geofenceRadiusMeters}m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Geofence GPS Radar Simulation Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-[#0f766e] shrink-0" />
                  <span>Jarak dari Titik Proyek ({currentSite.name})</span>
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                  {simulatedDistance} meter
                </span>
              </div>

              {/* Interactive Distance Slider */}
              <input
                type="range"
                min="10"
                max="400"
                step="5"
                value={simulatedDistance}
                onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                className="w-full accent-[#0f766e] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>0m (Tengah Site)</span>
                <span className="font-semibold text-slate-700">Batas Aman: {maxRadius}m</span>
                <span>400m (Luar)</span>
              </div>

              {/* Quick Distance Presets */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Pintasan Cepat:
                </span>
                <button
                  type="button"
                  onClick={() => setSimulatedDistance(25)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    simulatedDistance === 25
                      ? 'bg-[#0f766e] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  25m (Dalam Proyek)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedDistance(85)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    simulatedDistance === 85
                      ? 'bg-[#0f766e] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  85m (Gerbang Proyek)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedDistance(250)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    simulatedDistance === 250
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  250m (Luar Radius)
                </button>
              </div>

              {/* Live Geofence Status Indicator */}
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-medium transition-all ${
                  isWithinGeofence
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isWithinGeofence ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Posisi GPS Valid (Dalam radius {simulatedDistance}m / Batas {maxRadius}m)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Di Luar Radius Proyek ({simulatedDistance}m)! Melebihi batas toleransi {maxRadius}m.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mandatory PPE / K3 Compliance Checklist */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block">
                Pemeriksaan Kelengkapan APD (K3 Lapangan)
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

              {/* Warning if APD incomplete */}
              {!isPpeComplete && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Peringatan K3: Kelengkapan APD belum 100%. Catatan ketidaksesuaian akan diteruskan ke tim pengawas K3.
                  </span>
                </div>
              )}
            </div>

            {/* Field Notes Input */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Catatan / Area Kerja Lapangan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pekerjaan bekisting zona barat lantai 2"
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            ACTION FOOTER (Khusus tampilan form aktif)
            ========================================================================= */}
        {!submittedRecord && (
          <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5">
            <div>
              {!isWithinGeofence && (
                <span className="text-[11px] text-rose-700 font-semibold hidden sm:inline">
                  Presensi ditolak di luar radius
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCheckIn}
                disabled={!isWithinGeofence || isProcessing}
                className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  isWithinGeofence
                    ? 'text-white bg-[#0f766e] hover:bg-[#115e59] shadow-emerald-700/20 active:scale-98'
                    : 'text-slate-400 bg-slate-200 cursor-not-allowed border border-slate-300'
                }`}
                title={!isWithinGeofence ? 'Dekati area proyek untuk presensi' : undefined}
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Memverifikasi GPS...'
                    : !isWithinGeofence
                    ? 'Posisi di Luar Radius'
                    : 'Konfirmasi Presensi GPS'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
