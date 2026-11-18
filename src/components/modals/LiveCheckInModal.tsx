'use client';

import React, { useState, useEffect } from 'react';
import { Employee, PropertySite, AttendanceRecord } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateHaversineDistance, formatDistance, formatCoordinates } from '@/lib/geo';
import { GeofenceStatusCard, GeofenceBadge, SelfieCameraView } from '@/components/attendance';
import {
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building2,
  Briefcase,
  Laptop,
  FileText,
  LogOut,
  CalendarCheck,
  HeartPulse,
  Send,
  Fingerprint,
} from 'lucide-react';

interface LiveCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  sites: PropertySite[];
  attendanceRecords?: AttendanceRecord[];
  onCheckInSuccess: (record: AttendanceRecord) => void;
  onCheckOut?: (recordId: string, photoUrl?: string) => void;
  initialTab?: 'ATTENDANCE' | 'LEAVE';
}

export const LiveCheckInModal: React.FC<LiveCheckInModalProps> = ({
  isOpen,
  onClose,
  employees,
  sites,
  attendanceRecords = [],
  onCheckInSuccess,
  onCheckOut,
  initialTab = 'ATTENDANCE',
}) => {
  const { currentUser } = useAuth();
  const isEmployeeUser = currentUser?.role === 'EMPLOYEE';

  const initialEmp =
    employees.find(
      (e) =>
        (currentUser?.employeeId && e.id === currentUser.employeeId) ||
        (currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
    ) || employees[0];

  const [modalTab, setModalTab] = useState<'ATTENDANCE' | 'LEAVE'>('ATTENDANCE');
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmp?.id || employees[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(
    currentUser?.siteId || initialEmp?.siteId || sites[0]?.id || ''
  );
  const [workMode, setWorkMode] = useState<'WFO' | 'Dinas Luar' | 'WFH'>('WFO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

  // Leave form
  const [leaveType, setLeaveType] = useState<'Izin' | 'Sakit' | 'Cuti' | 'Dinas Luar'>('Izin');
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmittedRecord(null);
      setIsProcessing(false);
      setSelfiePhoto(null);
      setModalTab(initialTab || 'ATTENDANCE');
      if (initialEmp) {
        setSelectedEmpId(initialEmp.id);
        const targetSiteId = currentUser?.siteId || initialEmp.siteId || sites[0]?.id;
        if (targetSiteId) setSelectedSiteId(targetSiteId);
      }
      setWorkMode('WFO');
      setLeaveType('Izin');
      setLeaveReason('');
    }
  }, [isOpen, initialTab, currentUser, initialEmp, sites]);

  // Geolocation & Simulation State (Always call hooks unconditionally before any early returns)
  const [isSimulatedGeofence, setIsSimulatedGeofence] = useState<boolean>(true);
  const {
    coordinates,
    error: gpsError,
    isLoading: isLoadingGPS,
    refreshPosition: handleRefreshGPS,
  } = useGeolocation({ autoRequest: isOpen });

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || initialEmp || employees[0];
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0] || {
    id: 'SITE-01',
    name: 'Griya Bumi Raya',
    category: 'Perumahan',
    latitude: -3.4125,
    longitude: 114.7082,
    geofenceRadiusMeters: 500,
  };

  // Check if employee is owner/manager (exempt from attendance)
  const isOwnerOrManager = currentEmp.division === 'Manajemen';
  const isOffice =
    currentSite?.category === 'Corporate Head Office' ||
    currentSite?.id === 'SITE-HQ' ||
    currentSite?.category === 'Kantor';

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentEmp?.id && r.date === todayStr
  );

  const hasCheckedIn =
    !!todayRecord && todayRecord.status !== 'Cuti' && todayRecord.status !== 'Izin Lapangan';
  const hasCheckedOut = !!todayRecord?.checkOutTime && todayRecord.checkOutTime !== '-';
  const isLeaveToday =
    todayRecord?.status === 'Cuti' || todayRecord?.status === 'Izin Lapangan';

  // Distance calculation via Haversine formula (dengan fallback aman)
  const siteLat = currentSite?.latitude ?? -3.4125;
  const siteLng = currentSite?.longitude ?? 114.7082;
  const allowedRadius = currentSite?.geofenceRadiusMeters || 500;

  const realDistance = coordinates
    ? calculateHaversineDistance(
        coordinates.latitude,
        coordinates.longitude,
        siteLat,
        siteLng
      )
    : 0;

  const isRealWithinRadius = coordinates ? realDistance <= allowedRadius : false;

  // In simulated mode: distance = 0m and verified
  // In real GPS mode: must be within radius, unless office work is WFH or Dinas Luar
  const effectiveDistance = isSimulatedGeofence ? 0 : realDistance;
  const isWithinGeofence =
    isSimulatedGeofence || (isOffice && workMode !== 'WFO') || isRealWithinRadius;
  const isPpeComplete = true;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleExecuteCheckIn = () => {
    setIsProcessing(true);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    const isLate = isOffice
      ? now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30)
      : now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const lateMinutes = isOffice
      ? isLate ? (now.getHours() - 8) * 60 + (now.getMinutes() - 30) : 0
      : isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0;

    const shiftLabel = isOffice
      ? workMode === 'WFO'
        ? 'Shift Kantor Pusat (08:30 - 17:30)'
        : workMode === 'Dinas Luar'
        ? 'Penugasan Dinas Luar Kantor'
        : 'Shift Kantor WFH (08:30 - 17:30)'
      : 'Shift Proyek Pagi (07:00 - 16:00)';

    const defaultNotes = isOffice
      ? workMode === 'WFO'
        ? 'Presensi operasional kantor pusat'
        : workMode === 'Dinas Luar'
        ? 'Dinas luar koordinasi pemda & mitra'
        : 'Presensi remote WFH terjadwal'
      : 'Presensi langsung diverifikasi di area proyek';

    const deviceInfoStr = isSimulatedGeofence
      ? 'Smartphone GPS (Mode Simulasi Proyek 0m)'
      : coordinates
      ? `Smartphone GPS (${formatCoordinates(coordinates.latitude, coordinates.longitude)} · Akurasi ±${coordinates.accuracy}m)`
      : isOffice
      ? workMode === 'WFO'
        ? 'Turnstile Biometric & Mobile Web (Menara HQ)'
        : `Geotagged Mobile (${workMode})`
      : 'Smartphone GPS Geotagged (Mobile Web)';

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      jobCode: currentEmp.jobCode,
      division: currentEmp.division,
      siteId: currentSite.id,
      siteName: currentSite.name,
      date: todayStr,
      checkInTime: `${currentTime} WITA`,
      shift: shiftLabel,
      status: isLate ? 'Terlambat' : 'Hadir',
      lateMinutes,
      geofenceDistanceMeters: effectiveDistance,
      geofenceVerified: isWithinGeofence,
      biometricVerified: true,
      ppeCompliance: isPpeComplete,
      workMode: isOffice ? workMode : 'Site Proyek',
      deviceInfo: deviceInfoStr,
      photoUrl: selfiePhoto || undefined,
      notes: defaultNotes,
    };

    setTimeout(() => {
      onCheckInSuccess(newRecord);
      setIsProcessing(false);
      setSubmittedRecord(newRecord);
    }, 450);
  };

  const handleExecuteCheckOut = () => {
    if (!todayRecord) return;
    setIsProcessing(true);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm} WITA`;

    setTimeout(() => {
      if (onCheckOut) onCheckOut(todayRecord.id, selfiePhoto || undefined);
      setIsProcessing(false);
      setSubmittedRecord({ ...todayRecord, checkOutTime: currentTime, photoUrl: selfiePhoto || todayRecord.photoUrl });
    }, 450);
  };

  const handleExecuteLeave = () => {
    if (!leaveReason.trim()) return;
    setIsProcessing(true);

    const shiftLabel =
      leaveType === 'Cuti'
        ? 'Cuti Tahunan Terjadwal'
        : leaveType === 'Sakit'
        ? 'Sakit (Izin Istirahat Medis)'
        : leaveType === 'Dinas Luar'
        ? 'Dinas Luar / Koordinasi Eksternal'
        : 'Izin Keperluan Pribadi/Mendesak';

    const leaveRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      jobCode: currentEmp.jobCode,
      division: currentEmp.division,
      siteId: currentSite.id,
      siteName: currentSite.name,
      date: todayStr,
      checkInTime: '-',
      checkOutTime: '-',
      shift: shiftLabel,
      status: leaveType === 'Cuti' ? 'Cuti' : 'Izin Lapangan',
      lateMinutes: 0,
      geofenceDistanceMeters: 0,
      geofenceVerified: true,
      biometricVerified: true,
      ppeCompliance: true,
      deviceInfo: 'Form Lapor Izin & Cuti Mobile HRIS',
      notes: `[${leaveType.toUpperCase()}]: ${leaveReason}`,
    };

    setTimeout(() => {
      onCheckInSuccess(leaveRecord);
      setIsProcessing(false);
      setSubmittedRecord(leaveRecord);
    }, 450);
  };

  const handleCloseModal = () => {
    setSubmittedRecord(null);
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      {/* Backdrop overlay (click to close) */}
      <div className="fixed inset-0" onClick={handleCloseModal} aria-hidden="true" />

      {/* Sheet / Modal Container:
          - Mobile: Mengambang di atas Mobile Bottom Navigation (bottom-16), max-h calc, BottomNav tetap utuh
          - Desktop: Terpusat di tengah layar (sm:items-center)
      */}
      <div className="fixed inset-x-0 bottom-16 sm:inset-0 z-45 sm:z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-200/90 shadow-2xl flex flex-col max-h-[calc(100dvh-4.75rem)] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-2 duration-200 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* ── HEADER (Ringkas & Memuat Identitas Karyawan) ─────────────────── */}
          <div className="bg-[#0f766e] px-4 py-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Fingerprint className="w-4.5 h-4.5 text-emerald-100" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold tracking-tight text-white truncate">
                  {submittedRecord
                    ? submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                      ? 'Absen Pulang Tercatat'
                      : submittedRecord.status === 'Cuti' || submittedRecord.status === 'Izin Lapangan'
                      ? 'Laporan Izin Diterima'
                      : 'Absen Masuk Tercatat'
                    : hasCheckedIn && !hasCheckedOut
                    ? 'Presensi Pulang'
                    : 'Presensi Harian'}
                </h2>
                <p className="text-[11px] text-emerald-100/90 truncate">
                  {currentEmp.name} · <span className="text-emerald-200">{currentSite.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

        {/* ── SUCCESS RECEIPT ─────────────────────────────────────────────── */}
        {submittedRecord ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="text-center pt-1">
              <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-[#0f766e]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                  ? 'Absen Pulang Berhasil!'
                  : submittedRecord.status === 'Cuti' || submittedRecord.status === 'Izin Lapangan'
                  ? 'Laporan Berhasil Disimpan!'
                  : 'Absen Masuk Berhasil!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data tersimpan di sistem HRIS.
              </p>
            </div>

            {/* Selfie Photo Preview di Struk */}
            {submittedRecord.photoUrl && (
              <div className="flex items-center justify-center pt-0.5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={submittedRecord.photoUrl}
                    alt="Selfie Presensi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow-2xs">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <StatusBadge status={submittedRecord.status} size="sm" />
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                    ? `Pulang: ${submittedRecord.checkOutTime}`
                    : submittedRecord.checkInTime !== '-'
                    ? `Masuk: ${submittedRecord.checkInTime}`
                    : todayStr}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Karyawan
                  </span>
                  <p className="font-bold text-slate-900 truncate">{submittedRecord.employeeName}</p>
                  <p className="font-mono text-[10px] text-slate-500">{submittedRecord.jobCode}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Lokasi
                  </span>
                  <p className="font-bold text-slate-900 truncate">{submittedRecord.siteName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{submittedRecord.shift}</p>
                </div>
              </div>

              {submittedRecord.lateMinutes > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    ⚠ Terlambat {submittedRecord.lateMinutes} menit
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Verifikasi GPS Geofence:</span>
                <GeofenceBadge
                  distanceMeters={submittedRecord.geofenceDistanceMeters}
                  verified={submittedRecord.geofenceVerified}
                  compact
                />
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                Ref: {submittedRecord.id}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3 text-sm font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Selesai</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        ) : (
          /* ── ACTIVE FORM ────────────────────────────────────────────────── */
          <>
            <div className="flex-1 overflow-y-auto">

              {/* TAB SWITCHER: Absen / Izin & Cuti */}
              <div className="flex border-b border-slate-200 bg-white px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalTab('ATTENDANCE')}
                  className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    modalTab === 'ATTENDANCE'
                      ? 'border-[#0f766e] text-[#0f766e]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Absen Masuk / Pulang
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('LEAVE')}
                  className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    modalTab === 'LEAVE'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Izin / Cuti
                </button>
              </div>

              <div className="p-3 sm:p-4 space-y-3">

                {/* ── PILIH KARYAWAN (Hanya untuk Admin / Kiosk mode) ──────── */}
                {!isEmployeeUser && (
                  <div className="space-y-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Pilih Karyawan
                    </label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => {
                        const emp = employees.find((x) => x.id === e.target.value);
                        setSelectedEmpId(e.target.value);
                        if (emp?.siteId) setSelectedSiteId(emp.siteId);
                      }}
                      className="w-full h-8.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] cursor-pointer"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} — {emp.title}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="w-full h-8.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] cursor-pointer"
                    >
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ── TAB 1: ABSEN MASUK / PULANG ──────────────────────── */}
                {modalTab === 'ATTENDANCE' && (
                  <>
                    {/* STATUS: SUDAH ABSEN MASUK, BELUM PULANG → Form Checkout dengan Selfie */}
                    {hasCheckedIn && !hasCheckedOut ? (
                      <div className="space-y-3.5">
                        {/* Info Status Masuk */}
                        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                              Sedang Bekerja
                            </span>
                            <span className="font-mono text-xs font-bold bg-emerald-200/80 text-[#065f46] px-2 py-0.5 rounded-lg">
                              Masuk: {todayRecord?.checkInTime}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-800 pt-1 border-t border-emerald-200">
                            <span className="text-emerald-600">Lokasi:</span>{' '}
                            <span className="font-semibold">{todayRecord?.siteName}</span>
                          </div>
                        </div>

                        {/* Label instruksi */}
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Verifikasi Absen Pulang
                        </div>

                        {/* Geofence GPS Status */}
                        <GeofenceStatusCard
                          targetSite={currentSite}
                          isSimulated={isSimulatedGeofence}
                          onToggleSimulated={setIsSimulatedGeofence}
                          coordinates={coordinates}
                          distanceMeters={realDistance}
                          isWithinRadius={isRealWithinRadius}
                          isLoadingGPS={isLoadingGPS}
                          gpsError={gpsError}
                          onRefreshGPS={handleRefreshGPS}
                          showDemoToggle={true}
                        />

                        {/* Selfie Camera View untuk Checkout */}
                        <SelfieCameraView
                          onPhotoCaptured={setSelfiePhoto}
                          employeeName={currentEmp.name}
                          employeeInitials={currentEmp.initials}
                          avatarColor={currentEmp.avatarColor}
                        />
                      </div>

                    ) : hasCheckedIn && hasCheckedOut ? (
                      /* STATUS: LENGKAP */
                      <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-center space-y-2">
                        <CalendarCheck className="w-10 h-10 text-[#0f766e] mx-auto" />
                        <h4 className="text-sm font-bold text-slate-900">Presensi Hari Ini Lengkap!</h4>
                        <div className="flex items-center justify-center gap-3 pt-1 font-mono text-xs">
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800">
                            Masuk: <strong>{todayRecord?.checkInTime}</strong>
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[#065f46] font-bold">
                            Pulang: <strong>{todayRecord?.checkOutTime}</strong>
                          </span>
                        </div>
                      </div>

                    ) : isOwnerOrManager ? (
                      /* STATUS: PEMILIK/DIREKTUR - TIDAK PERLU ABSEN */
                      <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 text-[#0f766e] flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Anda Tidak Perlu Absen</h4>
                        <p className="text-xs text-slate-600 max-w-xs mx-auto">
                          Sebagai pemilik/direktur perusahaan, Anda tidak diwajibkan melakukan presensi harian.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <span className="px-3 py-1 bg-white border border-emerald-200 rounded-lg text-[#0f766e] font-bold text-xs">
                            Pemilik
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            Dividen/Profit Sharing
                          </span>
                        </div>
                      </div>

                    ) : isLeaveToday ? (
                      /* STATUS: IZIN / CUTI */
                      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-900">{todayRecord?.status} Hari Ini</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          {todayRecord?.notes || 'Tercatat izin resmi dari sistem HRIS.'}
                        </p>
                      </div>

                    ) : (
                      /* FORM ABSEN MASUK */
                      <>
                        {/* Geofence GPS Status Card */}
                        <GeofenceStatusCard
                          targetSite={currentSite}
                          isSimulated={isSimulatedGeofence}
                          onToggleSimulated={setIsSimulatedGeofence}
                          coordinates={coordinates}
                          distanceMeters={realDistance}
                          isWithinRadius={isRealWithinRadius}
                          isLoadingGPS={isLoadingGPS}
                          gpsError={gpsError}
                          onRefreshGPS={handleRefreshGPS}
                          showDemoToggle={true}
                        />

                        {/* Selfie Camera View */}
                        <SelfieCameraView
                          onPhotoCaptured={setSelfiePhoto}
                          employeeName={currentEmp.name}
                          employeeInitials={currentEmp.initials}
                          avatarColor={currentEmp.avatarColor}
                        />

                        {/* Mode Kehadiran (hanya untuk kantor) */}
                        {isOffice && (
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                              Mode Kehadiran
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { value: 'WFO', label: 'Kantor', icon: <Building2 className="w-4 h-4" /> },
                                { value: 'Dinas Luar', label: 'Dinas Luar', icon: <Briefcase className="w-4 h-4" /> },
                                { value: 'WFH', label: 'WFH', icon: <Laptop className="w-4 h-4" /> },
                              ].map(({ value, label, icon }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setWorkMode(value as typeof workMode)}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                    workMode === value
                                      ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-sm'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {icon}
                                  <span>{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ── TAB 2: IZIN / CUTI ───────────────────────────────── */}
                {modalTab === 'LEAVE' && (
                  <div className="space-y-3.5">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <HeartPulse className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Lapor Ketidakhadiran Hari Ini</span>
                        <span className="text-[11px] text-amber-800">
                          Agar tidak tercatat alpa, laporkan status kehadiran Anda.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Jenis Ketidakhadiran
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Izin', 'Sakit', 'Cuti', 'Dinas Luar'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setLeaveType(type)}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                              leaveType === type
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {type === 'Izin' ? '📋 Izin' : type === 'Sakit' ? '🤒 Sakit' : type === 'Cuti' ? '🌴 Cuti' : '🚗 Dinas Luar'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                        Alasan / Keterangan *
                      </label>
                      <textarea
                        rows={3}
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder={
                          leaveType === 'Sakit'
                            ? 'Contoh: Demam, istirahat sesuai anjuran dokter'
                            : leaveType === 'Cuti'
                            ? 'Contoh: Cuti tahunan keluarga'
                            : leaveType === 'Dinas Luar'
                            ? 'Contoh: Rapat koordinasi di Kantor BPN'
                            : 'Contoh: Mengurus dokumen kependudukan'
                        }
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── ACTION FOOTER ───────────────────────────────────────────── */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-white space-y-2">
              {/* Tombol Aksi Utama */}
              {modalTab === 'LEAVE' ? (
                <button
                  type="button"
                  onClick={handleExecuteLeave}
                  disabled={!leaveReason.trim() || isProcessing}
                  className="w-full py-3.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isProcessing ? 'Mengirim...' : `Kirim Laporan ${leaveType}`}
                </button>
              ) : hasCheckedIn && !hasCheckedOut ? (
                <button
                  type="button"
                  onClick={handleExecuteCheckOut}
                  disabled={isProcessing || !selfiePhoto}
                  className={`w-full py-3.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    !selfiePhoto
                      ? 'bg-slate-400 cursor-not-allowed opacity-80 shadow-none'
                      : 'bg-[#0f766e] hover:bg-[#115e59] shadow-emerald-700/20 cursor-pointer'
                  }`}
                >
                  <LogOut className="w-4.5 h-4.5" />
                  {isProcessing
                    ? 'Memproses...'
                    : !selfiePhoto
                    ? 'Ambil Foto Selfie Pulang Dahulu'
                    : 'Absen Pulang Sekarang'}
                </button>
              ) : hasCheckedIn && hasCheckedOut ? (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              ) : isLeaveToday ? (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteCheckIn}
                  disabled={isProcessing || !isWithinGeofence || !selfiePhoto}
                  className={`w-full py-3.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    !isWithinGeofence || !selfiePhoto
                      ? 'bg-slate-400 hover:bg-slate-400 cursor-not-allowed opacity-80 shadow-none'
                      : 'bg-[#0f766e] hover:bg-[#115e59] shadow-emerald-700/20 cursor-pointer'
                  }`}
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  {isProcessing
                    ? 'Memverifikasi...'
                    : !isWithinGeofence
                    ? `Di Luar Radius (${formatDistance(realDistance)})`
                    : !selfiePhoto
                    ? 'Ambil Foto Selfie Dahulu'
                    : isOffice
                    ? workMode === 'WFO'
                      ? 'Absen Masuk — Kantor'
                      : `Absen Masuk — ${workMode}`
                    : 'Absen Masuk Sekarang'}
                </button>
              )}

              {/* Tombol Batal (teks kecil) */}
              {!hasCheckedIn && !isLeaveToday && (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
};
