'use client';
import React, { useState } from 'react';
import { ApprovalItem, PropertySite, Employee, ApprovalType } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowRight,
  HardHat,
} from 'lucide-react';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  sites: PropertySite[];
  employees: Employee[];
  selectedSiteFilter: string;
  onOpenApproval: (item: ApprovalItem) => void;
  onQuickApprove: (id: string) => void;
  onAddNewApproval: (item: ApprovalItem) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  sites,
  employees,
  selectedSiteFilter,
  onOpenApproval,
  onQuickApprove,
  onAddNewApproval,
}) => {
  const [tabFilter, setTabFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form states for new ticket
  const [newType, setNewType] = useState<ApprovalType>('Lembur Konstruksi Cor Beton');
  const [newEmpId, setNewEmpId] = useState(employees[0]?.id || '');
  const [newSiteId, setNewSiteId] = useState(sites[0]?.id || '');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(1500000);
  const [newPriority, setNewPriority] = useState<'Biasa' | 'Penting' | 'Kritis'>('Penting');

  const filteredApprovals = approvals.filter((item) => {
    const matchSite =
      selectedSiteFilter === 'ALL' || item.siteId === selectedSiteFilter;

    let matchTab = true;
    if (tabFilter === 'PENDING') {
      matchTab = item.status.includes('Menunggu');
    } else if (tabFilter === 'APPROVED') {
      matchTab = item.status === 'Disetujui';
    } else if (tabFilter === 'REJECTED') {
      matchTab = item.status === 'Ditolak';
    }

    const matchSearch =
      searchQuery === '' ||
      item.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSite && matchTab && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === newEmpId) || employees[0];
    const site = sites.find((s) => s.id === newSiteId) || sites[0];

    const newItem: ApprovalItem = {
      id: `APP-${Date.now()}`,
      ticketNumber: `REQ/${site.code.slice(0, 3)}/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
      type: newType,
      employeeId: emp.id,
      employeeName: emp.name,
      jobCode: emp.jobCode,
      division: emp.division,
      siteId: site.id,
      siteName: site.name,
      dateRequested: 'Hari Ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      description: newDesc || 'Pengajuan persetujuan operasional lapangan proyek properti',
      costEstimate: Number(newCost) || undefined,
      duration: 'Sesuai Jadwal Lapangan',
      status: 'Menunggu Pengawas Lapangan',
      priority: newPriority,
      steps: [
        {
          role: '1. Pengajuan Karyawan',
          actorName: emp.name,
          timestamp: 'Hari ini',
          status: 'completed',
        },
        {
          role: '2. Verifikasi Pengawas Lapangan',
          actorName: site.siteManager,
          timestamp: 'Pending Review',
          status: 'pending',
        },
        {
          role: '3. Approval Final HR & Direksi',
          actorName: 'Ir. Hendra Gunawan (VP Human Capital)',
          timestamp: 'Pending',
          status: 'pending',
        },
      ],
    };

    onAddNewApproval(newItem);
    setIsCreating(false);
    setNewDesc('');
  };

  return (
    <div className="space-y-5">
      {/* Top Filter and Segmented Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setTabFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              tabFilter === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menunggu Persetujuan ({approvals.filter((a) => a.status.includes('Menunggu')).length})
          </button>
          <button
            onClick={() => setTabFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              tabFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({approvals.length})
          </button>
          <button
            onClick={() => setTabFilter('APPROVED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              tabFilter === 'APPROVED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui
          </button>
        </div>

        {/* Search & New Ticket CTA */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, nama, tipe..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white"
            />
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Pengajuan Baru</span>
          </button>
        </div>
      </div>

      {/* New Request Creation Form Panel */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white p-5 rounded-xl border-2 border-[#0f766e]/40 shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0f766e]" />
              Formulir Pengajuan Baru
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-slate-700 text-xs"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                Tipe Pengajuan
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ApprovalType)}
                className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Lembur Konstruksi Cor Beton">Lembur Konstruksi Cor Beton</option>
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Klaim Operasional Lapangan">Klaim Operasional Lapangan</option>
                <option value="Surat Tugas K3">Surat Tugas K3</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                Nama Karyawan
              </label>
              <select
                value={newEmpId}
                onChange={(e) => setNewEmpId(e.target.value)}
                className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.jobCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                Prioritas
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'Biasa' | 'Penting' | 'Kritis')}
                className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
              Keterangan / Keperluan
            </label>
            <textarea
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Contoh: Pengawasan pemasangan perancah scaffolding Zona Barat..."
              rows={2}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59]"
            >
              Kirim Pengajuan
            </button>
          </div>
        </form>
      )}

      {/* Approvals List */}
      <div className="space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada tiket persetujuan dalam kategori ini.
          </div>
        ) : (
          filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all text-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {app.ticketNumber}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        app.priority === 'Kritis'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : app.priority === 'Penting'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {app.priority}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {app.dateRequested}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {app.type}
                  </h3>
                  <p className="text-slate-600 line-clamp-1">
                    {app.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {app.costEstimate && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Estimasi Biaya
                      </span>
                      <span className="font-mono font-bold text-sm text-[#065f46] tabular-nums">
                        {FORMAT_IDR(app.costEstimate)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenApproval(app)}
                      className="px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {app.status.includes('Menunggu') && (
                      <button
                        onClick={() => onQuickApprove(app.id)}
                        className="px-3.5 py-1.5 font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-lg transition-colors shadow-2xs"
                      >
                        Setujui Langsung
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Audit Trail Compact Strip */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Tahapan:</span>
                {app.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        step.status === 'completed'
                          ? 'bg-[#0f766e]'
                          : step.status === 'rejected'
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    <span className={step.status === 'completed' ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                      {step.role} ({step.actorName})
                    </span>
                    {idx < app.steps.length - 1 && (
                      <span className="text-slate-300">&rarr;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
