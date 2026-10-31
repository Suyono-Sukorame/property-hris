'use client';
import React, { useState } from 'react';
import { AttendanceRecord, PropertySite } from '@/types/hris';
import { StatusBadge } from '@/components/ui';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ClipboardEdit,
  LogOut,
  Building2,
} from 'lucide-react';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenLiveCheckIn: () => void;
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

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  sites,
  selectedSiteFilter,
  onOpenLiveCheckIn,
  onCheckOut,
  onEditAttendance,
  isEmployeeView = false,
  canEditAttendance = true,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('today');

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

  // KPIs — computed live from filtered records
  const countHadir = filteredRecords.filter((r) => r.status === 'Hadir').length;
  const countTerlambat = filteredRecords.filter((r) => r.status === 'Terlambat').length;
  const countCuti = filteredRecords.filter((r) => r.status === 'Cuti' || r.status === 'Izin Lapangan').length;
  
  // PPE Compliance is evaluated strictly for field site personnel
  const fieldRecords = filteredRecords.filter((r) => r.siteId !== 'SITE-HQ' && !r.shift.includes('Kantor'));
  const countPpeValid = fieldRecords.filter((r) => r.ppeCompliance).length;
  const ppeRate = fieldRecords.length > 0 ? Math.round((countPpeValid / fieldRecords.length) * 100) : 100;
  const officeRecords = filteredRecords.filter((r) => r.siteId === 'SITE-HQ' || r.shift.includes('Kantor'));

  const avgLateMinutes =
    countTerlambat > 0
      ? Math.round(
          filteredRecords
            .filter((r) => r.lateMinutes > 0)
            .reduce((sum, r) => sum + r.lateMinutes, 0) / countTerlambat
        )
      : 0;

  const exportAttendanceCSV = () => {
    const headers = ['ID', 'Nama', 'Site', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Terlambat (m)', 'Jarak GPS (m)', 'APD K3 / Mode'];
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

  return (
    <div className="space-y-4">

      {/* ─── Metric Grid: 2x2 on mobile, 4 cols on desktop ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Hadir Tepat Waktu */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">
              Hadir Tepat Waktu
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-800 tabular-nums leading-none">
              {countHadir}
            </span>
            <span className="text-[11px] text-slate-500">Org</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight hidden sm:block">
            Presensi di lokasi terdaftar
          </p>
        </div>

        {/* Terlambat */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 border-t-2 border-t-amber-500 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">
              Terlambat
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums leading-none">
              {countTerlambat}
            </span>
            <span className="text-[11px] text-slate-500">Org</span>
          </div>
          <p className="text-[10px] text-amber-700 font-medium mt-1.5 leading-tight hidden sm:block">
            {countTerlambat > 0 ? `Rata-rata +${avgLateMinutes} mnt` : 'Tepat waktu semua'}
          </p>
        </div>

        {/* Cuti & Izin */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 border-t-2 border-t-slate-400 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">
              Cuti &amp; Izin
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-700 tabular-nums leading-none">
              {countCuti}
            </span>
            <span className="text-[11px] text-slate-500">Org</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight hidden sm:block">
            Dengan surat tugas resmi
          </p>
        </div>

        {/* Kepatuhan APD */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 border-t-2 border-t-emerald-600 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">
              APD Lapangan
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#065f46] tabular-nums leading-none">
              {ppeRate}%
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              ({countPpeValid}/{fieldRecords.length})
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight hidden sm:block">
            Helm + Rompi K3 diverifikasi
          </p>
        </div>
      </div>

      {/* ─── Hero GPS Action Button (Mobile Only) ─── */}
      <button
        onClick={onOpenLiveCheckIn}
        className="md:hidden w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-linear-to-r from-[#0f766e] to-emerald-500 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-transform"
      >
        <Smartphone className="w-5 h-5" />
        <span>Presensi GPS Sekarang</span>
      </button>

      {/* ─── Control Strip ─── */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, proyek, atau jabatan..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
          />
        </div>

        {/* Row 2: Filters + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Pills */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
            {(['today', 'week', 'month', 'all'] as DateRangeFilter[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`shrink-0 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter Status Kehadiran"
            className="h-9 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Cuti">Cuti</option>
            <option value="Izin Lapangan">Izin Lapangan</option>
            <option value="Alpa">Alpa</option>
          </select>

          {/* Export CSV — icon-only on mobile, label on desktop */}
          <button
            onClick={exportAttendanceCSV}
            title="Ekspor CSV"
            className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          {/* GPS Button — desktop only (mobile has hero button above) */}
          <button
            onClick={onOpenLiveCheckIn}
            className="hidden md:inline-flex h-9 items-center gap-1.5 px-3.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Presensi GPS Sekarang</span>
          </button>
        </div>
      </div>

      {/* ─── Desktop Table (hidden on mobile) ─── */}
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
                <th className="px-4">APD K3</th>
                <th className="px-4">Keterangan</th>
                <th className="px-4 text-center">{canEditAttendance ? 'Aksi Admin' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-500">Tidak ada rekaman presensi</p>
                    <p className="text-[11px] mt-0.5">Coba ubah filter periode atau status</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4">
                      <div className="font-bold text-slate-900">{record.employeeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{record.jobCode}</div>
                    </td>

                    <td className="px-4 text-slate-700 truncate max-w-42.5">
                      <div className="font-medium text-slate-800 truncate">{record.siteName}</div>
                      <span className="text-[10px] text-slate-400">Area Proyek</span>
                    </td>

                    <td className="px-4 font-mono text-slate-800">
                      <div>
                        Masuk: <strong className="text-slate-900">{record.checkInTime}</strong>
                      </div>
                      {record.checkOutTime ? (
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Pulang: {record.checkOutTime}
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-600 font-medium">
                          Belum absen pulang
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
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          record.geofenceVerified ? 'bg-[#0f766e]' : 'bg-rose-500'
                        }`} />
                        <span className="font-mono text-slate-700 font-semibold tabular-nums">
                          {record.geofenceDistanceMeters}m
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {record.geofenceVerified ? 'Dalam Radius' : 'Luar Radius'}
                      </span>
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
                      <div className="flex items-center justify-center gap-1.5">
                        {!record.checkOutTime && (
                          <button
                            onClick={() => onCheckOut(record.id)}
                            title="Catat Absen Pulang Sekarang"
                            className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Pulang</span>
                          </button>
                        )}
                        {canEditAttendance && (
                          <button
                            onClick={() => onEditAttendance(record)}
                            title="Koreksi Data Presensi (Admin)"
                            className="p-1.5 rounded-md text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <ClipboardEdit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!canEditAttendance && record.checkOutTime && (
                          <span className="text-[11px] text-emerald-600 font-medium">Selesai</span>
                        )}
                      </div>
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

      {/* ─── Mobile Card Feed (hidden on desktop) ─── */}
      <div className="md:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500 text-sm">Tidak ada rekaman presensi</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah filter periode atau status</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isOffice = record.siteId === 'SITE-HQ' || record.shift.includes('Kantor');
            return (
              <div key={record.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center gap-3 p-3.5 border-b border-slate-100">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0f766e]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#0f766e]">
                      {getInitials(record.employeeName)}
                    </span>
                  </div>
                  {/* Name & Code */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{record.employeeName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-400">{record.jobCode}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-500 truncate">{record.siteName}</span>
                    </div>
                  </div>
                  {/* Status Badge */}
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
                  {/* Check In */}
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Masuk</span>
                    <span className="font-mono text-sm font-bold text-slate-900">{record.checkInTime}</span>
                    <span className="text-[10px] text-slate-400 block">WIB</span>
                  </div>
                  {/* Check Out */}
                  <div className={`rounded-lg p-2.5 ${record.checkOutTime ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Pulang</span>
                    {record.checkOutTime ? (
                      <>
                        <span className="font-mono text-sm font-bold text-emerald-800">{record.checkOutTime}</span>
                        <span className="text-[10px] text-emerald-600 block">WIB</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-amber-700">Belum</span>
                        <span className="text-[10px] text-amber-500 block">Absen Pulang</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Strip: GPS + APD + Shift */}
                <div className="px-3.5 pb-3 flex flex-wrap gap-2">
                  {/* GPS Distance */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                    record.geofenceVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <MapPin className="w-3 h-3" />
                    <span>{record.geofenceDistanceMeters}m</span>
                    <span className="font-normal opacity-75">
                      {record.geofenceVerified ? '· Dalam Radius' : '· Luar Radius'}
                    </span>
                  </div>

                  {/* APD / Work Mode */}
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
                      <span>APD {record.ppeCompliance ? 'Lengkap' : 'Tidak Lengkap'}</span>
                    </div>
                  )}

                  {/* Shift */}
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    <Clock className="w-3 h-3" />
                    <span className="truncate max-w-28">{record.shift}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {(!record.checkOutTime || canEditAttendance) && (
                  <div className="px-3.5 pb-3.5 flex gap-2">
                    {!record.checkOutTime && (
                      <button
                        onClick={() => onCheckOut(record.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-[0.98] transition-all shadow-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Absen Pulang</span>
                      </button>
                    )}
                    {canEditAttendance && (
                      <button
                        onClick={() => onEditAttendance(record)}
                        title="Koreksi Data Presensi (Admin)"
                        className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-200 ${!record.checkOutTime ? 'shrink-0' : 'flex-1'}`}
                      >
                        <ClipboardEdit className="w-4 h-4" />
                        <span>Koreksi</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Completed state — no actions needed */}
                {!canEditAttendance && record.checkOutTime && (
                  <div className="px-3.5 pb-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Presensi Hari Ini Selesai</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Mobile footer count */}
        {filteredRecords.length > 0 && (
          <p className="text-center text-[11px] text-slate-400 pb-1">
            {filteredRecords.length} rekaman ·{' '}
            <span className="font-semibold text-slate-500">{getDateRangeLabel(dateRange)}</span>
          </p>
        )}
      </div>

    </div>
  );
};
