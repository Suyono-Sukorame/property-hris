'use client';

import React, { useState } from 'react';
import { Employee, PropertySite } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import { JOB_DESCRIPTIONS } from '@/data/jobDescriptions';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  CreditCard,
  Download,
  ShieldCheck,
  LayoutGrid,
  List,
  Briefcase,
  Users,
  CheckCircle2,
  Lock,
  GraduationCap,
  Target,
  Printer,
  ChevronDown,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

interface EmployeesViewProps {
  employees: Employee[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenEmployeeCard: (emp: Employee) => void;
  onOpenPaySlip: (emp: Employee) => void;
  onOpenAddModal: () => void;
  onOpenEditEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string, permanent?: boolean) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  sites,
  selectedSiteFilter,
  onOpenEmployeeCard,
  onOpenPaySlip,
  onOpenAddModal,
  onOpenEditEmployee,
  onDeleteEmployee,
}) => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [mainTab, setMainTab] = useState<'EMPLOYEES' | 'JOBDESCS'>('EMPLOYEES');
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedJobCode, setSelectedJobCode] = useState<string>('ALL');
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteMode, setDeleteMode] = useState<'deactivate' | 'permanent'>('deactivate');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchSite =
      selectedSiteFilter === 'ALL' || emp.siteId === selectedSiteFilter;
    const matchDivision =
      divisionFilter === 'ALL' || emp.division === divisionFilter;
    const matchStatus =
      statusFilter === 'ALL' || emp.status === statusFilter;
    const matchSearch =
      searchQuery === '' ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nik.includes(searchQuery) ||
      emp.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSite && matchDivision && matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['NIK', 'Nama', 'Jabatan', 'Divisi', 'Site', 'Status', 'Gaji Pokok', 'Tunjangan'];
    const rows = filteredEmployees.map((e) => [
      e.nik,
      `"${e.name}"`,
      `"${e.title}"`,
      `"${e.division}"`,
      `"${e.siteName}"`,
      e.status,
      e.baseSalary,
      e.siteAllowance,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_karyawan_properti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const divisions = Array.from(new Set(employees.map((e) => e.division)));
  const allJobdescs = Object.values(JOB_DESCRIPTIONS);
  const filteredJobdescs = selectedJobCode === 'ALL' 
    ? allJobdescs 
    : allJobdescs.filter(j => j.jobCode === selectedJobCode);

  return (
    <div className="space-y-5">
      {/* =========================================================================
          MAIN TOP SWITCHER: [Daftar Personil Karyawan] vs [Katalog Jobdesc & Standar Jabatan]
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMainTab('EMPLOYEES')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'EMPLOYEES'
                ? 'bg-white text-[#0f766e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-[#0f766e]" />
            <span>Daftar Karyawan ({filteredEmployees.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('JOBDESCS')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'JOBDESCS'
                ? 'bg-white text-[#0f766e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#0f766e]" />
            <span>Katalog Jabatan & Jobdesk (8 Posisi)</span>
          </button>
        </div>

        {mainTab === 'EMPLOYEES' && (
          <div className="flex items-center gap-2 px-1 w-full sm:w-auto justify-end">
            <button
              onClick={exportCSV}
              className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
              <span className="sm:hidden">Ekspor</span>
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Karyawan</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: DAFTAR PERSONIL KARYAWAN
          ========================================================================= */}
      {mainTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          {/* Top Filter and Controls Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIK, atau jabatan..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
              />
            </div>

            {/* Division & Status Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                aria-label="Filter Divisi"
                className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
              >
                <option value="ALL">Semua Divisi</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter Status Karyawan"
                className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>

              {/* Table / Cards toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-[#0f766e]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white shadow-xs text-[#0f766e]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tampilan Kartu"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Mode */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-187.5">
                  <thead>
                    <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="px-4">Karyawan & NIK</th>
                      <th className="px-4">Jabatan & Kode</th>
                      <th className="px-4">Divisi</th>
                      <th className="px-4">Lokasi Penempatan</th>
                      <th className="px-4">Status & K3</th>
                      <th className="px-4 text-right">Gaji Pokok</th>
                      <th className="px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          Tidak ada karyawan yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                          <td className="px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                                style={{ backgroundColor: emp.avatarColor }}
                              >
                                {emp.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{emp.name}</div>
                                <div className="font-mono text-[11px] text-slate-400">{emp.nik}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4">
                            <div className="font-semibold text-slate-800">{emp.title}</div>
                            <div className="font-mono text-[10px] text-[#0f766e]">{emp.jobCode}</div>
                          </td>

                          <td className="px-4 text-slate-600">{emp.division}</td>

                          <td className="px-4">
                            <span className="font-medium text-slate-700 truncate block max-w-37.5">
                              {emp.siteName}
                            </span>
                          </td>

                          <td className="px-4">
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={emp.status} size="sm" />
                              {emp.k3Certified && (
                                <span title="Sertifikasi K3 Valid">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 text-right font-mono font-medium text-slate-900">
                            {FORMAT_IDR(emp.baseSalary)}
                          </td>

                          <td className="px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenEmployeeCard(emp)}
                                className="px-2 py-1 text-[11px] font-semibold text-[#0f766e] hover:bg-[#0f766e]/10 rounded border border-[#0f766e]/30 transition-colors cursor-pointer whitespace-nowrap"
                                title="Lihat Profil, Jobdesc & KPI"
                              >
                                Profil
                              </button>
                              <button
                                onClick={() => onOpenPaySlip(emp)}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Lihat Slip Gaji"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                              {onOpenEditEmployee && (
                                <button
                                  type="button"
                                  onClick={() => onOpenEditEmployee(emp)}
                                  className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded border border-emerald-200/60 transition-colors cursor-pointer"
                                  title="Edit Data Karyawan"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteEmployee && emp.id !== 'EMP-2025-001' && (
                                <button
                                  type="button"
                                  onClick={() => setEmployeeToDelete(emp)}
                                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-200/60 transition-colors cursor-pointer"
                                  title="Hapus / Nonaktifkan Karyawan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: emp.avatarColor }}
                        >
                          {emp.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{emp.name}</h4>
                          <span className="font-mono text-[10px] text-slate-400">{emp.nik}</span>
                        </div>
                      </div>
                      <StatusBadge status={emp.status} size="sm" />
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jabatan:</span>
                        <strong className="text-slate-800 text-right">{emp.title}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Divisi:</span>
                        <span className="text-slate-700 text-right">{emp.division}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Penempatan:</span>
                        <span className="text-slate-700 text-right truncate max-w-45">{emp.siteName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEmployeeCard(emp)}
                      className="flex-1 py-1.5 text-xs font-semibold text-[#0f766e] bg-[#0f766e]/10 hover:bg-[#0f766e]/20 rounded-lg transition-colors cursor-pointer text-center truncate"
                    >
                      Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPaySlip(emp)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Slip Gaji"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    {onOpenEditEmployee && (
                      <button
                        type="button"
                        onClick={() => onOpenEditEmployee(emp)}
                        className="p-1.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer"
                        title="Edit Data Karyawan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteEmployee && emp.id !== 'EMP-2025-001' && (
                      <button
                        type="button"
                        onClick={() => setEmployeeToDelete(emp)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200/60 transition-colors cursor-pointer"
                        title="Hapus / Nonaktifkan Karyawan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: KATALOG STANDAR JOBDESC & KOMPETENSI JABATAN (8 POSISI)
          ========================================================================= */}
      {mainTab === 'JOBDESCS' && (
        <div className="space-y-4">
          {/* Header Banner & Selector */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  PT BUMI RAYA PROPERTINDO TBK
                </span>
                <span className="text-xs text-slate-400">Wilayah Kalimantan Selatan</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Katalog Jobdesk, Wewenang & Target KPI
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Standar uraian tugas operasional, kepatuhan K3, sertifikasi keahlian, dan tolok ukur KPI untuk seluruh karyawan properti & konstruksi.
              </p>
            </div>

            {/* Quick Filter by Job */}
            <div className="w-full md:w-auto">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Filter Jabatan Spesifik:
              </label>
              <select
                value={selectedJobCode}
                onChange={(e) => setSelectedJobCode(e.target.value)}
                className="w-full md:w-64 h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#0f766e] cursor-pointer"
              >
                <option value="ALL">Tampilkan Semua (8 Posisi)</option>
                {allJobdescs.map((j) => (
                  <option key={j.jobCode} value={j.jobCode}>
                    {j.jobCode} - {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Descriptions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJobdescs.map((job) => (
              <div
                key={job.jobCode}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs bg-[#0f766e] text-white px-2 py-0.5 rounded">
                          {job.jobCode}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {job.level}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 tracking-tight">{job.title}</h4>
                      <p className="text-[11px] text-[#0f766e] font-semibold mt-0.5">Divisi: {job.division}</p>
                    </div>

                    <div className="text-right text-[10px] text-slate-500 shrink-0">
                      <span className="block text-slate-400">Atasan Langsung:</span>
                      <strong className="text-slate-800 font-semibold">{job.reportsTo}</strong>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Tujuan Jabatan:</span>
                    <p className="italic text-slate-600 line-clamp-2">{job.purpose}</p>
                  </div>

                  {/* Responsibilities Highlights */}
                  <div className="space-y-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tugas Pokok & Tanggung Jawab Utama:
                    </span>
                    {job.responsibilities.map((r, rIdx) => (
                      <div key={rIdx} className="text-[11px] space-y-1">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                          <Layers className="w-3 h-3 text-emerald-600" />
                          <span>{r.category}:</span>
                        </div>
                        <ul className="pl-4 space-y-0.5 text-slate-600">
                          {r.items.slice(0, 2).map((item, iIdx) => (
                            <li key={iIdx} className="list-disc leading-relaxed text-[11px]">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Key Authorities */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] mb-3">
                    <span className="font-bold text-amber-900 mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Wewenang & Batas Otorisasi:</span>
                    </span>
                    <p className="text-amber-800 text-[11px] line-clamp-2">• {job.authorities[0]}</p>
                  </div>

                  {/* Qualifications Pill */}
                  <div className="text-[11px] space-y-1 text-slate-600">
                    <span className="text-slate-400 block text-[10px]">Sertifikasi Kompetensi Wajib:</span>
                    <div className="flex flex-wrap gap-1">
                      {job.qualifications.certifications.map((cert, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px] border border-slate-200">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                    <Target className="w-3.5 h-3.5 text-[#0f766e]" />
                    <span>{job.kpiTargets.length} Indikator KPI</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    SK-DIR/BRP/2026
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG KONFIRMASI HAPUS / NONAKTIFKAN KARYAWAN
          ========================================================================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hapus / Nonaktifkan Karyawan
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Anda akan memproses data karyawan{' '}
                  <strong className="text-slate-900">{employeeToDelete.name}</strong> ({employeeToDelete.title}).
                </p>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'deactivate'}
                  onChange={() => setDeleteMode('deactivate')}
                  className="mt-0.5 text-[#0f766e] focus:ring-[#0f766e]"
                />
                <div>
                  <p className="font-bold text-slate-800">Nonaktifkan Karyawan (Disarankan)</p>
                  <p className="text-[11px] text-slate-500">
                    Karyawan ditandai status nonaktif & tidak bisa presensi, namun riwayat slip gaji & kehadiran masa lalu tetap aman tersimpan.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'permanent'}
                  onChange={() => setDeleteMode('permanent')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="font-bold text-rose-700">Hapus Permanen</p>
                  <p className="text-[11px] text-slate-500">
                    Hapus seluruh data karyawan ini dari daftar tim (gunakan jika terjadi salah ketik saat input).
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEmployee?.(employeeToDelete.id, deleteMode === 'permanent');
                  setEmployeeToDelete(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                  deleteMode === 'permanent'
                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                    : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                }`}
              >
                {deleteMode === 'permanent' ? 'Ya, Hapus Permanen' : 'Ya, Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
