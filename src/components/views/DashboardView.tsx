'use client';

import React from 'react';
import { PropertySite, Employee, AttendanceRecord, ApprovalItem, ActiveNavModule } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge, KPICard, PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  ChevronRight,
  FileCheck,
  Banknote,
  Smartphone,
  Calendar,
  Building,
  BarChart3,
  UserCheck,
  CheckSquare,
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
  onOpenLiveCheckIn?: () => void;
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
  onOpenLiveCheckIn,
}) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'SUPER_ADMIN';

  const filteredSites =
    selectedSiteFilter === 'ALL'
      ? sites
      : sites.filter((s) => s.id === selectedSiteFilter);

  const filteredAttendance =
    selectedSiteFilter === 'ALL'
      ? attendanceRecords
      : attendanceRecords.filter((a) => a.siteId === selectedSiteFilter);

  const totalHeadcount = employees.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const presentCount = attendanceRecords.filter(
    (a) => a.status === 'Hadir' && a.date === todayStr
  ).length;
  const lateCount = attendanceRecords.filter(
    (a) => a.status === 'Terlambat' && a.date === todayStr
  ).length;
  const pendingApprovals = approvals.filter((a) => a.status.includes('Menunggu'));

  // Live KPI calculations
  const totalCheckedIn = presentCount + lateCount;

  // Format date in Indonesian
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Greeting by hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 11
      ? 'Selamat Pagi'
      : currentHour < 15
      ? 'Selamat Siang'
      : currentHour < 18
      ? 'Selamat Sore'
      : 'Selamat Malam';

  // Role-based Quick Actions for Mobile (Tanpa Presensi GPS untuk Bos & Keuangan)
  const quickActions =
    role === 'SUPER_ADMIN'
      ? [
          {
            id: 'approvals',
            label: 'Persetujuan',
            icon: CheckSquare,
            onClick: () => onNavigateModule('approvals'),
            bgColor: 'bg-amber-50 text-amber-700',
            badgeCount: pendingApprovals.length,
          },
          {
            id: 'attendance',
            label: 'Presensi Tim',
            icon: Clock,
            onClick: () => onNavigateModule('attendance'),
            bgColor: 'bg-emerald-50 text-emerald-700',
          },
          {
            id: 'payroll',
            label: 'Gaji & Kasbon',
            icon: Banknote,
            onClick: () => onNavigateModule('payroll'),
            bgColor: 'bg-indigo-50 text-indigo-700',
          },
          {
            id: 'team',
            label: 'Data Tim',
            icon: Users,
            onClick: () => onNavigateModule('employees'),
            bgColor: 'bg-teal-50 text-[#0f766e]',
          },
          {
            id: 'reports',
            label: 'Laporan',
            icon: BarChart3,
            onClick: () => onNavigateModule('reports'),
            bgColor: 'bg-slate-100 text-slate-700',
          },
        ]
      : [
          {
            id: 'attendance',
            label: 'Presensi Tim',
            icon: Clock,
            onClick: () => onNavigateModule('attendance'),
            bgColor: 'bg-emerald-50 text-emerald-700',
          },
          {
            id: 'payroll',
            label: 'Gaji & Kasbon',
            icon: Banknote,
            onClick: () => onNavigateModule('payroll'),
            bgColor: 'bg-indigo-50 text-indigo-700',
          },
          {
            id: 'approvals',
            label: 'Verifikasi',
            icon: CheckSquare,
            onClick: () => onNavigateModule('approvals'),
            bgColor: 'bg-amber-50 text-amber-700',
            badgeCount: pendingApprovals.length,
          },
          {
            id: 'team',
            label: 'Data Tim',
            icon: Users,
            onClick: () => onNavigateModule('employees'),
            bgColor: 'bg-teal-50 text-[#0f766e]',
          },
          {
            id: 'reports',
            label: 'Laporan',
            icon: BarChart3,
            onClick: () => onNavigateModule('reports'),
            bgColor: 'bg-slate-100 text-slate-700',
          },
        ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Mobile Native Greeting & Status Card */}
      <PageHeader
        variant="hero"
        title={`${greeting}, ${currentUser?.name ? currentUser.name.split(' ')[0] : 'Bapak/Ibu'} 👋`}
        subtitle={`${currentUser?.roleLabel || 'Manajemen Properti'} · ${filteredSites[0]?.name || 'Griya Bumi Raya'}`}
        badge={
          <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
        }
        actions={
          role === 'SUPER_ADMIN' ? (
            pendingApprovals.length > 0 ? (
              <button
                type="button"
                onClick={() => onNavigateModule('approvals')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>{pendingApprovals.length} Butuh Persetujuan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateModule('attendance')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>Pantau Presensi Tim</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => onNavigateModule('attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Rekap Presensi Tim</span>
            </button>
          )
        }
      />

      {/* 2. Quick Actions (Menu Cepat Native Mobile) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Cepat
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Akses Kilat</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="group flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer relative"
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs mb-1 relative ${action.bgColor}`}
              >
                <action.icon className="w-5 h-5" />
                {action.badgeCount !== undefined && action.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {action.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 truncate w-full">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Compact 2x2 KPI Grid (Glanceable on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Tim */}
        <KPICard
          label="Total Tim"
          value={totalHeadcount}
          unit="Karyawan"
          icon={<Users className="w-4 h-4 text-[#0f766e]" />}
          color="primary"
          footer={
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 font-medium truncate">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="truncate">1 Proyek Aktif</span>
            </div>
          }
        />

        {/* KPI 2: Kehadiran Hari Ini */}
        <KPICard
          label="Kehadiran"
          value={`${totalCheckedIn}/${totalHeadcount}`}
          unit="Hadir"
          icon={<Clock className="w-4 h-4 text-[#0f766e]" />}
          color="primary"
          footer={
            <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate font-mono">
              <span>Tepat: <strong className="text-slate-800">{presentCount}</strong></span>
              <span>·</span>
              <span>Telat: <strong className="text-amber-700">{lateCount}</strong></span>
            </div>
          }
        />

        {/* KPI 3: Persetujuan Menunggu */}
        <KPICard
          label="Perlu ACC"
          value={pendingApprovals.length}
          unit="Menunggu"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          color="amber"
          footer={
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-slate-500 truncate">Izin / Kasbon</span>
              <button
                type="button"
                onClick={() => onNavigateModule('approvals')}
                className="text-[#0f766e] font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0 cursor-pointer"
              >
                Lihat <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          }
        />

        {/* KPI 4: Progres Proyek */}
        <KPICard
          label="Progres Fisik"
          value={`${filteredSites[0]?.projectProgressPercentage ?? 0}%`}
          unit="Selesai"
          icon={<Building2 className="w-4 h-4 text-emerald-600" />}
          color="emerald"
          footer={
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0f766e] h-full rounded-full"
                style={{ width: `${filteredSites[0]?.projectProgressPercentage ?? 0}%` }}
              />
            </div>
          }
        />
      </div>

      {/* 4. Proyek Aktif */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f766e]" />
              Proyek Aktif
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Status proyek properti yang sedang berjalan.
            </p>
          </div>

          <button
            onClick={() => onNavigateModule('settings')}
            className="text-xs font-semibold text-[#0f766e] hover:text-[#115e59] inline-flex items-center gap-1 cursor-pointer"
          >
            Kelola <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {site.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 line-clamp-1">
                    {site.name}
                  </h3>
                </div>
                <StatusBadge
                  status={site.status === 'Konstruksi Aktif' || site.status === 'Pemasaran Aktif' ? 'Aktif' : 'Disetujui'}
                  size="sm"
                />
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1 text-slate-500 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{site.location}</span>
                </div>
                <p className="truncate">
                  Penanggung Jawab: <strong className="text-slate-800">{site.siteManager}</strong>
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

      {/* 5. Two Column Section: Live Attendance Feed & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Attendance Activity (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0f766e]" />
                Presensi Hari Ini
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Log kehadiran tim di lapangan hari ini.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('attendance')}
              className="text-xs font-semibold text-[#0f766e] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Native Card List (No horizontal scroll needed!) */}
          <div className="sm:hidden space-y-2.5">
            {filteredAttendance.slice(0, 5).map((record) => {
              const emp = employees.find((e) => e.id === record.employeeId);

              return (
                <div
                  key={record.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#0f766e]/10 text-[#0f766e] font-bold text-xs flex items-center justify-center shrink-0 border border-[#0f766e]/20">
                      {record.employeeName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {record.employeeName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{record.checkInTime} WITA</span>
                        <span>·</span>
                        <span>{record.geofenceDistanceMeters}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={record.status} size="sm" />
                    {emp && (
                      <button
                        onClick={() => onOpenEmployeeCard(emp)}
                        className="px-2 py-1 text-[10px] font-bold text-[#0f766e] bg-white border border-slate-200 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        ID Card
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Responsive Table */}
          <div className="hidden sm:block overflow-x-auto">
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
                            className="px-2 py-1 text-[11px] font-semibold text-[#0f766e] hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
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
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Persetujuan Perlu ACC
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {pendingApprovals.length} Tiket
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-center space-y-1.5 my-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-emerald-900">Semua Tiket Selesai</p>
                <p className="text-[11px] text-emerald-700">
                  Tidak ada pengajuan izin atau kasbon yang menunggu persetujuan.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingApprovals.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onOpenApproval(app)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#0f766e] hover:bg-slate-50/50 cursor-pointer transition-all text-xs"
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
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateModule('approvals')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Semua Persetujuan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon alias to prevent conflict
function CheckSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
