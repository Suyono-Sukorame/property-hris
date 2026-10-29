import React, { useState } from 'react';
import { Employee, PropertySite } from '../types/hris';
import { FORMAT_IDR } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  UserPlus,
  CreditCard,
  FileSpreadsheet,
  Download,
  Building,
  ShieldCheck,
  LayoutGrid,
  List,
} from 'lucide-react';

interface EmployeesViewProps {
  employees: Employee[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenEmployeeCard: (emp: Employee) => void;
  onOpenPaySlip: (emp: Employee) => void;
  onOpenAddModal: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  sites,
  selectedSiteFilter,
  onOpenEmployeeCard,
  onOpenPaySlip,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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

  return (
    <div className="space-y-5">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIK, atau kode jabatan..."
            className="w-full h-[36px] pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
          />
        </div>

        {/* Division & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            aria-label="Filter Divisi"
            className="h-[36px] px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
          >
            <option value="ALL">Semua Divisi / Departemen</option>
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
            className="h-[36px] px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
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
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#0f766e]' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-[#0f766e]' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="h-[36px] inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Employee Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="px-4">Karyawan & NIK</th>
                  <th className="px-4">Jabatan & Kode</th>
                  <th className="px-4">Divisi</th>
                  <th className="px-4">Penempatan Site</th>
                  <th className="px-4">Status & K3</th>
                  <th className="px-4 text-right">Gaji Pokok (IDR)</th>
                  <th className="px-4 text-center">Tindakan</th>
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
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {emp.jobCode}
                        </span>
                      </td>

                      <td className="px-4 text-slate-600 font-medium max-w-[160px] truncate">
                        {emp.division}
                      </td>

                      <td className="px-4 text-slate-700 max-w-[170px] truncate">
                        <div className="font-semibold text-slate-800 truncate">{emp.siteName}</div>
                        <span className="text-[10px] text-slate-400 block">{emp.contractType}</span>
                      </td>

                      <td className="px-4">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={emp.status} size="sm" />
                          {emp.k3Certified && (
                            <span
                              className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200"
                              title="AK3 Sertifikasi Aktif"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {FORMAT_IDR(emp.baseSalary)}
                      </td>

                      <td className="px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEmployeeCard(emp)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            ID Card
                          </button>
                          <button
                            onClick={() => onOpenPaySlip(emp)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                          >
                            Slip Gaji
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Menampilkan <strong className="text-slate-800">{filteredEmployees.length}</strong> dari{' '}
              <strong className="text-slate-800">{employees.length}</strong> total personil terdaftar
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs">Property HRIS Platform · Versi Enterprise 2026</span>
            </div>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: emp.avatarColor }}
                    >
                      {emp.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                      <p className="text-xs font-semibold text-[#0f766e]">{emp.title}</p>
                      <span className="font-mono text-[10px] text-slate-400">{emp.jobCode}</span>
                    </div>
                  </div>
                  <StatusBadge status={emp.status} size="sm" />
                </div>

                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">NIK:</span>
                    <span className="font-mono font-medium text-slate-800">{emp.nik}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Site Penempatan:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {emp.siteName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Divisi:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {emp.division}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Gaji Pokok:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {FORMAT_IDR(emp.baseSalary)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={() => onOpenEmployeeCard(emp)}
                  className="flex-1 py-1.5 text-xs font-semibold text-[#0f766e] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  ID Card
                </button>
                <button
                  onClick={() => onOpenPaySlip(emp)}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Slip Gaji
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
