'use client';
import React from 'react';
import { PropertySite, Employee, AttendanceRecord, ApprovalItem, ActiveNavModule } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HardHat,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

interface DashboardViewProps {
  sites: PropertySite[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  approvals: ApprovalItem[];
  selectedSiteFilter: string;
  onNavigateModule: (module: ActiveNavModule) => void;
  onOpenEmployeeCard: (emp: Employee) => void;
  onOpenApproval: (item: ApprovalItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sites,
  employees,
  attendanceRecords,
  approvals,
  selectedSiteFilter,
  onNavigateModule,
  onOpenEmployeeCard,
  onOpenApproval,
}) => {
  const filteredSites =
    selectedSiteFilter === 'ALL'
      ? sites
      : sites.filter((s) => s.id === selectedSiteFilter);

  const filteredAttendance =
    selectedSiteFilter === 'ALL'
      ? attendanceRecords
      : attendanceRecords.filter((a) => a.siteId === selectedSiteFilter);

  const totalHeadcount = sites.reduce((acc, s) => acc + s.activeWorkforce, 0);
  const presentCount = attendanceRecords.filter((a) => a.status === 'Hadir').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'Terlambat').length;
  const pendingApprovals = approvals.filter((a) => a.status.includes('Menunggu'));

  return (
    <div className="space-y-6">
      {/* Executive KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Tenaga Kerja
            </span>
            <Users className="w-4 h-4 text-[#0f766e]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalHeadcount}
            </span>
            <span className="text-xs text-slate-500">Karyawan</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14 Pekerja Minggu Ini</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Tingkat Kehadiran Harian
            </span>
            <Clock className="w-4 h-4 text-[#0f766e]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              96.4%
            </span>
            <span className="text-xs text-emerald-700 font-medium">Hadir Tepat Waktu</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500">
            <span>Hadir: <strong className="text-slate-800">{presentCount}</strong></span>
            <span>·</span>
            <span>Terlambat: <strong className="text-amber-700">{lateCount}</strong></span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-amber-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Perlu Persetujuan
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {pendingApprovals.length}
            </span>
            <span className="text-xs text-slate-500">Menunggu</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-rose-700 font-semibold">1 Prioritas Kritis (Cor Beton)</span>
            <button
              onClick={() => onNavigateModule('approvals')}
              className="text-[#0f766e] font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Kepatuhan APD & K3
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#065f46] tabular-nums">
              100%
            </span>
            <span className="text-xs text-emerald-700 font-medium">SMK3 Terverifikasi</span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Nol Insiden Kerja (Zero Accident)</span>
          </div>
        </div>
      </div>

      {/* Property Sites Operational Grid */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0f766e]" />
              Status Proyek & Tenaga Kerja
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan jumlah tenaga kerja dan progres konstruksi di setiap lokasi aktif.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('settings')}
            className="text-xs font-semibold text-[#0f766e] hover:text-[#115e59] inline-flex items-center gap-1"
          >
            Kelola Radius Proyek <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {site.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">
                    {site.name}
                  </h3>
                </div>
                <StatusBadge status={site.status === 'Konstruksi Aktif' ? 'Aktif' : 'Disetujui'} size="sm" />
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1 text-slate-500 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{site.location}</span>
                </div>
                <p className="truncate">
                  Site Manager: <strong className="text-slate-800">{site.siteManager}</strong>
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 mb-1">
                  <span>Progres Konstruksi</span>
                  <span className="font-mono text-slate-900">{site.projectProgressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0f766e] h-full rounded-full"
                    style={{ width: `${site.projectProgressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Tenaga Kerja:</span>
                <span className="font-mono font-bold text-slate-900">
                  {site.activeWorkforce} Pekerja
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Live Attendance Feed & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0f766e]" />
                Log Presensi & Lokasi GPS Hari Ini
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pencatatan real-time kehadiran karyawan dan kelengkapan APD di proyek.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('attendance')}
              className="text-xs font-semibold text-[#0f766e] hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua Presensi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="h-9 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="px-3">Karyawan</th>
                  <th className="px-3">Lokasi Proyek</th>
                  <th className="px-3">Jam Masuk</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Jarak GPS</th>
                  <th className="px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.slice(0, 5).map((record) => {
                  const emp = employees.find((e) => e.id === record.employeeId);

                  return (
                    <tr key={record.id} className="h-12 hover:bg-slate-50/70 transition-colors">
                      <td className="px-3">
                        <div className="font-semibold text-slate-900">{record.employeeName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{record.jobCode}</div>
                      </td>
                      <td className="px-3 text-slate-700 truncate max-w-37.5">
                        {record.siteName}
                      </td>
                      <td className="px-3 font-mono font-medium text-slate-800">
                        {record.checkInTime}
                      </td>
                      <td className="px-3">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                      <td className="px-3 font-mono text-slate-600">
                        {record.geofenceDistanceMeters}m
                      </td>
                      <td className="px-3 text-right">
                        {emp && (
                          <button
                            onClick={() => onOpenEmployeeCard(emp)}
                            className="px-2 py-1 text-[11px] font-semibold text-[#0f766e] hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-colors"
                          >
                            ID Card
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals Card (1 Col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Persetujuan Mendesak
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {pendingApprovals.length} Tiket
              </span>
            </div>

            <div className="space-y-3">
              {pendingApprovals.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onOpenApproval(app)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-[#0f766e] hover:bg-slate-50/50 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      {app.ticketNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {app.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">
                    {app.type}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Pemohon: {app.employeeName} ({app.siteName})
                  </p>
                  {app.costEstimate && (
                    <p className="text-[11px] font-mono text-[#065f46] font-semibold mt-1">
                      Alokasi: {FORMAT_IDR(app.costEstimate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateModule('approvals')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Lihat Semua Persetujuan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
