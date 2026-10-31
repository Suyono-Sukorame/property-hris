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
  canApprove?: boolean;
  currentEmployeeId?: string;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  sites,
  employees,
  selectedSiteFilter,
  onOpenApproval,
  onQuickApprove,
  onAddNewApproval,
  canApprove = true,
  currentEmployeeId,
}) => {
  const [tabFilter, setTabFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const effectiveEmpId = currentEmployeeId || employees[0]?.id || '';

  // Form states for new ticket
  const [newType, setNewType] = useState<ApprovalType>('Cuti Tahunan');
  const [newEmpId, setNewEmpId] = useState(effectiveEmpId);
  const [newSiteId, setNewSiteId] = useState(sites[0]?.id || '');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(1000000);
  const [newPriority, setNewPriority] = useState<'Biasa' | 'Penting' | 'Kritis'>('Biasa');

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
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTabFilter('PENDING')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
              tabFilter === 'PENDING'
                ? 'bg-white text-[#0f766e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Menunggu</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
              {approvals.filter((a) => a.status.includes('Menunggu')).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTabFilter('APPROVED')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              tabFilter === 'APPROVED'
                ? 'bg-white text-[#0f766e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui
          </button>
          <button
            type="button"
            onClick={() => setTabFilter('ALL')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              tabFilter === 'ALL'
                ? 'bg-white text-[#0f766e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({approvals.length})
          </button>
        </div>

        {/* Search & New Ticket CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, nama, tipe..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="w-full sm:w-auto h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Pengajuan</span>
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
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Kasbon Karyawan">Kasbon Karyawan</option>
                <option value="Izin Sakit">Izin Sakit</option>
                <option value="Klaim Operasional Lapangan">Klaim Operasional Lapangan</option>
                <option value="Lembur Konstruksi Cor Beton">Lembur Lapangan</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                Nama Pemohon
              </label>
              {canApprove ? (
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
              ) : (
                <div className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 flex items-center font-bold text-xs">
                  {employees.find((e) => e.id === (currentEmployeeId || newEmpId))?.name || 'Saya Sendiri'}
                </div>
              )}
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
          <div className="bg-white p-10 sm:p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada tiket persetujuan dalam kategori ini.
          </div>
        ) : (
          filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all text-xs space-y-3"
            >
              {/* Card Header: Ticket No, Status, Priority, Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
                </div>
                <span className="text-slate-400 text-[11px] font-mono">
                  {app.dateRequested}
                </span>
              </div>

              {/* Card Body: Title, Pemohon, Description, Cost */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">
                    {app.type}
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-2">
                    {app.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pemohon: <strong className="text-slate-700">{app.employeeName}</strong> ({app.siteName})
                  </p>
                </div>

                {app.costEstimate && (
                  <div className="bg-emerald-50/70 border border-emerald-200/60 p-2 sm:p-2.5 rounded-xl shrink-0 sm:text-right">
                    <span className="text-[10px] text-emerald-800 uppercase block font-bold tracking-wider">
                      Estimasi Biaya
                    </span>
                    <span className="font-mono font-bold text-sm text-[#065f46] tabular-nums">
                      {FORMAT_IDR(app.costEstimate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenApproval(app)}
                  className="flex-1 py-2 px-3 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {canApprove && app.status.includes('Menunggu') && (
                  <button
                    type="button"
                    onClick={() => onQuickApprove(app.id)}
                    className="flex-1 py-2 px-3.5 font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer text-center whitespace-nowrap"
                  >
                    Setujui Langsung
                  </button>
                )}
              </div>

              {/* Step Audit Trail Micro-Stepper */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 border-t border-slate-50">
                <span className="font-semibold text-slate-700">Tahap:</span>
                {app.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1">
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
                      {step.role.replace(/^\d+\.\s*/, '')}
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
