import React from 'react';
import { AttendanceRecord, Employee } from '@/types/hris';
import { StatusBadge } from './StatusBadge';
import { GeofenceBadge } from '@/components/attendance';
import {
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Phone,
  MessageCircle,
  CreditCard,
  Building,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

interface AttendanceItemCardProps {
  employee: Employee;
  record?: AttendanceRecord;
  isAbsent?: boolean;
  onOpenEmployeeCard?: (emp: Employee) => void;
  onEditAttendance?: (record: AttendanceRecord) => void;
  className?: string;
}

export const AttendanceItemCard: React.FC<AttendanceItemCardProps> = ({
  employee,
  record,
  isAbsent = false,
  onOpenEmployeeCard,
  onEditAttendance,
  className = '',
}) => {
  // 1. KASUS KARYAWAN BELUM ABSEN (ALPA / BELUM MASUK HARI INI)
  if (isAbsent || !record) {
    const cleanPhone = employee.phone.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=Halo%20${encodeURIComponent(
      employee.name
    )},%20apakah%20sudah%20di%20lokasi%20proyek%20hari%20ini%3F%20Mohon%20segera%20lakukan%20presensi%20di%20aplikasi.`;

    return (
      <div
        className={`p-3 sm:p-3.5 rounded-2xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs relative"
            style={{ backgroundColor: employee.avatarColor || '#e11d48' }}
          >
            {employee.initials}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-200" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {employee.name}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                Belum Check-In
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              <span>{employee.jobCode}</span>
              <span>·</span>
              <span className="text-slate-600 truncate">{employee.division}</span>
              <span>·</span>
              <span className="text-slate-600 truncate">{employee.siteName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Absent Workers */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Hubungi WA</span>
          </a>

          {onOpenEmployeeCard && (
            <button
              type="button"
              onClick={() => onOpenEmployeeCard(employee)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Lihat Profil & ID Card"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. KASUS KARYAWAN SUDAH ABSEN (HADIR / TERLAMBAT / CUTI)
  const isCheckedOut = Boolean(record.checkOutTime);
  const isNear = record.geofenceDistanceMeters <= 100;

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs relative"
          style={{ backgroundColor: employee.avatarColor || '#0f766e' }}
        >
          {employee.initials}
          <span
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ring-1 ${
              record.status === 'Hadir'
                ? 'bg-emerald-500 ring-emerald-200'
                : record.status === 'Terlambat'
                ? 'bg-amber-500 ring-amber-200'
                : 'bg-slate-400 ring-slate-200'
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              {record.employeeName}
            </span>
            <StatusBadge status={record.status} size="sm" />
            {record.status === 'Terlambat' && record.lateMinutes > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                +{record.lateMinutes}m
              </span>
            )}
          </div>

          {/* Jam Masuk & Jam Pulang */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 flex-wrap">
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
              <span>Masuk: <strong className="text-slate-900">{record.checkInTime}</strong></span>
            </div>

            <span>·</span>

            {isCheckedOut ? (
              <div className="flex items-center gap-1 font-mono text-slate-700">
                <span>Pulang: <strong className="text-slate-900">{record.checkOutTime}</strong></span>
              </div>
            ) : (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                Sedang Bertugas
              </span>
            )}
          </div>

          {/* Indikator Lapangan: Jarak Geofence & Kepatuhan APD K3 */}
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 mt-1.5 flex-wrap">
            <GeofenceBadge
              distanceMeters={record.geofenceDistanceMeters}
              verified={record.geofenceVerified}
              compact
            />

            {record.ppeCompliance ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 text-[#0f766e] border border-teal-200 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Helm &amp; Rompi Lengkap</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                <AlertCircle className="w-3 h-3" />
                <span>Perlu Helm &amp; Rompi</span>
              </span>
            )}

            <span className="text-slate-400 truncate max-w-35 sm:max-w-none">
              {record.siteName}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {onEditAttendance && (
          <button
            type="button"
            onClick={() => onEditAttendance(record)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Koreksi Presensi"
          >
            Koreksi
          </button>
        )}

        {onOpenEmployeeCard && (
          <button
            type="button"
            onClick={() => onOpenEmployeeCard(employee)}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#0f766e] bg-teal-50/70 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            title="Lihat ID Card Karyawan"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ID Card</span>
          </button>
        )}
      </div>
    </div>
  );
};
