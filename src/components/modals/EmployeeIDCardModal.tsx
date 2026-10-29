'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Employee } from '@/types/hris';
import { StatusBadge } from '@/components/ui';
import { JOB_DESCRIPTIONS } from '@/data/jobDescriptions';
import {
  X, ShieldCheck, MapPin, Phone, Mail, Award, Printer,
  FileText, CheckCircle2, Target, Briefcase, GraduationCap,
  Layers, Lock,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'CARD' | 'JOBDESC' | 'KPI'>('CARD');

  if (!employee) return null;

  const jobdesc = JOB_DESCRIPTIONS[employee.jobCode] || {
    jobCode: employee.jobCode,
    title: employee.title,
    division: employee.division,
    level: 'Teknis & Lapangan',
    reportsTo: 'Site Manager Lapangan',
    purpose: 'Melaksanakan tugas operasional proyek sesuai standar mutu dan keselamatan kerja perusahaan.',
    responsibilities: [
      {
        category: 'Tugas Pokok & Operasional',
        items: [
          'Melaksanakan pekerjaan harian sesuai instruksi Site Manager dan jadwal proyek.',
          'Mematuhi prosedur standar keselamatan kerja (K3) di kawasan proyek.',
          'Melaporkan kendala operasional dan kebutuhan material kepada pengawas.',
        ],
      },
    ],
    authorities: ['Menggunakan perlengkapan kerja dan APD yang disediakan perusahaan'],
    kpiTargets: [
      { metric: 'Kepatuhan Kehadiran & Jam Kerja', target: '>= 95% Kehadiran', weight: 50, frequency: 'Bulanan' },
      { metric: 'Kepatuhan APD K3 Lapangan', target: '100% Zero Violation', weight: 50, frequency: 'Harian' },
    ],
    qualifications: {
      education: 'Pendidikan relevan dengan posisi penugasan',
      certifications: ['Sertifikasi keahlian teknis terkait'],
      experience: 'Pengalaman kerja di bidang konstruksi / properti',
    },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden select-none">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="bg-[#0f766e] px-4 sm:px-6 py-3 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/property-hris.png"
                alt="Logo PT Bumi Raya Propertindo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-100 truncate">
                PT Bumi Raya Propertindo Tbk
              </p>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                Profil Jabatan, Jobdesc & Site Pass
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Switcher (Horizontal scrollable on mobile) */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap shrink-0 py-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CARD'
                ? 'bg-white text-[#0f766e] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>ID Card & Site Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('JOBDESC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'JOBDESC'
                ? 'bg-white text-[#0f766e] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Uraian Tugas (Jobdesc)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('KPI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'KPI'
                ? 'bg-white text-[#0f766e] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Target Kinerja & KPI</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 text-xs">
          {/* =========================================================================
              TAB 1: ID CARD & SITE PASS
              ========================================================================= */}
          {activeTab === 'CARD' && (
            <div id="printable-idcard" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
                {/* Avatar Box with architectural stamp */}
                <div className="relative shrink-0">
                  <div
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl flex flex-col items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-slate-200 relative overflow-hidden"
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
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <StatusBadge status={employee.status} size="sm" />
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {employee.jobCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {employee.contractType}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {employee.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#0f766e]">
                    {employee.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Divisi: <span className="text-slate-700 font-medium">{employee.division}</span>
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                    Nomor Induk Kependudukan (NIK)
                  </span>
                  <span className="font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                    {employee.nik}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                    Penempatan Kawasan Proyek
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
                    <span className="truncate">{employee.siteName}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                    Kontak Resmi
                  </span>
                  <div className="flex items-center gap-1 text-slate-700 truncate mb-0.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{employee.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-0.5">
                    Kontak Darurat & Gol. Darah
                  </span>
                  <span className="text-slate-800 font-medium block truncate">
                    {employee.emergencyContact}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Golongan Darah: <strong className="font-bold text-slate-700">{employee.bloodType}</strong>
                  </span>
                </div>
              </div>

              {/* Compliance & K3 Status */}
              <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0f766e] shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs">
                      Sertifikasi K3 & Izin Akses Site
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-600">
                      {employee.k3Certified ? 'Terverifikasi (AK3 / SIO Lapangan Aktif)' : 'Standar Keselamatan Gedung Kantor'}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold shrink-0">
                  VALID 2026/2027
                </span>
              </div>

              {/* Barcode Strip */}
              <div className="pt-2 border-t border-slate-200 flex flex-col items-center">
                <div className="flex items-center gap-1 h-7 opacity-75">
                  {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 2, 1].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800 h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-400 tracking-widest mt-1">
                  BRP-{employee.id}-{employee.jobCode}
                </span>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: URAIAN TUGAS (JOBDESC DETAIL)
              ========================================================================= */}
          {activeTab === 'JOBDESC' && (
            <div id="printable-jobdesc" className="space-y-4">
              {/* Header Badge Ringkasan Jabatan */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#0f766e] text-white px-2 py-0.5 rounded">
                      {jobdesc.jobCode}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{jobdesc.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {jobdesc.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-200 pt-2 mt-2">
                  <div>
                    <span className="text-slate-400">Atasan Langsung: </span>
                    <strong className="text-slate-800">{jobdesc.reportsTo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Penempatan Kerja: </span>
                    <strong className="text-slate-800">{employee.siteName}</strong>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-slate-900 block mb-0.5">Tujuan Utama Jabatan (*Job Purpose*):</span>
                  <p className="italic text-slate-600">{jobdesc.purpose}</p>
                </div>
              </div>

              {/* Responsibilities Sections */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0f766e]" />
                  <span>Rincian Tugas Pokok & Tanggung Jawab Operasional</span>
                </h4>

                <div className="space-y-3">
                  {jobdesc.responsibilities.map((resp, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-white">
                      <h5 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{resp.category}</span>
                      </h5>
                      <ul className="space-y-1.5">
                        {resp.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-slate-600 text-[11px] leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authorities */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#0f766e]" />
                  <span>Wewenang & Batas Otorisasi Jabatan</span>
                </h4>
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-1.5">
                  {jobdesc.authorities.map((auth, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-amber-900 text-[11px]">
                      <span className="font-bold text-amber-700">•</span>
                      <span>{auth}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#0f766e]" />
                  <span>Kualifikasi & Sertifikasi Keahlian Wajib</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Pendidikan Formal:</span>
                    <span className="font-semibold text-slate-800">{jobdesc.qualifications.education}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sertifikat Keahlian / Kompetensi:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {jobdesc.qualifications.certifications.map((cert, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pengalaman Minimum:</span>
                    <span className="font-semibold text-slate-800">{jobdesc.qualifications.experience}</span>
                  </div>
                </div>
              </div>

              {/* Sign-off Sheet Simulation for Official Document */}
              <div className="pt-4 border-t border-slate-200 text-[11px] grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-slate-500 mb-8">Disiapkan & Diterima Oleh Karyawan:</p>
                  <p className="font-bold text-slate-900 underline">{employee.name}</p>
                  <p className="text-slate-400 text-[10px]">NIK: {employee.nik}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-8">Disetujui Oleh Atasan Langsung:</p>
                  <p className="font-bold text-slate-900 underline">{jobdesc.reportsTo}</p>
                  <p className="text-slate-400 text-[10px]">PT Bumi Raya Propertindo Tbk</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: KPI TARGETS
              ========================================================================= */}
          {activeTab === 'KPI' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-emerald-900">
                    Matriks Key Performance Indicators (KPI 2026/2027)
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Target evaluasi berkala pencapaian operasional & keselamatan proyek
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
                  Total Bobot: 100%
                </span>
              </div>

              <div className="space-y-2.5">
                {jobdesc.kpiTargets.map((kpi, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">{kpi.metric}</span>
                      <span className="font-mono font-bold text-xs text-[#0f766e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                        Bobot {kpi.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400">Tolok Ukur / Target: </span>
                        <strong className="text-slate-800 font-semibold">{kpi.target}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Periode Review: </span>
                        <span className="font-medium text-slate-700">{kpi.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>{activeTab === 'JOBDESC' ? 'Cetak Uraian Tugas Resmi' : 'Cetak Dokumen'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            {onViewPaySlip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewPaySlip(employee);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs cursor-pointer"
              >
                Slip Gaji
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
