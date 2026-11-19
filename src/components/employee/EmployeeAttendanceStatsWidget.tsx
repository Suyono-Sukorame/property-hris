'use client';

import React from 'react';
import { AttendanceRecord } from '@/types/hris';
import { Clock, HardHat, Calendar } from 'lucide-react';

interface EmployeeAttendanceStatsWidgetProps {
  employeeId: string;
  attendanceRecords: AttendanceRecord[];
  className?: string;
}

export const EmployeeAttendanceStatsWidget: React.FC<EmployeeAttendanceStatsWidgetProps> = ({
  employeeId,
  attendanceRecords,
  className = '',
}) => {
  const records = attendanceRecords.filter((r) => r.employeeId === employeeId);

  const totalDays = records.length;
  const hadirCount = records.filter((r) => r.status === 'Hadir').length;
  const terlambatCount = records.filter((r) => r.status === 'Terlambat').length;
  const cutiIzinCount = records.filter((r) => r.status === 'Cuti' || r.status === 'Izin Lapangan').length;
  const alpaCount = records.filter((r) => r.status === 'Alpa').length;

  const totalLateMinutes = records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
  const attendanceRate = totalDays > 0 ? Math.round(((hadirCount + terlambatCount) / totalDays) * 100) : 100;

  // K3 PPE Compliance
  const ppeRecords = records.filter((r) => r.workMode !== 'Dinas Luar');
  const ppeCompliantCount = ppeRecords.filter((r) => r.ppeCompliance).length;
  const ppeRate = ppeRecords.length > 0 ? Math.round((ppeCompliantCount / ppeRecords.length) * 100) : 100;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0f766e]" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
            Performa Presensi & Kepatuhan K3 Riil
          </h4>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#0f766e] border border-teal-200">
          {totalDays} Rekaman Absensi
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Rate Kehadiran */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Tingkat Kehadiran
          </span>
          <span className="text-xl font-black font-mono text-slate-900 block mt-0.5">
            {attendanceRate}%
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">
            {hadirCount} Hadir Tepat Waktu
          </span>
        </div>

        {/* Metric 2: Keterlambatan */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Keterlambatan
          </span>
          <span className="text-xl font-black font-mono text-amber-900 block mt-0.5">
            {totalLateMinutes} <span className="text-xs font-semibold">Mnt</span>
          </span>
          <span className="text-[10px] text-amber-700 font-medium">
            {terlambatCount > 0 ? `${terlambatCount}x terlambat` : 'Zero Late'}
          </span>
        </div>

        {/* Metric 3: Kepatuhan APD K3 */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
            <HardHat className="w-3 h-3 text-emerald-600" />
            Kepatuhan APD K3
          </span>
          <span className="text-xl font-black font-mono text-[#065f46] block mt-0.5">
            {ppeRate}%
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">
            Helm & Rompi Terverifikasi
          </span>
        </div>

        {/* Metric 4: Cuti & Izin */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Cuti & Izin Sah
          </span>
          <span className="text-xl font-black font-mono text-slate-900 block mt-0.5">
            {cutiIzinCount} <span className="text-xs font-semibold">Hari</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {alpaCount > 0 ? `${alpaCount} Alpa` : '0 Alpa'}
          </span>
        </div>
      </div>
    </div>
  );
};
