'use client';
import React, { useState } from 'react';
import { PayrollRecord, PropertySite } from '@/types/hris';
import { FORMAT_IDR } from '@/data/mockData';
import { StatusBadge } from '@/components/ui';
import {
  Banknote,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface PayrollViewProps {
  payrollRecords: PayrollRecord[];
  sites: PropertySite[];
  selectedSiteFilter: string;
  onOpenPaySlip: (record: PayrollRecord) => void;
  onBatchProcessPayroll: () => void;
  isEmployeeView?: boolean;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrollRecords,
  sites,
  selectedSiteFilter,
  onOpenPaySlip,
  onBatchProcessPayroll,
  isEmployeeView = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchNotice, setBatchNotice] = useState(false);

  const filteredRecords = payrollRecords.filter((rec) => {
    const matchSite =
      selectedSiteFilter === 'ALL' ||
      sites.find((s) => s.id === selectedSiteFilter)?.name === rec.siteName ||
      rec.siteName.toLowerCase().includes(
        (sites.find((s) => s.id === selectedSiteFilter)?.name || '').toLowerCase()
      );

    const matchStatus =
      statusFilter === 'ALL' || rec.status === statusFilter;

    const matchSearch =
      searchQuery === '' ||
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.nik.includes(searchQuery) ||
      rec.jobCode.toLowerCase().includes(searchQuery.toLowerCase());

    return (selectedSiteFilter === 'ALL' || matchSite) && matchStatus && matchSearch;
  });

  const totalEarningsAll = filteredRecords.reduce((acc, r) => acc + r.totalEarnings, 0);
  const totalNetPayAll = filteredRecords.reduce((acc, r) => acc + r.gajiBersih, 0);
  const totalDeductionsAll = filteredRecords.reduce((acc, r) => acc + r.totalDeductions, 0);
  const totalSiteAllowances = filteredRecords.reduce(
    (acc, r) => acc + r.tunjanganProyekLapangan + r.tunjanganK3,
    0
  );

  const handleBatch = () => {
    onBatchProcessPayroll();
    setBatchNotice(true);
    setTimeout(() => setBatchNotice(false), 3500);
  };

  const exportPayrollCSV = () => {
    const headers = [
      'ID',
      'NIK',
      'Nama',
      'Site',
      'Gaji Pokok',
      'Tunjangan Jabatan',
      'Tunjangan Site',
      'Tunjangan K3',
      'Lembur',
      'Total Bruto',
      'BPJS TK',
      'BPJS Kes',
      'PPh 21',
      'Total Potongan',
      'Gaji Bersih (THP)',
      'Status',
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.nik,
      `"${r.employeeName}"`,
      `"${r.siteName}"`,
      r.gajiPokok,
      r.tunjanganJabatan,
      r.tunjanganProyekLapangan,
      r.tunjanganK3,
      r.upahLembur,
      r.totalEarnings,
      r.potonganBPJSTK,
      r.potonganBPJSKes,
      r.potonganPPh21,
      r.totalDeductions,
      r.gajiBersih,
      r.status,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(x => x.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `ledger_payroll_properti_oktober_2026.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row — Employee View vs Admin View */}
      {isEmployeeView ? (
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              Periode: <strong className="text-slate-800">{filteredRecords[0]?.period || 'Oktober 2026'}</strong> · Rekening:{' '}
              <span className="font-mono text-slate-700">{filteredRecords[0]?.paymentMethod || '-'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Gaji Bersih (THP)
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#065f46]">
                {filteredRecords[0] ? FORMAT_IDR(filteredRecords[0].gajiBersih) : 'Rp 0'}
              </span>
            </div>
            {filteredRecords[0] && (
              <button
                type="button"
                onClick={() => onOpenPaySlip(filteredRecords[0])}
                className="px-3.5 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Lihat Detail Slip</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Total Penggajian Bersih (THP)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#065f46] tabular-nums">
                {FORMAT_IDR(totalNetPayAll)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Periode: <strong className="text-slate-800">Oktober 2026</strong>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-[#0f766e] shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Tunjangan Proyek & K3
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {FORMAT_IDR(totalSiteAllowances)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-2">
              Kompensasi penugasan konstruksi
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-rose-500 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Total Potongan (Pajak & BPJS)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-rose-700 tabular-nums">
                {FORMAT_IDR(totalDeductionsAll)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Kepatuhan UU BPJS & PPh 21 TER
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-2 border-t-amber-500 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Status Pembayaran Gaji
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {filteredRecords.filter((r) => r.status === 'Dibayar').length} / {filteredRecords.length}
              </span>
              <span className="text-xs text-slate-500">Terselesaikan</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-2">
              Transfer Rekening Payroll
            </p>
          </div>
        </div>
      )}

      {/* Batch Processing Notification Banner */}
      {batchNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <strong className="font-bold">Proses Payroll Massal Berhasil Dijalankan!</strong>
              <p className="text-emerald-700 text-[11px]">
                Seluruh data gaji periode Oktober 2026 telah disetujui dan siap ditransfer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan, NIK, atau slip..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter Status Payroll"
            className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 cursor-pointer"
          >
            <option value="ALL">Semua Status Payroll</option>
            <option value="Dibayar">Dibayar</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Draft">Draft</option>
          </select>

          <button
            onClick={exportPayrollCSV}
            className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Payroll CSV</span>
          </button>

          <button
            onClick={handleBatch}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Jalankan Payroll Massal</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="h-10 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                <th className="px-4">Karyawan & NIK</th>
                <th className="px-4">Lokasi Proyek</th>
                <th className="px-4 text-right">Gaji Pokok</th>
                <th className="px-4 text-right">Tunjangan Proyek & K3</th>
                <th className="px-4 text-right">Lembur Proyek</th>
                <th className="px-4 text-right">Potongan Pajak/BPJS</th>
                <th className="px-4 text-right">Gaji Bersih (THP)</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4 text-center">Slip Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
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
                    -{FORMAT_IDR(rec.totalDeductions)}
                  </td>

                  <td className="px-4 text-right font-mono font-bold text-[#065f46] text-sm tabular-nums">
                    {FORMAT_IDR(rec.gajiBersih)}
                  </td>

                  <td className="px-4 text-center">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>

                  <td className="px-4 text-center">
                    <button
                      onClick={() => onOpenPaySlip(rec)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors inline-flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Menampilkan {filteredRecords.length} slip gaji periode berjalan</span>
          <span className="font-mono text-[11px]">Perhitungan PPh 21, BPJS Ketenagakerjaan & BPJS Kesehatan</span>
        </div>
      </div>
    </div>
  );
};
