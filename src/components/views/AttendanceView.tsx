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
  Filter,
} from 'lucide-react';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenLiveCheckIn: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  sites,
  selectedSiteFilter,
  onOpenLiveCheckIn,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

    return matchSite && matchStatus && matchSearch;
  });

  const countHadir = attendanceRecords.filter((r) => r.status === 'Hadir').length;
  const countTerlambat = attendanceRecords.filter((r) => r.status === 'Terlambat').length;
  const countCuti = attendanceRecords.filter((r) => r.status === 'Cuti' || r.status === 'Izin Lapangan').length;
  const countPpeValid = attendanceRecords.filter((r) => r.ppeCompliance).length;

  const exportAttendanceCSV = () => {
    const headers = ['ID', 'Nama', 'Site', 'Jam Masuk', 'Jam Pulang', 'Status', 'Terlambat (m)', 'Jarak GPS (m)', 'APD K3'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      `"${r.siteName}"`,
      r.checkInTime,
      r.checkOutTime || '-',
      r.status,
      r.lateMinutes,
      r.geofenceDistanceMeters,
      r.ppeCompliance ? 'Lengkap' : 'Tidak',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(x => x.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `rekap_absensi_lapangan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Hadir Tepat Waktu
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
              {countHadir}
            </span>
            <span className="text-xs text-slate-500">Karyawan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Check-in di dalam radius lokasi
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-amber-500 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Terlambat
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {countTerlambat}
            </span>
            <span className="text-xs text-slate-500">Karyawan</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-2">
            Rata-rata selisih 14 menit
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-slate-400 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Cuti & Izin
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
              {countCuti}
            </span>
            <span className="text-xs text-slate-500">Terjadwal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Dengan surat tugas & delegasi
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-emerald-600 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Kepatuhan APD & K3
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#065f46] tabular-nums">
              {countPpeValid}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Tervalidasi (100%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Helm + Rompi Reflektif diverifikasi
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, proyek, atau jabatan..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter Status Kehadiran"
            className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
          >
            <option value="ALL">Semua Status Presensi</option>
            <option value="Hadir">Hadir</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Cuti">Cuti</option>
          </select>

          <button
            onClick={exportAttendanceCSV}
            className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Log CSV</span>
          </button>

          <button
            onClick={onOpenLiveCheckIn}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Presensi GPS Sekarang</span>
          </button>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                <th className="px-4">Karyawan</th>
                <th className="px-4">Lokasi Proyek</th>
                <th className="px-4">Waktu Presensi</th>
                <th className="px-4">Shift Kerja</th>
                <th className="px-4">Status & Telat</th>
                <th className="px-4">Radius GPS</th>
                <th className="px-4">Kelengkapan APD</th>
                <th className="px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                  <td className="px-4">
                    <div className="font-bold text-slate-900">{record.employeeName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{record.jobCode}</div>
                  </td>

                  <td className="px-4 text-slate-700 truncate max-w-42.5">
                    <div className="font-medium text-slate-800 truncate">{record.siteName}</div>
                    <span className="text-[10px] text-slate-400">Area Proyek</span>
                  </td>

                  <td className="px-4 font-mono font-medium text-slate-800">
                    <div>Masuk: <strong className="text-slate-900">{record.checkInTime}</strong></div>
                    {record.checkOutTime && (
                      <div className="text-[10px] text-slate-500">Keluar: {record.checkOutTime}</div>
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
                    <div className="flex items-center gap-1 text-[11px]">
                      {record.ppeCompliance ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Lengkap
                        </span>
                      ) : (
                        <span className="text-slate-400">Non-Site</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate max-w-32.5">
                      {record.deviceInfo}
                    </span>
                  </td>

                  <td className="px-4 text-slate-600 text-[11px] max-w-45 truncate" title={record.notes}>
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Menampilkan {filteredRecords.length} rekaman presensi harian</span>
          <span className="font-mono text-[11px]">Verifikasi Radius GPS & Standar K3 Lapangan</span>
        </div>
      </div>
    </div>
  );
};
