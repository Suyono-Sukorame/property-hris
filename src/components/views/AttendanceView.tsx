'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord, PropertySite } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, KPICard, FilterBar, SearchInput, Select, EmptyState, GeofenceBadge, SelfieThumbnail, AttendanceActionButton } from '@/components/ui';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Download,
  Search,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ClipboardEdit,
  LogOut,
  Building2,
  User,
  Users,
  FileText,
  Timer,
  Sparkles,
  CalendarCheck,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenLiveCheckIn: (tab?: 'ATTENDANCE' | 'LEAVE') => void;
  onCheckInSuccess?: (record: AttendanceRecord) => void;
  onCheckOut: (recordId: string) => void;
  onEditAttendance: (record: AttendanceRecord) => void;
  isEmployeeView?: boolean;
  canEditAttendance?: boolean;
}

type DateRangeFilter = 'today' | 'week' | 'month' | 'all';

function getDateRangeLabel(range: DateRangeFilter): string {
  const labels: Record<DateRangeFilter, string> = {
    today: 'Hari Ini',
    week: 'Minggu Ini',
    month: 'Bulan Ini',
    all: 'Semua',
  };
  return labels[range];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function isInDateRange(dateStr: string, range: DateRangeFilter): boolean {
  if (range === 'all') return true;
  const recordDate = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === 'today') {
    return recordDate >= today;
  }
  if (range === 'week') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return recordDate >= startOfWeek;
  }
  if (range === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return recordDate >= startOfMonth;
  }
  return true;
}

function calculateWorkingDuration(checkInTimeStr: string, now: Date): string {
  try {
    const cleanTime = checkInTimeStr.replace(/[^0-9:]/g, '').trim();
    const parts = cleanTime.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return '-';
    
    const checkInDate = new Date(now);
    checkInDate.setHours(parts[0], parts[1], 0, 0);
    
    const diffMs = now.getTime() - checkInDate.getTime();
    if (diffMs <= 0) return 'Baru saja masuk';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) return `${diffMins} Menit`;
    return `${diffHours} Jam ${diffMins} Menit`;
  } catch {
    return '-';
  }
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  sites,
  selectedSiteFilter,
  onOpenLiveCheckIn,
  onCheckInSuccess,
  onCheckOut,
  onEditAttendance,
  isEmployeeView = false,
  canEditAttendance = true,
}) => {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'EMPLOYEE' || isEmployeeView;
  const canMonitorTeam = !isEmployee;

  // Tab switch: 'MY_ATTENDANCE' (Presensi Saya) vs 'TEAM_MONITORING' (Monitoring Tim)
  const [activeTab, setActiveTab] = useState<'MY_ATTENDANCE' | 'TEAM_MONITORING'>(
    isEmployee ? 'MY_ATTENDANCE' : 'MY_ATTENDANCE'
  );

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Direct 1-Tap Attendance states
  const [isCheckingInDirect, setIsCheckingInDirect] = useState(false);
  const [directFeedback, setDirectFeedback] = useState<string | null>(null);

  const handleDirectCheckIn = () => {
    setIsCheckingInDirect(true);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hh}:${mm}`;

    const currentSite = sites.find((s) => s.id === (currentUser?.siteId || 'SITE-GRIYA')) || sites[0];
    const isOffice = currentSite?.category === 'Corporate Head Office' || currentSite?.id === 'SITE-HQ' || currentSite?.category === 'Kantor';

    const isLate = isOffice
      ? now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30)
      : now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const lateMinutes = isOffice
      ? isLate ? (now.getHours() - 8) * 60 + (now.getMinutes() - 30) : 0
      : isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0;

    const shiftLabel = isOffice
      ? 'Shift Kantor Pusat (08:30 - 17:30)'
      : 'Shift Proyek Pagi (07:00 - 16:00)';

    const defaultNotes = isOffice
      ? 'Presensi operasional kantor pusat'
      : 'Presensi langsung diverifikasi di area proyek';

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentUser?.employeeId || 'EMP-2025-003',
      employeeName: currentUser?.name || 'Rudi Hartono',
      jobCode: (currentUser as any)?.jobCode || 'LAP-001',
      division: (currentUser as any)?.division || 'Operasional Lapangan',
      siteId: currentSite?.id || 'SITE-GRIYA',
      siteName: currentSite?.name || currentUser?.siteName || 'Griya Bumi Raya',
      date: new Date().toISOString().slice(0, 10),
      checkInTime: `${currentTimeStr} WITA`,
      shift: shiftLabel,
      status: isLate ? 'Terlambat' : 'Hadir',
      lateMinutes,
      geofenceDistanceMeters: 0,
      geofenceVerified: true,
      biometricVerified: true,
      ppeCompliance: true,
      workMode: isOffice ? 'WFO' : 'Site Proyek',
      deviceInfo: 'Smartphone GPS Geotagged (1-Tap Direct)',
      notes: defaultNotes,
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(newRecord);
    }
    setIsCheckingInDirect(false);
    setDirectFeedback(`Presensi Masuk Berhasil! (${currentTimeStr} WITA)`);
    setTimeout(() => setDirectFeedback(null), 4000);
  };

  // Filter states for Team Monitoring
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('today');

  // Filtered records for Team Monitoring
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchSite =
      selectedSiteFilter === 'ALL' || rec.siteId === selectedSiteFilter;
    const matchStatus =
      statusFilter === 'ALL' || rec.status === statusFilter;
    const matchSearch =
      searchQuery === '' ||
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.siteName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDate = isInDateRange(rec.date, dateRange);

    return matchSite && matchStatus && matchSearch && matchDate;
  });

  // KPIs for Team Monitoring
  const countHadir = filteredRecords.filter((r) => r.status === 'Hadir').length;
  const countTerlambat = filteredRecords.filter((r) => r.status === 'Terlambat').length;
  const countCuti = filteredRecords.filter((r) => r.status === 'Cuti' || r.status === 'Izin Lapangan').length;
  
  const fieldRecords = filteredRecords.filter((r) => r.siteId !== 'SITE-HQ' && !r.shift.includes('Kantor'));
  const countPpeValid = fieldRecords.filter((r) => r.ppeCompliance).length;
  const ppeRate = fieldRecords.length > 0 ? Math.round((countPpeValid / fieldRecords.length) * 100) : 100;

  const avgLateMinutes =
    countTerlambat > 0
      ? Math.round(
          filteredRecords
            .filter((r) => r.lateMinutes > 0)
            .reduce((sum, r) => sum + r.lateMinutes, 0) / countTerlambat
        )
      : 0;

  // Personal Records Detection
  const todayStr = new Date().toISOString().slice(0, 10);
  const myRecords = attendanceRecords.filter((r) => {
    if (currentUser?.employeeId && r.employeeId === currentUser.employeeId) return true;
    if (currentUser?.name && r.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    if (currentUser?.role === 'SUPER_ADMIN' && (r.employeeId === 'EMP-2025-001' || r.employeeName.toLowerCase().includes('navyzar'))) return true;
    if (currentUser?.role === 'SITE_MANAGER' && (r.employeeId === 'EMP-2025-002' || r.employeeName.toLowerCase().includes('dewi'))) return true;
    return false;
  });

  const myTodayRecord = myRecords.find((r) => r.date === todayStr);
  const hasMyCheckIn = !!myTodayRecord && myTodayRecord.status !== 'Cuti' && myTodayRecord.status !== 'Izin Lapangan';
  const hasMyCheckOut = !!myTodayRecord?.checkOutTime && myTodayRecord.checkOutTime !== '-';
  const isMyLeave = myTodayRecord?.status === 'Cuti' || myTodayRecord?.status === 'Izin Lapangan';

  const exportAttendanceCSV = () => {
    const headers = ['ID', 'Nama', 'Site', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Terlambat (m)', 'Jarak GPS (m)', 'Helm & Rompi K3 / Mode'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      `"${r.siteName}"`,
      r.date,
      r.checkInTime,
      r.checkOutTime || '-',
      r.status,
      r.lateMinutes,
      r.geofenceDistanceMeters,
      r.siteId === 'SITE-HQ' || r.shift.includes('Kantor')
        ? (r.workMode || 'Kantor Pusat')
        : (r.ppeCompliance ? 'Lengkap' : 'Tidak Lengkap'),
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(x => x.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `rekap_absensi_lapangan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* ─── DUAL INTERFACE TAB SWITCHER (For Admin & Site Manager) ─── */}
      {canMonitorTeam && (
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('MY_ATTENDANCE')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'MY_ATTENDANCE'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Presensi Saya</span>
            {hasMyCheckIn && !hasMyCheckOut && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM_MONITORING')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'TEAM_MONITORING'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Monitoring Tim &amp; Proyek</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
              {filteredRecords.length}
            </span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: PRESENSI SAYA (PERSONAL ATTENDANCE HUB)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'MY_ATTENDANCE' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Hero Digital Clock & Interactive Check-In/Out Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header: User Identity & Location */}
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SelfieThumbnail
                    photoUrl={myTodayRecord?.photoUrl}
                    employeeName={currentUser?.name || 'Karyawan'}
                    initials={currentUser?.initials || 'ME'}
                    avatarColor={currentUser?.avatarColor || '#0f766e'}
                    size="md"
                    caption={`${currentUser?.name || 'Karyawan'} · Presensi Hari Ini`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-white truncate">
                        {currentUser?.name || 'Karyawan'}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {currentUser?.roleLabel || 'Karyawan'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {currentUser?.title || 'Staf Operasional'} ·{' '}
                      <span className="text-emerald-400">{currentUser?.siteName || 'Griya Bumi Raya'}</span>
                    </p>
                  </div>
                </div>

                {/* Digital Clock */}
                <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/10 sm:border-0">
                  <div className="flex items-center gap-1.5 sm:justify-end text-emerald-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Jam Real-Time</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {formattedTime}{' '}
                    <span className="text-xs text-slate-400 font-sans font-normal">WITA</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Body: Today's Status & Big Action Button */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* CASE 1: Belum Absen Masuk Hari Ini */}
              {!hasMyCheckIn && !isMyLeave && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-amber-900 text-xs sm:text-sm">
                        Anda Belum Melakukan Presensi Masuk Hari Ini
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Silakan catat kehadiran Anda untuk memulai jam kerja operasional di lokasi penugasan terdaftar.
                      </p>
                    </div>
                  </div>

                  {/* Main Action Buttons: Verifikasi Selfie & GPS Terpadu */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <AttendanceActionButton
                        hasCheckedIn={hasMyCheckIn}
                        hasCheckedOut={hasMyCheckOut}
                        isLeaveToday={isMyLeave}
                        onOpenCheckInModal={onOpenLiveCheckIn}
                        onCheckOut={() => myTodayRecord && onCheckOut(myTodayRecord.id)}
                        variant="hero"
                        className="w-full"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenLiveCheckIn('LEAVE')}
                      className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>Lapor Izin / Cuti</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CASE 2: Sedang Bekerja (Sudah Masuk, Belum Pulang) */}
              {hasMyCheckIn && !hasMyCheckOut && myTodayRecord && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-950 text-xs sm:text-sm">
                          Status Hari Ini: Sedang Bekerja
                        </span>
                        <StatusBadge status={myTodayRecord.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                        <Timer className="w-4 h-4 text-[#0f766e]" />
                        <span>Durasi: <strong>{calculateWorkingDuration(myTodayRecord.checkInTime, currentTime)}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Jam Masuk</span>
                        <span className="font-mono text-sm font-bold text-slate-900">{myTodayRecord.checkInTime}</span>
                        <span className="text-[10px] text-slate-400 block">WITA</span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Jam Pulang</span>
                        <span className="text-xs font-semibold text-amber-700 block mt-0.5">Belum Absen Pulang</span>
                        <span className="text-[10px] text-slate-400 block">Aktif</span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Lokasi GPS</span>
                        <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{myTodayRecord.siteName}</span>
                        <div className="mt-1">
                          <GeofenceBadge
                            distanceMeters={myTodayRecord.geofenceDistanceMeters}
                            verified={myTodayRecord.geofenceVerified}
                            compact
                          />
                        </div>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Jadwal Shift</span>
                        <span className="text-xs font-medium text-slate-800 truncate block mt-0.5">{myTodayRecord.shift}</span>
                        <span className="text-[10px] text-slate-500 block">Penugasan Resmi</span>
                      </div>
                    </div>
                  </div>

                  {/* Check-Out Button (Primary Action) */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => onCheckOut(myTodayRecord.id)}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-[#0f766e] hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Absen Pulang Sekarang (Check-Out)</span>
                    </button>

                    {canEditAttendance && (
                      <button
                        type="button"
                        onClick={() => onEditAttendance(myTodayRecord)}
                        className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ClipboardEdit className="w-4 h-4" />
                        <span>Koreksi Presensi</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* CASE 3: Presensi Hari Ini Lengkap & Selesai */}
              {hasMyCheckIn && hasMyCheckOut && myTodayRecord && (
                <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-3 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-[#0f766e] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Presensi Hari Ini Selesai &amp; Lengkap!
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Terima kasih atas kerja keras Anda hari ini. Selamat beristirahat!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end gap-2 font-mono text-xs">
                      <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800">
                        Masuk: <strong>{myTodayRecord.checkInTime}</strong>
                      </span>
                      <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-emerald-800 font-bold">
                        Pulang: <strong>{myTodayRecord.checkOutTime}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 4: Izin / Cuti Hari Ini */}
              {isMyLeave && myTodayRecord && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Status Hari Ini: {myTodayRecord.status}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {myTodayRecord.notes || 'Pengajuan izin resmi telah tercatat di sistem.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Attendance History Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0f766e]" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Riwayat Presensi Saya
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {myRecords.length} Catatan Tersimpan
              </span>
            </div>

            {myRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-500 text-xs">Belum ada rekaman riwayat presensi</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRecords.map((rec) => (
                  <div key={rec.id} className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rec.date}</span>
                        <StatusBadge status={rec.status} size="sm" />
                        {rec.lateMinutes > 0 && (
                          <span className="text-[10px] font-mono text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                            +{rec.lateMinutes} mnt
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {rec.siteName} · <span className="font-mono text-slate-400">{rec.shift}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-slate-800">
                        Masuk: <strong className="text-slate-900">{rec.checkInTime}</strong>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-700">
                        {rec.checkOutTime && rec.checkOutTime !== '-' ? `Pulang: ${rec.checkOutTime}` : (
                          <span className="text-amber-600 font-medium">Belum Checkout</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: MONITORING TIM & PROYEK (ADMIN & SITE MANAGER)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'TEAM_MONITORING' && canMonitorTeam && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Metrics Row — live computed */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Hadir Tepat Waktu */}
            <KPICard
              label="Hadir Tepat Waktu"
              value={countHadir}
              unit="Org"
              icon={<CheckCircle className="w-4 h-4 text-[#0f766e]" />}
              color="primary"
              sublabel={<span className="text-[10px] text-slate-400">Presensi di lokasi terdaftar</span>}
            />

            {/* Terlambat */}
            <KPICard
              label="Terlambat"
              value={countTerlambat}
              unit="Org"
              icon={<Clock className="w-4 h-4 text-amber-500" />}
              color="amber"
              sublabel={
                <span className="text-[10px] text-amber-700 font-medium">
                  {countTerlambat > 0 ? `Rata-rata +${avgLateMinutes} mnt` : 'Tepat waktu semua'}
                </span>
              }
            />

            {/* Cuti & Izin */}
            <KPICard
              label="Cuti & Izin"
              value={countCuti}
              unit="Org"
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
              color="slate"
              sublabel={<span className="text-[10px] text-slate-400">Dengan surat tugas resmi</span>}
            />

            {/* Kepatuhan Helm & Rompi K3 */}
            <KPICard
              label="Helm & Rompi K3"
              value={`${ppeRate}%`}
              unit={`(${countPpeValid}/${fieldRecords.length})`}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
              color="emerald"
              sublabel={<span className="text-[10px] text-slate-400">Helm + Rompi K3 diverifikasi</span>}
            />
          </div>

          {/* Control Strip */}
          <FilterBar
            summary={
              <span className="text-slate-500 text-xs">
                Total: <strong className="text-slate-800">{filteredRecords.length}</strong> catatan
              </span>
            }
            actions={
              <button
                type="button"
                onClick={exportAttendanceCSV}
                title="Ekspor CSV"
                className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            }
          >
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama karyawan, proyek, atau jabatan tim..."
              className="w-full md:w-72"
            />

            {/* Date Range Pills */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-0.5 min-w-0 overflow-x-auto no-scrollbar">
              {(['today', 'week', 'month', 'all'] as DateRangeFilter[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={`shrink-0 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    dateRange === range
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {getDateRangeLabel(range)}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              ariaLabel="Filter Status Kehadiran"
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'Hadir', label: 'Hadir' },
                { value: 'Terlambat', label: 'Terlambat' },
                { value: 'Cuti', label: 'Cuti' },
                { value: 'Izin Lapangan', label: 'Izin Lapangan' },
                { value: 'Alpa', label: 'Alpa' },
              ]}
              className="w-full sm:w-auto"
            />
          </FilterBar>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="px-4">Karyawan</th>
                    <th className="px-4">Lokasi Proyek</th>
                    <th className="px-4">Masuk / Pulang</th>
                    <th className="px-4">Shift Kerja</th>
                    <th className="px-4">Status &amp; Telat</th>
                    <th className="px-4">Radius GPS</th>
                    <th className="px-4">Helm &amp; Rompi K3</th>
                    <th className="px-4">Keterangan</th>
                    <th className="px-4 text-center">{canEditAttendance ? 'Aksi Admin' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <EmptyState
                      variant="table"
                      colSpan={9}
                      icon={<Calendar className="w-8 h-8 text-slate-300" />}
                      title="Tidak ada rekaman presensi tim"
                      message="Coba ubah filter periode atau status kehadiran."
                    />
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                        <td className="px-4">
                          <div className="flex items-center gap-2.5">
                            <SelfieThumbnail
                              photoUrl={record.photoUrl}
                              employeeName={record.employeeName}
                              initials={getInitials(record.employeeName)}
                              size="sm"
                              caption={`${record.employeeName} · ${record.shift} (${record.checkInTime})`}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{record.employeeName}</div>
                              <div className="font-mono text-[10px] text-slate-400">{record.jobCode}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 text-slate-700 truncate max-w-42.5">
                          <div className="font-medium text-slate-800 truncate">{record.siteName}</div>
                          <span className="text-[10px] text-slate-400">Area Proyek</span>
                        </td>

                        <td className="px-4 font-mono text-slate-800">
                          <div>
                            Masuk: <strong className="text-slate-900">{record.checkInTime}</strong>
                          </div>
                          {record.checkOutTime && record.checkOutTime !== '-' ? (
                            <div className="text-[10px] text-emerald-700 font-semibold">
                              Pulang: {record.checkOutTime}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 font-medium">
                              Sedang Bekerja
                            </div>
                          )}
                        </td>

                        <td className="px-4 text-slate-600 text-[11px] truncate max-w-37.5">
                          {record.shift}
                        </td>

                        <td className="px-4">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={record.status} size="sm" />
                            {record.lateMinutes > 0 && (
                              <span className="text-[10px] font-mono text-amber-700 font-semibold">
                                +{record.lateMinutes} menit
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4">
                          <GeofenceBadge
                            distanceMeters={record.geofenceDistanceMeters}
                            verified={record.geofenceVerified}
                            compact
                          />
                        </td>

                        <td className="px-4">
                          {record.siteId === 'SITE-HQ' || record.shift.includes('Kantor') ? (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-700 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                <Building2 className="w-3.5 h-3.5 text-[#0f766e]" />
                                {record.workMode || 'Kantor Pusat'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px]">
                              {record.ppeCompliance ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  Lengkap
                                </span>
                              ) : (
                                <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Tidak Lengkap
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 block truncate max-w-32.5">
                            {record.deviceInfo}
                          </span>
                        </td>

                        <td className="px-4 text-slate-600 text-[11px] max-w-45 truncate" title={record.notes}>
                          {record.notes || '-'}
                        </td>

                        <td className="px-4 text-center">
                          {canEditAttendance ? (
                            <button
                              onClick={() => onEditAttendance(record)}
                              title="Koreksi Data Presensi (Admin)"
                              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <ClipboardEdit className="w-3.5 h-3.5 text-slate-600" />
                              <span>Koreksi</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Tercatat</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>
                Menampilkan {filteredRecords.length} rekaman ·{' '}
                <span className="font-semibold text-slate-700">{getDateRangeLabel(dateRange)}</span>
              </span>
              <span className="font-mono text-[11px]">Verifikasi Radius GPS &amp; Standar K3 Lapangan</span>
            </div>
          </div>

          {/* Mobile Card Feed (hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {filteredRecords.length === 0 ? (
              <EmptyState
                variant="card"
                icon={<Calendar className="w-8 h-8 text-slate-300" />}
                title="Tidak ada rekaman presensi tim"
                message="Coba ubah filter periode atau status kehadiran."
              />
            ) : (
              filteredRecords.map((record) => {
                const isOffice = record.siteId === 'SITE-HQ' || record.shift.includes('Kantor');
                return (
                  <div key={record.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Card Header */}
                    <div className="flex items-center gap-3 p-3.5 border-b border-slate-100">
                      <SelfieThumbnail
                        photoUrl={record.photoUrl}
                        employeeName={record.employeeName}
                        initials={getInitials(record.employeeName)}
                        size="md"
                        caption={`${record.employeeName} · ${record.shift} (${record.checkInTime})`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{record.employeeName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-400">{record.jobCode}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[10px] text-slate-500 truncate">{record.siteName}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <StatusBadge status={record.status} size="sm" />
                        {record.lateMinutes > 0 && (
                          <span className="text-[10px] font-mono text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                            +{record.lateMinutes} mnt
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body — Time & Location */}
                    <div className="px-3.5 py-3 grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Masuk</span>
                        <span className="font-mono text-sm font-bold text-slate-900">{record.checkInTime}</span>
                        <span className="text-[10px] text-slate-400 block">WITA</span>
                      </div>
                      <div className={`rounded-lg p-2.5 ${record.checkOutTime && record.checkOutTime !== '-' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Pulang</span>
                        {record.checkOutTime && record.checkOutTime !== '-' ? (
                          <>
                            <span className="font-mono text-sm font-bold text-emerald-800">{record.checkOutTime}</span>
                            <span className="text-[10px] text-emerald-600 block">WITA</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-amber-700">Sedang</span>
                            <span className="text-[10px] text-amber-500 block">Bekerja (Belum Pulang)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Info Strip: GPS + APD + Shift */}
                    <div className="px-3.5 pb-3 flex flex-wrap items-center gap-2">
                      <GeofenceBadge
                        distanceMeters={record.geofenceDistanceMeters}
                        verified={record.geofenceVerified}
                        compact
                      />

                      {isOffice ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Building2 className="w-3 h-3" />
                          <span>{record.workMode || 'Kantor Pusat'}</span>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                          record.ppeCompliance
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Helm & Rompi {record.ppeCompliance ? 'Lengkap' : 'Belum Lengkap'}</span>
                        </div>
                      )}

                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        <Clock className="w-3 h-3" />
                        <span className="truncate max-w-28">{record.shift}</span>
                      </div>
                    </div>

                    {/* Admin Action Bar (No accidental "Absen Pulang" for others) */}
                    {canEditAttendance && (
                      <div className="px-3.5 pb-3.5">
                        <button
                          onClick={() => onEditAttendance(record)}
                          title="Koreksi Data Presensi (Admin)"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-200 cursor-pointer"
                        >
                          <ClipboardEdit className="w-4 h-4 text-slate-600" />
                          <span>Koreksi Data Presensi Staf</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {filteredRecords.length > 0 && (
              <p className="text-center text-[11px] text-slate-400 pb-1">
                {filteredRecords.length} rekaman ·{' '}
                <span className="font-semibold text-slate-500">{getDateRangeLabel(dateRange)}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
