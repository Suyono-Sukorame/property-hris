'use client';

import React, { useState } from 'react';
import { Employee, AttendanceRecord, EmployeeDocument } from '@/types/hris';
import { StatusBadge, SelfieThumbnail, PrintLetterhead, PrintSignatureBlock } from '@/components/ui';
import { printDocument } from '@/lib/print';
import { JOB_DESCRIPTIONS } from '@/data/jobDescriptions';
import { EmployeeAttendanceStatsWidget, DocumentDossierModal } from '@/components/employee';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Award,
  Printer,
  FileText,
  CheckCircle2,
  Target,
  Briefcase,
  GraduationCap,
  Layers,
  Lock,
  Pencil,
  CreditCard,
  MessageCircle,
  Copy,
  Check,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Clock,
  AlertCircle,
  Upload,
  Download,
} from 'lucide-react';

interface EmployeeProfileViewProps {
  employee: Employee;
  onBack: () => void;
  onOpenEditEmployee?: (employee: Employee) => void;
  onViewPaySlip?: (employee: Employee) => void;
  isSuperAdmin?: boolean;
  attendanceRecords?: AttendanceRecord[];
  onUpdateDocuments?: (empId: string, docs: EmployeeDocument[]) => Promise<void> | void;
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({
  employee,
  onBack,
  onOpenEditEmployee,
  onViewPaySlip,
  isSuperAdmin = true,
  attendanceRecords = [],
  onUpdateDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<'CARD' | 'JOBDESC' | 'KPI' | 'DOCUMENTS'>('CARD');
  const [copiedNik, setCopiedNik] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return null;
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

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

  const handleCopyNik = () => {
    navigator.clipboard.writeText(employee.nik);
    setCopiedNik(true);
    setTimeout(() => setCopiedNik(false), 2000);
  };

  const handlePrint = () => {
    printDocument('printable-employee-profile');
  };

  const printTitle =
    activeTab === 'CARD'
      ? 'FORMULIR BIODATA PERSONIL'
      : activeTab === 'JOBDESC'
        ? 'URAIAN JABATAN & SURAT TUGAS'
        : activeTab === 'KPI'
          ? 'TARGET KINERJA KARYAWAN'
          : 'BERKAS DOKUMEN DIGITAL PERSONIL';

  // Format clean phone for WhatsApp
  const cleanPhone = employee.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return (
    <div id="printable-employee-profile" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-10" data-print-root>
      <PrintLetterhead
        title={printTitle}
        docNumber={`HR-${employee.id}-${new Date().getFullYear()}`}
        classification="DOKUMEN INTERNAL"
      />

      {/* 1. Sticky Navigation Top Bar */}
      <div className="bg-white/95 p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Kembali ke Daftar Karyawan"
          >
            <ArrowLeft className="w-4 h-4 text-[#0f766e]" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="hidden md:inline hover:underline cursor-pointer" onClick={onBack}>
              Data Karyawan
            </span>
            <span className="hidden md:inline text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-45 sm:max-w-none">
              {employee.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsDossierModalOpen(true)}
            className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer relative"
            title="Kelola Berkas Dokumen Personil"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#0f766e]" />
            <span className="hidden sm:inline">Berkas</span>
            {employee.documents && employee.documents.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0f766e] text-white text-[9px] font-bold rounded-full">
                {employee.documents.length}
              </span>
            )}
          </button>

          {onOpenEditEmployee && isSuperAdmin && (
            <button
              type="button"
              onClick={() => onOpenEditEmployee(employee)}
              className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Edit Data</span>
            </button>
          )}

          {onViewPaySlip && (
            <button
              type="button"
              onClick={() => onViewPaySlip(employee)}
              className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#0f766e]" />
              <span className="hidden sm:inline">Slip Gaji</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-[#0f766e] text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
          {/* Avatar Box with Photo, Blood Type & K3 Badge */}
          <div className="relative shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              <SelfieThumbnail
                photoUrl={employee.photoUrl}
                employeeName={employee.name}
                initials={employee.initials}
                avatarColor={employee.avatarColor}
                size="lg"
                showModalOnClick={!!employee.photoUrl}
                caption={`${employee.name} · ${employee.title}`}
              />
              {employee.k3Certified && (
                <div
                  className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md border-2 border-slate-900"
                  title="Sertifikasi AK3 Konstruksi Aktif"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Photo & Blood Type Badge */}
            <div className="flex flex-col items-center gap-1">
              {employee.photoUrl
                ? <span className="text-[10px] text-emerald-300 bg-emerald-900/50 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">📸 Foto Tersedia</span>
                : <span className="text-[10px] text-slate-400 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">🖼 Belum Ada Foto</span>
              }
              {employee.bloodType && (
                <span className="text-[10px] font-mono tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-md font-bold text-white/80 whitespace-nowrap">
                  Gol. {employee.bloodType}
                </span>
              )}
            </div>
          </div>

          {/* Profile Core Data */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <StatusBadge status={employee.status} size="sm" />
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/15">
                {employee.jobCode}
              </span>
              <span className="text-[11px] font-medium text-slate-300">
                {employee.contractType}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {employee.name}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-emerald-300 mt-0.5">
              {employee.title}
            </p>
            <p className="text-xs text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span>Divisi: <strong>{employee.division}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {employee.siteName}
              </span>
            </p>

            {/* Quick Action Pills on Mobile Banner */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${employee.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Telepon</span>
              </a>

              <a
                href={`mailto:${employee.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Lifecycle & Expiry Alerts */}
      {employee.status === 'Nonaktif' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Status Karyawan Nonaktif (Arsip)</span>
              {employee.deactivationDate && (
                <span className="font-mono text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded font-semibold">
                  Efektif: {employee.deactivationDate}
                </span>
              )}
            </div>
            <p className="text-rose-800">
              Alasan: <strong>{employee.deactivationReason || 'Tidak ada keterangan'}</strong>
            </p>
            {employee.deactivationNotes && (
              <p className="text-rose-700 italic text-[11px]">
                Catatan: &ldquo;{employee.deactivationNotes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {(() => {
        const contractDays = getDaysUntil(employee.contractEndDate);
        const k3Days = getDaysUntil(employee.k3CertificateExpiry);
        if ((contractDays !== null && contractDays <= 30) || (k3Days !== null && k3Days <= 30)) {
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
              {contractDays !== null && contractDays <= 30 && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs shadow-xs ${
                    contractDays <= 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock
                      className={`w-4 h-4 shrink-0 ${
                        contractDays <= 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <p className="font-bold">Masa Berlaku Kontrak (SPK)</p>
                      <p className="text-[11px] opacity-80">Berakhir: {employee.contractEndDate}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                      contractDays <= 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {contractDays <= 0 ? 'Telah Berakhir' : `${contractDays} Hari Lagi`}
                  </span>
                </div>
              )}
              {k3Days !== null && k3Days <= 30 && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs shadow-xs ${
                    k3Days <= 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle
                      className={`w-4 h-4 shrink-0 ${k3Days <= 0 ? 'text-rose-600' : 'text-amber-600'}`}
                    />
                    <div>
                      <p className="font-bold">Masa Berlaku Sertifikasi K3</p>
                      <p className="text-[11px] opacity-80">Kedaluwarsa: {employee.k3CertificateExpiry}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                      k3Days <= 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {k3Days <= 0 ? 'Kedaluwarsa' : `${k3Days} Hari Lagi`}
                  </span>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}

      {/* 3. Segmented Navigation Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('CARD')}
          className={`flex-1 min-w-30 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'CARD'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ID Card & Kontak</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('JOBDESC')}
          className={`flex-1 min-w-30 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'JOBDESC'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Standar Jobdesk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('KPI')}
          className={`flex-1 min-w-30 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'KPI'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Target KPI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`flex-1 min-w-30 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'DOCUMENTS'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Berkas Dokumen ({employee.documents?.length || 0})</span>
        </button>
      </div>

      {/* 4. Tab 1: ID Card & Kontak Detail */}
      {activeTab === 'CARD' && (
        <div id="printable-idcard" className="space-y-4 animate-in fade-in duration-150">
          {/* Performa Presensi & Kepatuhan APD K3 Riil */}
          {attendanceRecords && attendanceRecords.length > 0 && (
            <EmployeeAttendanceStatsWidget
              employeeId={employee.id}
              attendanceRecords={attendanceRecords}
              className="print:hidden"
            />
          )}

          {/* Contact & Biodata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* NIK Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nomor Induk Kependudukan (NIK)
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-slate-900">
                  {employee.nik}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyNik}
                className="p-2 text-slate-500 hover:text-[#0f766e] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title="Salin NIK"
              >
                {copiedNik ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Penempatan Proyek */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kawasan Penempatan Proyek
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-[#0f766e] shrink-0" />
                <span>{employee.siteName}</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Provinsi Kalimantan Selatan
              </span>
            </div>

            {/* Kontak Resmi */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Kontak Resmi Karyawan
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-800">
                <Phone className="w-4 h-4 text-[#0f766e] shrink-0" />
                <span className="font-mono font-semibold">{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800">
                <Mail className="w-4 h-4 text-[#0f766e] shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
            </div>

            {/* Kontak Darurat & Gol. Darah */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Kontak Darurat & Golongan Darah
              </span>
              <div className="text-xs text-slate-800 font-medium">
                {employee.emergencyContact}
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span>Golongan Darah:</span>
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {employee.bloodType}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & K3 Status */}
          <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0f766e] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 block text-xs sm:text-sm">
                  Sertifikasi K3 & Izin Akses Site Konstruksi
                </span>
                <span className="text-[11px] text-emerald-800">
                  {employee.k3Certified
                    ? 'Terverifikasi (Sertifikat AK3 / SIO Lapangan Aktif)'
                    : 'Standar Keselamatan Gedung Kantor Properti'}
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto font-mono text-[11px] bg-white text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 font-bold shadow-2xs">
              VALID 2026/2027
            </span>
          </div>

          {/* Barcode Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <div className="flex items-center gap-1 h-8 opacity-75">
              {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 2, 1].map((w, idx) => (
                <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.6}px` }} />
              ))}
            </div>
            <span className="font-mono text-[10px] text-slate-400 tracking-widest mt-1.5 font-bold">
              BRP-{employee.id}-{employee.jobCode}
            </span>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Standar Jobdesk Detail */}
      {activeTab === 'JOBDESC' && (
        <div id="printable-jobdesc" className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-[#0f766e] text-white px-2.5 py-0.5 rounded-md">
                  {jobdesc.jobCode}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">{jobdesc.title}</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {jobdesc.level}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Atasan Langsung: </span>
                <strong className="text-slate-900">{jobdesc.reportsTo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Penempatan Kerja: </span>
                <strong className="text-slate-900">{employee.siteName}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Tujuan Utama Jabatan (*Job Purpose*):</span>
              <p className="italic text-slate-600">{jobdesc.purpose}</p>
            </div>
          </div>

          {/* Responsibilities Sections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[#0f766e]" />
              <span>Rincian Tugas Pokok & Tanggung Jawab Operasional</span>
            </h4>

            <div className="space-y-3">
              {jobdesc.responsibilities.map((resp, idx) => (
                <div key={idx} className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50">
                  <h5 className="font-bold text-xs text-slate-900 mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{resp.category}</span>
                  </h5>
                  <ul className="space-y-2">
                    {resp.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Authorities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Wewenang & Batas Otorisasi Jabatan</span>
            </h4>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5">
              {jobdesc.authorities.map((auth, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-950 text-xs">
                  <span className="font-bold text-amber-700">•</span>
                  <span>{auth}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-[#0f766e]" />
              <span>Kualifikasi & Sertifikasi Keahlian Wajib</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Pendidikan Formal:</span>
                <span className="font-semibold text-slate-900">{jobdesc.qualifications.education}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Sertifikat Keahlian / Kompetensi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {jobdesc.qualifications.certifications.map((cert, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold text-[11px] border border-emerald-200">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Pengalaman Minimum:</span>
                <span className="font-semibold text-slate-900">{jobdesc.qualifications.experience}</span>
              </div>
            </div>
          </div>

          {/* Sign-off Sheet Simulation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs pt-4 text-xs grid grid-cols-2 gap-4 text-center print:hidden">
            <div>
              <p className="text-slate-500 mb-10">Disiapkan & Diterima Oleh Karyawan:</p>
              <p className="font-bold text-slate-900 underline">{employee.name}</p>
              <p className="text-slate-400 text-[10px]">NIK: {employee.nik}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-10">Disetujui Oleh Atasan Langsung:</p>
              <p className="font-bold text-slate-900 underline">{jobdesc.reportsTo}</p>
              <p className="text-slate-400 text-[10px]">Griya Bumi Raya</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Target KPI */}
      {activeTab === 'KPI' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                Matriks Key Performance Indicators (KPI 2026/2027)
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Target evaluasi berkala pencapaian operasional & kepatuhan proyek
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
              Total: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {jobdesc.kpiTargets.map((kpi, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-300 transition-colors space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{kpi.metric}</h5>
                  <span className="font-mono font-bold text-xs text-[#0f766e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                    Bobot {kpi.weight}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tolok Ukur / Target:</span>
                    <strong className="text-slate-800">{kpi.target}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Periode Review:</span>
                    <span className="font-semibold text-slate-700">{kpi.frequency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Berkas Dokumen Personil (Digital Dossier with Smart WebP) */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-teal-950 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#0f766e]" />
                <span>Berkas Digital & Arsip Personil Teroptimasi WebP</span>
              </h4>
              <p className="text-[11px] text-teal-800 mt-0.5">
                Dokumen resmi KTP, Surat Perjanjian Kerja (SPK), Sertifikat K3, dan Ijazah berformat WebP resolusi tinggi dengan kompresi ukuran hemat penyimpanan.
              </p>
            </div>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsDossierModalOpen(true)}
                className="h-8.5 px-3 bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Kelola & Unggah Berkas</span>
              </button>
            )}
          </div>

          {!employee.documents || employee.documents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0f766e] flex items-center justify-center mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-800 text-sm">Belum Ada Dokumen Digital</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Belum ada dokumen digital yang dilampirkan untuk karyawan ini. Unggah berkas KTP, SPK, atau sertifikasi K3 sekarang.
                </p>
              </div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setIsDossierModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] text-white text-xs font-bold rounded-xl hover:bg-[#115e59] transition-all shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Berkas Baru</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {employee.documents.map((doc) => {
                const isImage = doc.fileUrl.startsWith('data:image/') || !!doc.fileName?.match(/\.(webp|jpg|jpeg|png|gif)$/i);
                const daysUntilExpiry = getDaysUntil(doc.expiryDate);
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Thumbnail Preview */}
                      <div className="w-full h-36 rounded-xl bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-100">
                        {isImage ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <FileText className="w-12 h-12 text-slate-400" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          {doc.category}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="mt-2.5 space-y-1">
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{doc.title}</h5>
                        {doc.notes && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">Catatan: {doc.notes}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>{doc.fileSizeBytes ? `${Math.round(doc.fileSizeBytes / 1024)} KB (WebP)` : 'WebP'}</span>
                          <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                        {doc.expiryDate && (
                          <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 flex items-center gap-1 ${
                            isExpiringSoon
                              ? daysUntilExpiry !== null && daysUntilExpiry <= 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-50 text-slate-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {daysUntilExpiry !== null && daysUntilExpiry <= 0
                                ? 'Kedaluwarsa'
                                : `Berlaku s/d ${doc.expiryDate} (${daysUntilExpiry}h)`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName || `${doc.title}.webp`}
                        className="text-xs font-semibold text-[#0f766e] hover:text-[#115e59] flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsDossierModalOpen(true)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Detail & Kelola
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Dossier Berkas Dokumen Personil */}
      <DocumentDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        employee={employee}
        onUpdateDocuments={async (empId, docs) => {
          if (onUpdateDocuments) {
            await onUpdateDocuments(empId, docs);
          }
          employee.documents = docs;
        }}
        canEdit={isSuperAdmin}
      />

      <PrintSignatureBlock
        creator={{
          roleTitle: 'Disiapkan oleh,',
          name: 'HR & Administrasi',
          positionTitle: 'Administrasi Personalia',
        }}
        employee={{
          roleTitle: 'Diketahui oleh karyawan,',
          name: employee.name,
          positionTitle: employee.title,
          customNote: `NIK: ${employee.nik}`,
        }}
        approver={{
          roleTitle: 'Disetujui oleh,',
          name: 'Pimpinan Perusahaan',
          positionTitle: 'Direktur Utama',
        }}
      />
    </div>
  );
};

