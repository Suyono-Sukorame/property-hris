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
  Building2,
  Briefcase,
  Laptop,
  Calendar,
  FileText,
  LogOut,
  CalendarCheck,
  HeartPulse,
  Send,
} from 'lucide-react';

interface LiveCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  sites: PropertySite[];
  attendanceRecords?: AttendanceRecord[];
  onCheckInSuccess: (record: AttendanceRecord) => void;
  onCheckOut?: (recordId: string) => void;
}

export const LiveCheckInModal: React.FC<LiveCheckInModalProps> = ({
  isOpen,
  onClose,
  employees,
  sites,
  attendanceRecords = [],
  onCheckInSuccess,
  onCheckOut,
}) => {
  const { currentUser } = useAuth();
  const isEmployeeUser = currentUser?.role === 'EMPLOYEE';

  // Find initial employee matching current user
  const initialEmp = employees.find(
    (e) =>
      (currentUser?.employeeId && e.id === currentUser.employeeId) ||
      (currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || employees[0];

  const [modalTab, setModalTab] = useState<'ATTENDANCE' | 'LEAVE'>('ATTENDANCE');
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmp?.id || employees[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(
    currentUser?.siteId || initialEmp?.siteId || sites[0]?.id || ''
  );
  const [simulatedDistance, setSimulatedDistance] = useState<number>(38); // 38 meters default
  const [helmetChecked, setHelmetChecked] = useState(true);
  const [vestChecked, setVestChecked] = useState(true);
  const [bootsChecked, setBootsChecked] = useState(true);
  const [workMode, setWorkMode] = useState<'WFO' | 'Dinas Luar' | 'WFH'>('WFO');
  const [notes, setNotes] = useState('Presensi harian kerja');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [isKioskMode, setIsKioskMode] = useState(false);

  // Leave / Permission Form States
  const [leaveType, setLeaveType] = useState<'Izin' | 'Sakit' | 'Cuti' | 'Dinas Luar'>('Izin');
  const [leaveReason, setLeaveReason] = useState('');

  // Sync state whenever modal opens or current user changes
  useEffect(() => {
    if (isOpen) {
      setSubmittedRecord(null);
      setIsProcessing(false);
      setModalTab('ATTENDANCE');
      if (initialEmp) {
        setSelectedEmpId(initialEmp.id);
        const targetSiteId = currentUser?.siteId || initialEmp.siteId || sites[0]?.id;
        if (targetSiteId) {
          setSelectedSiteId(targetSiteId);
        }
      }
      setIsKioskMode(false);
      setWorkMode('WFO');
      setLeaveType('Izin');
      setLeaveReason('');
    }
  }, [isOpen, currentUser, initialEmp, sites]);

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || initialEmp || employees[0];
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const isOffice = currentSite?.category === 'Corporate Head Office' || currentSite?.id === 'SITE-HQ' || currentSite?.category === 'Kantor';
  const maxRadius = currentSite?.geofenceRadiusMeters || 500;

  // Detect today's existing attendance for currentEmp
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentEmp.id && r.date === todayStr
  );

  const hasCheckedIn = !!todayRecord && todayRecord.status !== 'Cuti' && todayRecord.status !== 'Izin Lapangan';
  const hasCheckedOut = !!todayRecord?.checkOutTime && todayRecord.checkOutTime !== '-';
  const isLeaveToday = todayRecord?.status === 'Cuti' || todayRecord?.status === 'Izin Lapangan';

  // Mode Rintisan: Geofence selalu diizinkan (tidak memblokir absen) —
  // GPS hanya dicatat sebagai referensi, bukan penghalang.
  const isWithinGeofence = workMode === 'Dinas Luar' || workMode === 'WFH' ? true : simulatedDistance <= maxRadius;
  // APD tidak wajib di mode rintisan — selalu dianggap OK
  const isPpeComplete = true;

  // Action: Check-In (Absen Masuk)
  const handleExecuteCheckIn = () => {
    if (!isWithinGeofence) return;

    setIsProcessing(true);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Standard work shift: Office 08:30 vs Field 08:00
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
      geofenceDistanceMeters: isOffice && workMode !== 'WFO' ? 0 : simulatedDistance,
      geofenceVerified: isWithinGeofence,
      biometricVerified: true,
      ppeCompliance: isPpeComplete,
      workMode: isOffice ? workMode : 'Site Proyek',
      deviceInfo: isOffice
        ? workMode === 'WFO'
          ? 'Turnstile Biometric & Mobile Web (Menara HQ)'
          : `Geotagged Mobile (${workMode})`
        : 'Smartphone GPS Geotagged (Mobile Web)',
      notes: notes || defaultNotes,
    };

    setTimeout(() => {
      onCheckInSuccess(newRecord);
      setIsProcessing(false);
      setSubmittedRecord(newRecord);
    }, 450);
  };

  // Action: Check-Out (Absen Pulang)
  const handleExecuteCheckOut = () => {
    if (!todayRecord) return;
    setIsProcessing(true);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes} WITA`;

    setTimeout(() => {
      if (onCheckOut) {
        onCheckOut(todayRecord.id);
      }
      setIsProcessing(false);
      setSubmittedRecord({
        ...todayRecord,
        checkOutTime: currentTime,
      });
    }, 450);
  };

  // Action: Submit Leave / Permission (Izin, Sakit, Cuti)
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

    const statusValue = leaveType === 'Cuti' ? 'Cuti' : 'Izin Lapangan';

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
      status: statusValue,
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
        <div className="bg-[#0f766e] px-4 sm:px-6 py-3 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isOffice ? (
              <Building2 className="w-5 h-5 text-emerald-200 shrink-0" />
            ) : (
              <Smartphone className="w-5 h-5 text-emerald-200 shrink-0" />
            )}
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                {submittedRecord
                  ? submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                    ? 'Bukti Absen Pulang Terverifikasi'
                    : submittedRecord.status === 'Cuti' || submittedRecord.status === 'Izin Lapangan'
                    ? 'Pengajuan Izin / Cuti Diterima'
                    : 'Bukti Absen Masuk Terverifikasi'
                  : 'Layanan Presensi & Kehadiran Karyawan'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 truncate">
                PT Bumi Raya Propertindo · Sistem Presensi Real-Time
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
            TOP TABS: [ 🏢 Presensi Kerja ] vs [ 📝 Izin / Sakit / Cuti ]
            (Hanya tampil saat form aktif sebelum submit)
            ========================================================================= */}
        {!submittedRecord && (
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setModalTab('ATTENDANCE')}
              className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                modalTab === 'ATTENDANCE'
                  ? 'border-[#0f766e] text-[#0f766e] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Presensi Kerja (Masuk / Pulang)</span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('LEAVE')}
              className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                modalTab === 'LEAVE'
                  ? 'border-[#0f766e] text-[#0f766e] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Izin / Sakit / Cuti</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            VIEW A: SUCCESS RECEIPT SCREEN
            ========================================================================= */}
        {submittedRecord ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs space-y-4">
            <div className="text-center py-2">
              <div className="w-13 h-13 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-7 h-7 text-[#0f766e]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                  ? 'Absen Pulang Berhasil Dicatat!'
                  : submittedRecord.status === 'Cuti' || submittedRecord.status === 'Izin Lapangan'
                  ? 'Laporan Izin / Cuti Berhasil Disimpan!'
                  : 'Absen Masuk Berhasil Dikonfirmasi!'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data telah tersimpan di sistem HRIS server Menara Bumi Raya.
              </p>
            </div>

            {/* Official Digital Ticket */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-xs">
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
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Waktu Record</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {submittedRecord.checkOutTime && submittedRecord.checkOutTime !== '-'
                      ? `Pulang: ${submittedRecord.checkOutTime}`
                      : submittedRecord.checkInTime !== '-'
                      ? `Masuk: ${submittedRecord.checkInTime}`
                      : todayStr}
                  </span>
                </div>
              </div>

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
                    Lokasi / Shift
                  </span>
                  <p className="font-bold text-slate-900 truncate mt-0.5">{submittedRecord.siteName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{submittedRecord.shift}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Catatan / Keterangan
                </span>
                <p className="p-2 bg-white rounded-lg border border-slate-200 italic">
                  &ldquo;{submittedRecord.notes || 'Presensi terverifikasi'}&rdquo;
                </p>
              </div>

              <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Ref ID: {submittedRecord.id}</span>
                <span>{submittedRecord.deviceInfo}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
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
              VIEW B: ACTIVE FORM (TAB 1: ATTENDANCE vs TAB 2: LEAVE)
              ========================================================================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs space-y-4">
            {/* Identity Card: Employee info */}
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
              /* Kiosk / Admin Switcher */
              <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0f766e]" />
                    <span>Pilih Karyawan</span>
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
                    Lokasi Penugasan
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] cursor-pointer"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} (Radius Maks: {site.geofenceRadiusMeters}m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 1: PRESENSI KERJA (MASUK / PULANG) */}
            {modalTab === 'ATTENDANCE' && (
              <>
                {/* SUB-CASE 1: Karyawan Sudah Absen Masuk & Belum Pulang (Tampilkan Mode Absen Pulang) */}
                {hasCheckedIn && !hasCheckedOut ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-[#0f766e]" />
                          <span>Status Hari Ini: Sedang Bekerja</span>
                        </span>
                        <span className="font-mono font-bold text-xs bg-emerald-200/80 text-[#065f46] px-2 py-0.5 rounded">
                          Masuk: {todayRecord.checkInTime}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1 border-t border-emerald-200/60">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Lokasi Kerja:</span>
                          <span className="font-semibold text-slate-900 truncate block">{todayRecord.siteName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Jadwal Shift:</span>
                          <span className="font-semibold text-slate-900 truncate block">{todayRecord.shift}</span>
                        </div>
                      </div>
                    </div>

                    {/* Geofence checkout location check */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                          <MapPin className="w-4 h-4 text-[#0f766e]" />
                          <span>Verifikasi Radius Lokasi Pulang</span>
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-900">{simulatedDistance} meter</span>
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
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Dalam Lokasi</span>
                        <span className="font-semibold text-slate-700">Toleransi: {maxRadius}m</span>
                        <span>Luar Radius</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Pekerjaan selesai? Pastikan seluruh peralatan telah dirapikan sebelum menekan tombol Absen Pulang.
                      </span>
                    </div>
                  </div>
                ) : hasCheckedIn && hasCheckedOut ? (
                  /* SUB-CASE 2: Karyawan Sudah Masuk & Pulang Lengkap */
                  <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center space-y-2 py-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-[#0f766e] flex items-center justify-center mx-auto mb-1">
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Presensi Hari Ini Lengkap!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Anda telah menyelesaikan presensi harian untuk tanggal {todayStr}.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800">
                        Masuk: <strong>{todayRecord?.checkInTime}</strong>
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[#065f46] font-bold">
                        Pulang: <strong>{todayRecord?.checkOutTime}</strong>
                      </span>
                    </div>
                  </div>
                ) : isLeaveToday ? (
                  /* SUB-CASE 3: Sedang Cuti / Izin Hari Ini */
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2 py-6">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">Status Hari Ini: {todayRecord?.status}</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      {todayRecord?.notes || 'Tercatat izin resmi dari sistem HRIS.'}
                    </p>
                  </div>
                ) : (
                  /* SUB-CASE 4: Belum Absen (Formulir Absen Masuk Standar) */
                  <>
                    {/* Office Work Mode Selector (Only for Office / HQ) */}
                    {isOffice && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block">
                          Mode Kehadiran Kantor
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setWorkMode('WFO')}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              workMode === 'WFO'
                                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                            <span>WFO (Menara HQ)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setWorkMode('Dinas Luar')}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              workMode === 'Dinas Luar'
                                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Dinas Luar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setWorkMode('WFH')}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              workMode === 'WFH'
                                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Laptop className="w-4 h-4" />
                            <span>WFH Terjadwal</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Geofence GPS Radar Simulation Box */}
                    {(!isOffice || workMode === 'WFO') ? (
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                            <MapPin className="w-4 h-4 text-[#0f766e] shrink-0" />
                            <span>Jarak dari {currentSite.name}</span>
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

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>0m (Tengah Lokasi)</span>
                          <span className="font-semibold text-slate-700">Batas Aman: {maxRadius}m</span>
                          <span>400m (Luar)</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                            Pintasan:
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
                            25m (Dalam Lokasi)
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
                            85m (Gerbang)
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
                            250m (Luar)
                          </button>
                        </div>

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
                              <span>Posisi GPS Valid (Radius {simulatedDistance}m / Batas {maxRadius}m)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Di Luar Radius ({simulatedDistance}m)! Melebihi batas {maxRadius}m.</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900">
                        <div className="flex items-center gap-2 font-bold">
                          {workMode === 'Dinas Luar' ? <Briefcase className="w-4 h-4 text-[#0f766e]" /> : <Laptop className="w-4 h-4 text-[#0f766e]" />}
                          <span>{workMode === 'Dinas Luar' ? 'Penugasan Luar Kantor' : 'Work From Home (WFH)'}</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          {workMode === 'Dinas Luar'
                            ? 'Koordinasi instansi luar (BPN/Pemda/Mitra). Titik GPS otomatis disimpan.'
                            : 'Presensi remote WFH terjadwal.'}
                        </p>
                      </div>
                    )}

                    {/* Requirements: APD for Field vs Office Ergonomics */}
                    {isOffice ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-[#0f766e]" />
                          <div>
                            <span className="font-semibold block text-slate-900">Standar Lingkungan Kantor</span>
                            <span className="text-[10px] text-slate-500">ID Card Menara HQ · Lingkungan Ergonomis</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                          Sesuai
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block">
                          Kelengkapan APD K3 Lapangan
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
                    )}

                    {/* Notes Input */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                        {isOffice ? 'Agenda / Catatan Kerja' : 'Catatan / Area Kerja'}
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Pekerjaan harian di area penugasan"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: FORM AJUKAN IZIN / SAKIT / CUTI */}
            {modalTab === 'LEAVE' && (
              <div className="space-y-3.5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pengajuan Izin, Sakit, atau Cuti Hari Ini</span>
                    <span className="text-[11px] text-amber-800">
                      Tidak bisa hadir kerja? Laporkan status kehadiran Anda agar tercatat resmi di sistem dan terhindar dari pemotongan alpa.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Kategori Pengajuan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Izin', 'Sakit', 'Cuti', 'Dinas Luar'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLeaveType(type)}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                          leaveType === type
                            ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {type === 'Izin' ? 'Izin Keperluan' : type === 'Sakit' ? 'Sakit Medis' : type === 'Cuti' ? 'Cuti Tahunan' : 'Dinas Luar'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                    Tanggal Efektif
                  </label>
                  <input
                    type="date"
                    defaultValue={todayStr}
                    disabled
                    className="w-full h-9 px-3 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Tanggal presensi: {todayStr} (Hari Ini)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                    Alasan / Keterangan Lengkap *
                  </label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder={
                      leaveType === 'Sakit'
                        ? 'Contoh: Demam dan flu berat, istirahat di rumah sesuai anjuran dokter'
                        : leaveType === 'Cuti'
                        ? 'Contoh: Cuti tahunan keluarga yang telah dikoordinasikan dengan site manager'
                        : leaveType === 'Dinas Luar'
                        ? 'Contoh: Menghadiri rapat koordinasi tapal batas di Kantor BPN Banjarbaru'
                        : 'Contoh: Izin mengurus dokumen kependudukan mendesak'
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ACTION FOOTER (Khusus tampilan form aktif)
            ========================================================================= */}
        {!submittedRecord && (
          <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5">
            <div>
              {modalTab === 'ATTENDANCE' && !hasCheckedIn && !isWithinGeofence && (
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

              {/* ACTION BUTTON BASED ON CONTEXT */}
              {modalTab === 'LEAVE' ? (
                <button
                  type="button"
                  onClick={handleExecuteLeave}
                  disabled={!leaveReason.trim() || isProcessing}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Mengirim...' : `Kirim Laporan ${leaveType}`}</span>
                </button>
              ) : hasCheckedIn && !hasCheckedOut ? (
                /* TOMBOL ABSEN PULANG */
                <button
                  type="button"
                  onClick={handleExecuteCheckOut}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isProcessing ? 'Memproses Pulang...' : 'Konfirmasi Absen Pulang (Check-Out)'}</span>
                </button>
              ) : hasCheckedIn && hasCheckedOut ? (
                /* SUDAH LENGKAP */
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  Tutup
                </button>
              ) : (
                /* TOMBOL ABSEN MASUK */
                <button
                  type="button"
                  onClick={handleExecuteCheckIn}
                  disabled={!isWithinGeofence || isProcessing}
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    isWithinGeofence
                      ? 'text-white bg-[#0f766e] hover:bg-[#115e59] shadow-emerald-700/20 active:scale-98'
                      : 'text-slate-400 bg-slate-200 cursor-not-allowed border border-slate-300'
                  }`}
                  title={!isWithinGeofence ? 'Dekati area kerja untuk presensi' : undefined}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Memverifikasi Presensi...'
                      : !isWithinGeofence
                      ? 'Posisi di Luar Radius'
                      : isOffice
                      ? workMode === 'WFO'
                        ? 'Konfirmasi Absen Masuk Kantor'
                        : `Konfirmasi Masuk (${workMode})`
                      : 'Konfirmasi Absen Masuk (Check-In)'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
