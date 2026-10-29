'use client';
import React from 'react';
import { PropertySite, Employee, AttendanceRecord } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#0f766e] font-bold tracking-wider block">
            Laporan Kepatuhan & Analitik Operasional Triwulan IV 2026
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Audit Sumber Daya Manusia & Keselamatan Kerja Properti (SMK3)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data terintegrasi dari seluruh site proyek konstruksi dan operasional korporat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Dokumen Audit</span>
          </button>
        </div>
      </div>

      {/* Safety & Compliance Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#065f46]">
              Target K3 Zero Accident
            </span>
            <ShieldCheck className="w-5 h-5 text-[#0f766e]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#065f46] tabular-nums">
            1.240.000
          </div>
          <p className="text-[11px] text-emerald-800">
            Jam Kerja Selamat Kumulatif Tanpa Kecelakaan Fatal (Zero Lost-Time Injury)
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sertifikasi Personil K3 Proyek
            </span>
            <HardHat className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {k3Count} / {totalEmployees}
          </div>
          <p className="text-[11px] text-slate-500">
            Personil memegang sertifikat Ahli K3 Konstruksi Kemenaker RI aktif
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Estimasi Komitmen Payroll Bulanan
            </span>
            <FileCheck2 className="w-5 h-5 text-[#0f766e]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#065f46] tabular-nums">
            {FORMAT_IDR(totalPayrollEstimate)}
          </div>
          <p className="text-[11px] text-slate-500">
            Total bruto gaji pokok & tunjangan operasional seluruh kawasan
          </p>
        </div>
      </div>

      {/* Two Column Section: Project Site Distribution & Contract Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Project Sites Workforce Allocation */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0f766e]" />
              Sebaran Tenaga Kerja Lapangan Menurut Proyek
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
                        {site.category} · Radius Geofence {site.geofenceRadiusMeters}m
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {site.activeWorkforce} Personil
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
    </div>
  );
};
