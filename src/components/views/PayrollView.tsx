'use client';

import React, { useState, useMemo } from 'react';
import { PayrollRecord, PropertySite, Employee, PayrollStatus } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import {
  StatusBadge,
  KPICard,
  PageHeader,
  FilterBar,
  SearchInput,
  Select,
  EmptyState,
} from '@/components/ui';
import {
  PayrollPeriodSelector,
  BatchProcessModal,
  BankExportModal,
  TransferProofModal,
  GeneratePeriodModal,
} from '@/components/payroll';
import {
  Banknote,
  FileSpreadsheet,
  Download,
  CheckCircle,
  CreditCard,
  Building2,
  DollarSign,
  Receipt,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface PayrollViewProps {
  payrollRecords: PayrollRecord[];
  sites: PropertySite[];
  employees?: Employee[];
  selectedSiteFilter: string;
  onOpenPaySlip: (record: PayrollRecord) => void;
  onBatchProcessPayroll: (
    selectedRecordIds?: string[],
    disbursementDate?: string,
    transferNote?: string
  ) => Promise<void> | void;
  onUpdatePayrollStatus?: (
    recordId: string,
    newStatus: PayrollStatus,
    updates?: Partial<PayrollRecord>
  ) => Promise<void> | void;
  onUploadTransferProof?: (
    recordId: string,
    proofUrl: string,
    note?: string
  ) => Promise<void> | void;
  onGenerateNewPeriod?: (newPeriod: string) => Promise<void> | void;
  activePeriod?: string;
  onSelectPeriod?: (period: string) => void;
  availablePeriods?: string[];
  isEmployeeView?: boolean;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrollRecords,
  sites,
  employees = [],
  selectedSiteFilter,
  onOpenPaySlip,
  onBatchProcessPayroll,
  onUpdatePayrollStatus,
  onUploadTransferProof,
  onGenerateNewPeriod,
  activePeriod = 'Oktober 2026',
  onSelectPeriod,
  availablePeriods = ['Oktober 2026'],
  isEmployeeView = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [localActivePeriod, setLocalActivePeriod] = useState(activePeriod);

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedRecordForProof, setSelectedRecordForProof] = useState<PayrollRecord | null>(null);

  // Sync current active period
  const effectivePeriod = activePeriod || localActivePeriod;
  const handleSelectPeriod = (p: string) => {
    setLocalActivePeriod(p);
    if (onSelectPeriod) onSelectPeriod(p);
  };

  // Filter records by period first
  const periodRecords = useMemo(() => {
    return payrollRecords.filter((r) => r.period === effectivePeriod);
  }, [payrollRecords, effectivePeriod]);

  // Status summary for period selector
  const statusSummary = useMemo(() => {
    return {
      total: periodRecords.length,
      paid: periodRecords.filter((r) => r.status === 'Dibayar').length,
      approved: periodRecords.filter((r) => r.status === 'Disetujui').length,
      draft: periodRecords.filter((r) => r.status === 'Draft').length,
    };
  }, [periodRecords]);

  // Filter records by site, status, and search query
  const filteredRecords = useMemo(() => {
    return periodRecords.filter((rec) => {
      const matchSite =
        selectedSiteFilter === 'ALL' ||
        sites.find((s) => s.id === selectedSiteFilter)?.name === rec.siteName ||
        rec.siteName.toLowerCase().includes(
          (sites.find((s) => s.id === selectedSiteFilter)?.name || '').toLowerCase()
        );

      const matchStatus = statusFilter === 'ALL' || rec.status === statusFilter;

      const matchSearch =
        searchQuery === '' ||
        rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.nik.includes(searchQuery) ||
        rec.jobCode.toLowerCase().includes(searchQuery.toLowerCase());

      return (selectedSiteFilter === 'ALL' || matchSite) && matchStatus && matchSearch;
    });
  }, [periodRecords, selectedSiteFilter, sites, statusFilter, searchQuery]);

  // Aggregate metrics
  const totalNetPayAll = filteredRecords.reduce((acc, r) => acc + r.gajiBersih, 0);
  const totalDeductionsAll = filteredRecords.reduce((acc, r) => acc + r.totalDeductions, 0);
  const totalSiteAllowances = filteredRecords.reduce(
    (acc, r) => acc + r.tunjanganProyekLapangan + r.tunjanganK3,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Page Header */}
      <PageHeader
        title={isEmployeeView ? 'Slip Gaji Saya' : 'Penggajian Properti (Payroll)'}
        subtitle={
          isEmployeeView
            ? 'Transparansi perhitungan gaji pokok, lembur, tunjangan lapangan, dan potongan BPJS/Pajak.'
            : 'Kompilasi gaji kotor, lembur terverifikasi, tunjangan K3, kasbon, dan transfer payroll massal.'
        }
        icon={<Banknote className="w-5 h-5 text-[#0f766e]" />}
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f766e] font-mono text-[10px] font-bold border border-teal-200">
            Periode: {effectivePeriod}
          </span>
        }
        actions={
          !isEmployeeView && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekspor CSV / Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Jalankan Payroll Massal</span>
              </button>
            </div>
          )
        }
      />

      {/* 2. Payroll Period Selector & Status Bar */}
      {!isEmployeeView && (
        <PayrollPeriodSelector
          periods={availablePeriods}
          selectedPeriod={effectivePeriod}
          onSelectPeriod={handleSelectPeriod}
          onOpenGenerateModal={onGenerateNewPeriod ? () => setIsGenerateModalOpen(true) : undefined}
          statusSummary={statusSummary}
          canManage={!isEmployeeView}
        />
      )}

      {/* 3. Metrics Row — Employee View vs Admin View */}
      {isEmployeeView ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-t-2 border-t-[#0f766e] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Slip Gaji Saya
              </span>
              <StatusBadge status={filteredRecords[0]?.status || 'Draft'} size="sm" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {filteredRecords[0]?.employeeName || 'Karyawan'}
            </h2>
            <p className="text-xs text-slate-500">
              Periode: <strong className="text-slate-800">{filteredRecords[0]?.period || effectivePeriod}</strong> · Rekening:{' '}
              <span className="font-mono text-slate-700">{filteredRecords[0]?.paymentMethod || '-'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Gaji Bersih Diterima
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#065f46]">
                {filteredRecords[0] ? FORMAT_IDR(filteredRecords[0].gajiBersih) : 'Rp 0'}
              </span>
            </div>
            {filteredRecords[0] && (
              <button
                type="button"
                onClick={() => onOpenPaySlip(filteredRecords[0])}
                className="px-3.5 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Lihat Detail Slip</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <KPICard
            label="Total Gaji Bersih"
            value={FORMAT_IDR(totalNetPayAll)}
            color="primary"
            icon={<Banknote className="w-4 h-4 text-[#0f766e]" />}
            sublabel={
              <span className="text-[11px] text-slate-500">
                Periode: <strong className="text-slate-800">{effectivePeriod}</strong>
              </span>
            }
          />

          <KPICard
            label="Tunjangan Proyek & K3"
            value={FORMAT_IDR(totalSiteAllowances)}
            color="primary"
            icon={<Building2 className="w-4 h-4 text-[#0f766e]" />}
            sublabel={<span className="text-[11px] text-emerald-700 font-medium">Kompensasi penugasan konstruksi</span>}
          />

          <KPICard
            label="Total Potongan (BPJS/Pajak/Kasbon)"
            value={FORMAT_IDR(totalDeductionsAll)}
            color="rose"
            icon={<DollarSign className="w-4 h-4 text-rose-600" />}
            sublabel={<span className="text-[11px] text-slate-500">Kepatuhan BPJS, PPh 21 & denda</span>}
          />

          <KPICard
            label="Status Pembayaran Gaji"
            value={`${filteredRecords.filter((r) => r.status === 'Dibayar').length} / ${filteredRecords.length}`}
            unit="Terselesaikan"
            color="amber"
            icon={<CheckCircle className="w-4 h-4 text-amber-500" />}
            sublabel={<span className="text-[11px] text-emerald-700 font-semibold">Transfer Rekening Payroll</span>}
          />
        </div>
      )}

      {/* 4. Control Strip */}
      <FilterBar
        summary={
          <span className="text-slate-500 text-xs">
            Menampilkan <strong className="text-slate-800">{filteredRecords.length}</strong> slip gaji ({effectivePeriod})
          </span>
        }
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari karyawan, NIK, atau slip..."
          className="w-full md:w-80"
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel="Filter Status Payroll"
          options={[
            { value: 'ALL', label: 'Semua Status Payroll' },
            { value: 'Dibayar', label: 'Dibayar' },
            { value: 'Disetujui', label: 'Disetujui' },
            { value: 'Draft', label: 'Draft' },
          ]}
          className="w-full sm:w-auto"
        />
      </FilterBar>

      {/* 5. Desktop Ledger Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                <th className="px-4">Karyawan & NIK</th>
                <th className="px-4">Lokasi Proyek</th>
                <th className="px-4 text-right">Gaji Pokok</th>
                <th className="px-4 text-right">Tunjangan & K3</th>
                <th className="px-4 text-right">Lembur</th>
                <th className="px-4 text-right">Potongan</th>
                <th className="px-4 text-right">Gaji Bersih</th>
                <th className="px-4 text-center">Status</th>
                {!isEmployeeView && <th className="px-4 text-center">Bukti Resi</th>}
                <th className="px-4 text-center">Aksi Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <EmptyState
                  variant="table"
                  colSpan={isEmployeeView ? 9 : 10}
                  icon={<Banknote className="w-8 h-8 text-slate-300" />}
                  title="Tidak ada data slip gaji pada periode ini"
                  message="Pilih periode lain di atas atau gunakan tombol Buat Periode Baru."
                />
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="h-14 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4">
                      <div className="font-bold text-slate-900">{rec.employeeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{rec.nik}</div>
                    </td>

                    <td className="px-4 text-slate-700 truncate max-w-37.5">
                      <div className="font-medium text-slate-800 truncate">{rec.siteName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{rec.jobCode}</span>
                    </td>

                    <td className="px-4 text-right font-mono text-slate-800 tabular-nums">
                      {FORMAT_IDR(rec.gajiPokok)}
                    </td>

                    <td className="px-4 text-right font-mono text-slate-800 tabular-nums">
                      {FORMAT_IDR(rec.tunjanganProyekLapangan + rec.tunjanganK3)}
                    </td>

                    <td className="px-4 text-right font-mono text-slate-800 tabular-nums">
                      <div>{FORMAT_IDR(rec.upahLembur)}</div>
                      {rec.lemburHours > 0 && (
                        <span className="text-[10px] text-slate-400">({rec.lemburHours}j)</span>
                      )}
                    </td>

                    <td className="px-4 text-right font-mono text-rose-700 tabular-nums">
                      <div>-{FORMAT_IDR(rec.totalDeductions)}</div>
                      {((rec.potonganKasbon || 0) > 0 || (rec.potonganKeterlambatan || 0) > 0) && (
                        <span className="text-[9px] text-amber-600 block">
                          Kasbon/Denda: {FORMAT_IDR((rec.potonganKasbon || 0) + (rec.potonganKeterlambatan || 0))}
                        </span>
                      )}
                    </td>

                    <td className="px-4 text-right font-mono font-bold text-[#065f46] text-sm tabular-nums">
                      {FORMAT_IDR(rec.gajiBersih)}
                    </td>

                    <td className="px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <StatusBadge status={rec.status} size="sm" />
                        {!isEmployeeView && onUpdatePayrollStatus && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {rec.status === 'Draft' && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(rec.id, 'Disetujui')}
                                className="text-[10px] text-[#0f766e] hover:underline font-semibold cursor-pointer"
                                title="Setujui draft gaji"
                              >
                                Setujui
                              </button>
                            )}
                            {rec.status === 'Disetujui' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdatePayrollStatus(rec.id, 'Dibayar', {
                                    disbursementDate: new Date().toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    }),
                                  })
                                }
                                className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                                title="Tandai telah dibayar"
                              >
                                Tandai Cair
                              </button>
                            )}
                            {rec.status === 'Dibayar' && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(rec.id, 'Draft')}
                                className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Kembalikan ke draft"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Bukti Transfer Resi column */}
                    {!isEmployeeView && (
                      <td className="px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForProof(rec)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                            rec.transferProofUrl
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={rec.transferProofUrl ? 'Lihat Bukti Transfer' : 'Lampirkan Bukti Transfer'}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{rec.transferProofUrl ? 'Ada Resi' : 'Upload'}</span>
                        </button>
                      </td>
                    )}

                    <td className="px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenPaySlip(rec)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Menampilkan {filteredRecords.length} slip gaji periode {effectivePeriod}</span>
          <span className="font-mono text-[11px]">Terintegrasi: Lembur, Kasbon, Keterlambatan, BPJS & PPh 21</span>
        </div>
      </div>

      {/* 6. Mobile Card Feed */}
      <div className="md:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <EmptyState
            variant="card"
            icon={<Banknote className="w-8 h-8 text-slate-300" />}
            title="Tidak ada data slip gaji pada periode ini"
            message="Pilih periode lain di atas atau gunakan tombol Buat Periode Baru."
          />
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                    {rec.employeeName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono text-slate-400">{rec.nik}</span>
                    <span>·</span>
                    <span className="text-[#0f766e] font-semibold">{rec.siteName}</span>
                    <span>({rec.jobCode})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={rec.status} size="sm" />
                  {!isEmployeeView && onUpdatePayrollStatus && rec.status === 'Draft' && (
                    <button
                      type="button"
                      onClick={() => onUpdatePayrollStatus(rec.id, 'Disetujui')}
                      className="text-[10px] text-[#0f766e] font-bold hover:underline"
                    >
                      Setujui
                    </button>
                  )}
                </div>
              </div>

              {/* Gaji Bersih Highlight Box */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Gaji Bersih Diterima
                  </span>
                  <span className="text-lg font-bold font-mono text-[#065f46] tabular-nums">
                    {FORMAT_IDR(rec.gajiBersih)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Periode
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{rec.period}</span>
                </div>
              </div>

              {/* Rincian Finansial 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block">Gaji Pokok</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">
                    {FORMAT_IDR(rec.gajiPokok)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tunjangan & K3</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">
                    {FORMAT_IDR(rec.tunjanganProyekLapangan + rec.tunjanganK3)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Lembur</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">
                    {FORMAT_IDR(rec.upahLembur)}{' '}
                    {rec.lemburHours > 0 && (
                      <span className="text-[10px] text-slate-400">({rec.lemburHours}j)</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-500 block">Potongan Total</span>
                  <span className="font-mono font-medium text-rose-700 tabular-nums">
                    -{FORMAT_IDR(rec.totalDeductions)}
                  </span>
                </div>
              </div>

              {/* Mobile Actions: Bukti Resi & Detail Slip */}
              <div className="flex items-center gap-2 pt-1">
                {!isEmployeeView && (
                  <button
                    type="button"
                    onClick={() => setSelectedRecordForProof(rec)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-slate-500" />
                    <span>{rec.transferProofUrl ? 'Bukti Resi' : 'Upload Resi'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenPaySlip(rec)}
                  className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0f766e] font-bold text-xs rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Lihat Detail Slip</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 7. Modal Mounts */}
      {/* A. Batch Process Confirmation Modal */}
      <BatchProcessModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        records={periodRecords}
        period={effectivePeriod}
        onConfirmBatch={async (selectedIds, date, note) => {
          await onBatchProcessPayroll(selectedIds, date, note);
        }}
      />

      {/* B. Bank Export Multi-format Modal */}
      <BankExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={filteredRecords}
        period={effectivePeriod}
      />

      {/* C. Generate New Period Modal */}
      {onGenerateNewPeriod && (
        <GeneratePeriodModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          existingPeriods={availablePeriods}
          employees={employees}
          onGenerate={async (newP) => {
            await onGenerateNewPeriod(newP);
          }}
        />
      )}

      {/* D. Transfer Proof Attachment Modal */}
      {onUploadTransferProof && (
        <TransferProofModal
          isOpen={!!selectedRecordForProof}
          onClose={() => setSelectedRecordForProof(null)}
          record={selectedRecordForProof}
          onSave={async (id, url, note) => {
            await onUploadTransferProof(id, url, note);
          }}
        />
      )}
    </div>
  );
};
