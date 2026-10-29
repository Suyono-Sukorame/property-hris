'use client';
import Image from 'next/image';
import React from 'react';
import { Employee } from '@/types/hris';
import { StatusBadge } from '@/components/ui';
import { X, ShieldCheck, MapPin, Phone, Mail, Award, Printer } from 'lucide-react';

interface EmployeeIDCardModalProps {
  employee: Employee | null;
  onClose: () => void;
  onViewPaySlip?: (employee: Employee) => void;
}

export const EmployeeIDCardModal: React.FC<EmployeeIDCardModalProps> = ({
  employee,
  onClose,
  onViewPaySlip,
}) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="bg-[#0f766e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/property-hris.png"
                alt="Logo PT Bumi Raya Propertindo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                PT Bumi Raya Propertindo Tbk
              </p>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Kartu Tanda Pengenal Karyawan & Site Pass
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
            {/* Avatar Box with architectural stamp */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-28 rounded-xl flex flex-col items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-slate-200 relative overflow-hidden"
                style={{ backgroundColor: employee.avatarColor }}
              >
                <span>{employee.initials}</span>
                <span className="absolute bottom-1 text-[9px] font-mono tracking-widest uppercase bg-black/30 px-2 py-0.5 rounded">
                  {employee.bloodType}
                </span>
              </div>
              {employee.k3Certified && (
                <div 
                  className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 p-1 rounded-full shadow-sm border-2 border-white"
                  title="Sertifikasi K3 Konstruksi Aktif"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <StatusBadge status={employee.status} size="sm" />
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.jobCode}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {employee.contractType}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {employee.name}
              </h3>
              <p className="text-sm font-semibold text-[#0f766e]">
                {employee.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Divisi: <span className="text-slate-700 font-medium">{employee.division}</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                Nomor Induk Kependudukan (NIK)
              </span>
              <span className="font-mono font-semibold text-slate-800 text-sm">
                {employee.nik}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                Penempatan Proyek
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
                <span className="truncate">{employee.siteName}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                Kontak & Email Resmi
              </span>
              <div className="flex items-center gap-1 text-slate-700 truncate mb-0.5">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 font-mono">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{employee.phone}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                Kontak Darurat (Emergency)
              </span>
              <span className="text-slate-800 font-medium block">
                {employee.emergencyContact}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Gol. Darah: <strong className="font-bold text-slate-700">{employee.bloodType}</strong>
              </span>
            </div>
          </div>

          {/* Compliance & K3 Status */}
          <div className="mt-1 p-3 rounded-lg border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0f766e]" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Sertifikasi K3 & Izin Masuk Site
                </span>
                <span className="text-[11px] text-slate-600">
                  {employee.k3Certified ? 'Terverifikasi (AK3 Konstruksi Proyek Aktif)' : 'Standar Keselamatan Kantor Pusat'}
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              VALID 2026/2027
            </span>
          </div>

          {/* Barcode Strip Simulation */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col items-center">
            <div className="flex items-center gap-1 h-8 opacity-75">
              {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 2, 1].map((w, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 h-full"
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-slate-400 tracking-widest mt-1">
              BRP-{employee.id}-{employee.jobCode}
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Cetak ID Card
          </button>
          
          <div className="flex items-center gap-2">
            {onViewPaySlip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewPaySlip(employee);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors"
              >
                Lihat Slip Gaji
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
