'use client';
import React from 'react';
import { PropertySite, Employee, AttendanceRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { PageHeader, KPICard } from '@/components/ui';
import {
  BarChart3,
  ShieldCheck,
  Building,
  Users,
  HardHat,
  Printer,
  Download,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface ReportsViewProps {
  sites: PropertySite[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sites,
  employees,
  attendanceRecords,
}) => {
  const totalEmployees = employees.length;
  const pkwttCount = employees.filter((e) => e.contractType.includes('Tetap')).length;
  const pkwtCount = employees.filter((e) => e.contractType.includes('Kontrak')).length;
  const k3Count = employees.filter((e) => e.k3Certified).length;

  const totalPayrollEstimate = employees.reduce(
    (acc, e) => acc + e.baseSalary + e.siteAllowance + e.k3Allowance + e.transportMealAllowance,
    0
  );

  // Live attendance statistics
  const totalAttendance = attendanceRecords.length;
  const hadirCount = attendanceRecords.filter((a) => a.status === 'Hadir').length;
  const terlambatCount = attendanceRecords.filter((a) => a.status === 'Terlambat').length;
  const cutiCount = attendanceRecords.filter((a) => a.status === 'Cuti' || a.status === 'Izin Lapangan').length;
  const alpaCount = attendanceRecords.filter((a) => a.status === 'Alpa').length;
  const fieldRecords = attendanceRecords.filter((a) => a.siteId !== 'SITE-HQ' && !a.shift.includes('Kantor'));
  const ppeCompliantCount = fieldRecords.filter((a) => a.ppeCompliance).length;
  const ppeRate = fieldRecords.length > 0 ? Math.round((ppeCompliantCount / fieldRecords.length) * 100) : 100;
  const totalLateMinutes = attendanceRecords.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
  const avgLateMinutes = terlambatCount > 0 ? Math.round(totalLateMinutes / terlambatCount) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Laporan Ketenagakerjaan & K3"
        subtitle="Data terintegrasi dari seluruh lokasi proyek konstruksi perumahan dan kantor pusat."
        icon={<BarChart3 className="w-5 h-5 text-[#0f766e]" />}
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] font-mono text-[10px] font-bold border border-teal-200">
            Triwulan IV 2026
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Laporan</span>
          </button>
        }
      />

      {/* Safety & Compliance Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <KPICard
          label="Target K3 Zero Accident"
          value="1.240.000"
          unit="Jam"
          color="emerald"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          sublabel={
            <span className="text-[11px] text-emerald-800">
              Jam Kerja Selamat Kumulatif Tanpa Kecelakaan Fatal (Zero Lost-Time Injury)
            </span>
          }
        />

        <KPICard
          label="Sertifikasi K3 Karyawan"
          value={`${k3Count} / ${totalEmployees}`}
          unit="Ahli K3"
          color="amber"
          icon={<HardHat className="w-4 h-4 text-amber-500" />}
          sublabel={
            <span className="text-[11px] text-slate-500">
              Karyawan bersertifikasi Ahli K3 Konstruksi aktif
            </span>
          }
        />

        <KPICard
          label="Estimasi Total Payroll Bulanan"
          value={FORMAT_IDR(totalPayrollEstimate)}
          color="primary"
          icon={<FileCheck2 className="w-4 h-4 text-[#0f766e]" />}
          sublabel={
            <span className="text-[11px] text-slate-500">
              Total bruto gaji pokok & tunjangan operasional seluruh kawasan
            </span>
          }
        />
      </div>

      {/* Two Column Section: Project Site Distribution & Contract Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Project Sites Workforce Allocation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0f766e]" />
              Sebaran Tenaga Kerja per Proyek
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-4">
            {sites.map((site) => {
              const totalWorkers = sites.reduce((a, b) => a + b.activeWorkforce, 0);
              const percent = Math.round((site.activeWorkforce / totalWorkers) * 100);

              return (
                <div key={site.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{site.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {site.category} · Radius Lokasi {site.geofenceRadiusMeters}m
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {site.activeWorkforce} Pekerja
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ({percent}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0f766e] h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Structure & Employment Demographics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f766e]" />
              Komposisi Hubungan Kerja (PKWTT vs PKWT Proyek)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Kemenaker</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                PKWTT (Karyawan Tetap)
              </span>
              <span className="text-3xl font-extrabold font-mono text-slate-900 block my-1">
                {pkwttCount}
              </span>
              <span className="text-[11px] text-[#0f766e] font-semibold">
                {Math.round((pkwttCount / totalEmployees) * 100)}% dari Total
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                PKWT (Kontrak Proyek)
              </span>
              <span className="text-3xl font-extrabold font-mono text-slate-900 block my-1">
                {pkwtCount}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">
                {Math.round((pkwtCount / totalEmployees) * 100)}% dari Total
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800">Ketentuan Regulasi Ketenagakerjaan Properti:</p>
            <p>
              • Seluruh tenaga kerja PKWT proyek terikat klausul durasi pelaksanaan konstruksi sesuai Surat Perjanjian Pemborongan Pekerjaan.
            </p>
            <p>
              • Jaminan BPJS Ketenagakerjaan Konstruksi diwajibkan aktif 100% sebelum mobilisasi ke area lapangan.
            </p>
          </div>
        </div>
      </div>

      {/* Live Attendance Summary from actual records */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#0f766e]" />
            Rekap Kehadiran & Kepatuhan APD — Data Aktual
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live dari {totalAttendance} rekaman</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#065f46] block">Hadir Tepat Waktu</span>
            <span className="text-2xl font-extrabold font-mono text-[#065f46] block">{hadirCount}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {totalAttendance > 0 ? `${Math.round((hadirCount / totalAttendance) * 100)}%` : '-'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Terlambat</span>
            <span className="text-2xl font-extrabold font-mono text-amber-700 block">{terlambatCount}</span>
            <span className="text-[11px] text-amber-700 font-semibold">
              {terlambatCount > 0 ? `Rata-rata ${avgLateMinutes} menit` : 'Tidak ada'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Cuti & Izin</span>
            <span className="text-2xl font-extrabold font-mono text-slate-700 block">{cutiCount}</span>
            <span className="text-[11px] text-slate-600 font-semibold">
              Alpa: {alpaCount} rekaman
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#065f46] block">Kepatuhan APD Proyek</span>
            <span className="text-2xl font-extrabold font-mono text-[#065f46] block">{ppeRate}%</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {ppeCompliantCount} dari {fieldRecords.length} personil lapangan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
