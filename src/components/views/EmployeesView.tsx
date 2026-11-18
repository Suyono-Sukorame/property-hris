'use client';

import React, { useEffect, useState } from 'react';
import { Employee, PropertySite } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge, PageHeader, FilterBar, SearchInput, Select, EmptyState, SelfieThumbnail } from '@/components/ui';
import { JOB_DESCRIPTIONS } from '@/data/jobDescriptions';
import { JobDescription } from '@/types/jobdesc';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui';
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
import { JobDescriptionModal } from '@/components/modals';

type JobDescriptionRow = {
  job_code: string;
  title: string;
  division: string;
  level: JobDescription['level'];
  reports_to: string | null;
  purpose: string;
  responsibilities: JobDescription['responsibilities'];
  authorities: string[];
  kpi_targets: JobDescription['kpiTargets'];
  qualifications: JobDescription['qualifications'];
};

const mapJobDescriptionRow = (row: JobDescriptionRow): JobDescription => ({
  jobCode: row.job_code,
  title: row.title,
  division: row.division,
  level: row.level,
  reportsTo: row.reports_to ?? '-',
  purpose: row.purpose,
  responsibilities: row.responsibilities ?? [],
  authorities: row.authorities ?? [],
  kpiTargets: row.kpi_targets ?? [],
  qualifications: row.qualifications ?? { education: '', experience: '', certifications: [] },
});

const mapJobDescriptionToRow = (job: JobDescription) => ({
  job_code: job.jobCode,
  title: job.title,
  division: job.division,
  level: job.level,
  reports_to: job.reportsTo,
  purpose: job.purpose,
  responsibilities: job.responsibilities,
  authorities: job.authorities,
  kpi_targets: job.kpiTargets,
  qualifications: job.qualifications,
});

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
  const [expandedJobCode, setExpandedJobCode] = useState<string | null>(null);
  const [isJobDescModalOpen, setIsJobDescModalOpen] = useState(false);
  const [editingJobdesc, setEditingJobdesc] = useState<JobDescription | null>(null);
  const [deleteJobdescCode, setDeleteJobdescCode] = useState<string | null>(null);

  // Job descriptions dimuat dari Supabase (fallback ke katalog statis)
  const [jobdescs, setJobdescs] = useState<JobDescription[]>(() => Object.values(JOB_DESCRIPTIONS));
  const [isJobdescSaving, setIsJobdescSaving] = useState(false);

  const allJobdescs = jobdescs;

  useEffect(() => {
    let isMounted = true;

    // Daftar job code korporat lama yang tidak relevan untuk developer pemula
    const LEGACY_CORP_CODES = new Set([
      'DIR-PRJ-01', 'ARC-DES-02', 'HSE-K3-01', 'EST-FIN-03',
      'ENG-CIV-04', 'DRF-ENG-05', 'MEC-INS-02', 'CRN-OPS-01',
      'LEG-LND-01', 'FIN-ACC-01', 'HR-PPL-01', 'SLS-PRP-01',
    ]);

    const loadJobdescs = async () => {
      const { data, error } = await supabase.from('job_descriptions').select('*');
      if (!isMounted) return;

      if (error) {
        console.error('Gagal memuat jobdesk dari Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        // Otomatis bersihkan baris korporat usang dari Supabase di background
        const legacyRows = data.filter((r) => LEGACY_CORP_CODES.has(r.job_code));
        if (legacyRows.length > 0) {
          supabase
            .from('job_descriptions')
            .delete()
            .in('job_code', Array.from(LEGACY_CORP_CODES))
            .then(() => {});
        }

        const validData = data.filter((r) => !LEGACY_CORP_CODES.has(r.job_code));
        if (validData.length > 0) {
          setJobdescs(validData.map(mapJobDescriptionRow));
          return;
        }
      }

      // Tabel masih kosong atau baru dibersihkan: isi 4 posisi inti developer rintisan
      const seedRows = Object.values(JOB_DESCRIPTIONS).map(mapJobDescriptionToRow);
      const { error: seedError } = await supabase
        .from('job_descriptions')
        .upsert(seedRows, { onConflict: 'job_code' });
      if (!isMounted) return;

      if (seedError) {
        console.error('Gagal mengisi jobdesk ke Supabase:', seedError);
        return;
      }

      const { data: seeded } = await supabase.from('job_descriptions').select('*');
      if (isMounted && seeded) {
        const cleanSeeded = seeded.filter((r) => !LEGACY_CORP_CODES.has(r.job_code));
        setJobdescs(cleanSeeded.map(mapJobDescriptionRow));
      }
    };

    loadJobdescs();
    return () => { isMounted = false; };
  }, []);

  // CRUD Handlers for Job Descriptions (Supabase)
  const handleAddJobdesc = async (formData: JobDescription) => {
    setIsJobdescSaving(true);
    const { data, error } = await supabase
      .from('job_descriptions')
      .insert(mapJobDescriptionToRow(formData))
      .select()
      .single();
    setIsJobdescSaving(false);

    if (error) {
      alert(`Gagal menyimpan jobdesk: ${error.message}`);
      return;
    }

    const newJobdesc = mapJobDescriptionRow(data as JobDescriptionRow);
    setJobdescs(prev => [newJobdesc, ...prev]);
    setIsJobDescModalOpen(false);
  };

  const handleUpdateJobdesc = async (formData: JobDescription) => {
    setIsJobdescSaving(true);
    const { error } = await supabase
      .from('job_descriptions')
      .update(mapJobDescriptionToRow(formData))
      .eq('job_code', formData.jobCode);
    setIsJobdescSaving(false);

    if (error) {
      alert(`Gagal memperbarui jobdesk: ${error.message}`);
      return;
    }

    setJobdescs(prev => prev.map(j => (j.jobCode === formData.jobCode ? formData : j)));
    setIsJobDescModalOpen(false);
    setEditingJobdesc(null);
  };

  const handleDeleteJobdesc = async (jobCode: string) => {
    setIsJobdescSaving(true);
    const { error } = await supabase.from('job_descriptions').delete().eq('job_code', jobCode);
    setIsJobdescSaving(false);

    if (error) {
      alert(`Gagal menghapus jobdesk: ${error.message}`);
      return;
    }

    setJobdescs(prev => prev.filter(j => j.jobCode !== jobCode));
    setDeleteJobdescCode(null);
  };

  const handleEditJobdesc = (job: JobDescription) => {
    setEditingJobdesc(job);
    setIsJobDescModalOpen(true);
  };

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
    const headers = ['NIK', 'Nama', 'Jabatan', 'Divisi', 'Site', 'Status', 'Penghasilan', 'Tunjangan'];
    const rows = filteredEmployees.map((e) => [
      e.nik,
      `"${e.name}"`,
      `"${e.title}"`,
      `"${e.division}"`,
      `"${e.siteName}"`,
      e.status,
      e.title.toLowerCase().includes('pemilik') || 
      e.title.toLowerCase().includes('direktur') ||
      e.jobCode.startsWith('DIR-') ||
      e.division === 'Manajemen' ? 'Dividen/Profit Sharing' : e.baseSalary,
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
  const filteredJobdescs = selectedJobCode === 'ALL' 
    ? allJobdescs 
    : allJobdescs.filter(j => j.jobCode === selectedJobCode);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Data Personil & Jabatan"
        subtitle="Kelola profil personil proyek perumahan, NIK, penempatan tapak, kepatuhan K3, dan standar jobdesk."
        icon={<Users className="w-5 h-5 text-[#0f766e]" />}
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] font-mono text-[10px] font-bold border border-teal-200">
            {filteredEmployees.length} Personil Terdaftar
          </span>
        }
        actions={
          mainTab === 'EMPLOYEES' ? (
            <>
              <button
                type="button"
                onClick={exportCSV}
                className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Karyawan</span>
                </button>
              )}
            </>
          ) : (
            <>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => { setEditingJobdesc(null); setIsJobDescModalOpen(true); }}
                  className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Jobdesk</span>
                </button>
              )}
            </>
          )
        }
      />

      {/* =========================================================================
          MAIN TOP SWITCHER: [Daftar Personil Karyawan] vs [Katalog Jobdesc & Standar Jabatan]
          ========================================================================= */}
      <div className="flex items-center gap-1 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => setMainTab('EMPLOYEES')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mainTab === 'EMPLOYEES'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Karyawan ({filteredEmployees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('JOBDESCS')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mainTab === 'JOBDESCS'
              ? 'bg-[#0f766e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Katalog Jobdesk ({allJobdescs.length})</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: DAFTAR PERSONIL KARYAWAN
          ========================================================================= */}
      {mainTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          {/* Top Filter and Controls Bar */}
          <FilterBar
            summary={
              <span className="text-slate-500 text-xs">
                Menampilkan <strong className="text-slate-800">{filteredEmployees.length}</strong> karyawan
              </span>
            }
            actions={
              <div className="hidden md:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white shadow-2xs text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Tampilan Tabel"
                  aria-label="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white shadow-2xs text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Tampilan Kartu"
                  aria-label="Tampilan Kartu"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama, NIK, atau jabatan..."
              className="w-full md:w-72"
            />

            <Select
              value={divisionFilter}
              onChange={setDivisionFilter}
              ariaLabel="Filter Divisi"
              options={[
                { value: 'ALL', label: 'Semua Divisi' },
                ...divisions.map((div) => ({ value: div, label: div })),
              ]}
              className="w-full sm:w-auto"
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              ariaLabel="Filter Status Karyawan"
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Cuti', label: 'Cuti' },
                { value: 'Nonaktif', label: 'Nonaktif' },
              ]}
              className="w-full sm:w-auto"
            />
          </FilterBar>

          {/* Desktop Table View */}
          <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`}>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-187.5">
                  <thead>
                    <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="px-4">Karyawan & NIK</th>
                      <th className="px-4">Jabatan & Kode</th>
                      <th className="px-4">Divisi</th>
                      <th className="px-4">Lokasi Penempatan</th>
                      <th className="px-4">Status & K3</th>
                      <th className="px-4 text-right">Penghasilan</th>
                      <th className="px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                      <EmptyState
                        variant="table"
                        colSpan={7}
                        message="Tidak ada karyawan yang sesuai dengan kriteria filter atau pencarian."
                      />
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                          <td className="px-4">
                            <div className="flex items-center gap-2.5">
                              <SelfieThumbnail
                                photoUrl={emp.photoUrl}
                                employeeName={emp.name}
                                initials={emp.initials}
                                avatarColor={emp.avatarColor}
                                size="sm"
                                showModalOnClick={!!emp.photoUrl}
                                caption={`${emp.name} · ${emp.title}`}
                              />
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

                          <td className="px-4 text-right">
                            {emp.title.toLowerCase().includes('pemilik') || 
                             emp.title.toLowerCase().includes('direktur') ||
                             emp.jobCode.startsWith('DIR-') ||
                             emp.division === 'Manajemen' ? (
                              <div className="flex flex-col items-end">
                                <span className="text-slate-500 text-[10px] uppercase tracking-wider">Dividen/Profit Sharing</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px] mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  Pemilik
                                </span>
                              </div>
                            ) : (
                              FORMAT_IDR(emp.baseSalary)
                            )}
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

          {/* Cards View (Active when viewMode === 'cards' OR on mobile screens) */}
          <div className={`${viewMode === 'cards' ? 'block' : 'block md:hidden'}`}>
            {filteredEmployees.length === 0 ? (
              <EmptyState
                variant="card"
                message="Tidak ada karyawan yang sesuai dengan kriteria filter atau pencarian."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <SelfieThumbnail
                          photoUrl={emp.photoUrl}
                          employeeName={emp.name}
                          initials={emp.initials}
                          avatarColor={emp.avatarColor}
                          size="md"
                          showModalOnClick={!!emp.photoUrl}
                          caption={`${emp.name} · ${emp.title}`}
                        />
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
                <option value="ALL">Tampilkan Semua ({allJobdescs.length} Posisi Inti)</option>
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

                  {/* Mobile Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedJobCode(expandedJobCode === job.jobCode ? null : job.jobCode)}
                    className="md:hidden w-full py-2 px-3 my-2 text-xs font-bold text-[#0f766e] bg-emerald-50/80 hover:bg-emerald-100 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{expandedJobCode === job.jobCode ? 'Sembunyikan Rincian' : 'Lihat Rincian Tugas & KPI'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedJobCode === job.jobCode ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Responsibilities & KPI (Collapsible on Mobile, Expanded on Desktop) */}
                  <div className={`space-y-3 ${expandedJobCode === job.jobCode ? 'block' : 'hidden md:block'}`}>
                    {/* Responsibilities Highlights */}
                    <div className="space-y-2">
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
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px]">
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
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                    <Target className="w-3.5 h-3.5 text-[#0f766e]" />
                    <span>{job.kpiTargets.length} Indikator KPI</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditJobdesc(job)}
                      disabled={!isSuperAdmin}
                      className="p-1.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit Jobdesk"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteJobdescCode(job.jobCode)}
                      disabled={!isSuperAdmin}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200/60 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Hapus Jobdesk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* =========================================================================
          MODAL Tambah/Edit Jobdesk
          ========================================================================= */}
      <JobDescriptionModal
        isOpen={isJobDescModalOpen}
        onClose={() => { setIsJobDescModalOpen(false); setEditingJobdesc(null); }}
        mode={editingJobdesc ? 'edit' : 'add'}
        initialData={editingJobdesc}
        onSubmit={editingJobdesc ? handleUpdateJobdesc : handleAddJobdesc}
        onDelete={handleDeleteJobdesc}
        existingJobCodes={jobdescs.filter(j => j.jobCode !== (editingJobdesc?.jobCode || '')).map(j => j.jobCode)}
        isLoading={isJobdescSaving}
      />

      {/* =========================================================================
          DIALOG KONFIRMASI HAPUS JOBDESK
          ========================================================================= */}
      {deleteJobdescCode && (
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
                  Hapus Jobdesk
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Anda akan menghapus jobdesk <strong className="text-rose-700">#{deleteJobdescCode}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              ⚠️ <strong>Catatan Penting:</strong> Tindakan ini tidak dapat dibatalkan. Jobdesk akan hilang dari katalog dan tidak bisa dipilih untuk karyawan baru.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteJobdescCode(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleDeleteJobdesc(deleteJobdescCode)}
              >
                Ya, Hapus Jobdesk
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
