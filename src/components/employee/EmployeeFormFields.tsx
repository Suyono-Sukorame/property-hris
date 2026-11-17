'use client';
import React from 'react';
import { PropertySite } from '@/types/hris';
import { FormField } from '@/components/ui/FormField';

export interface EmployeeFormData {
  name: string;
  nik: string;
  title: string;
  division: string;
  siteId: string;
  email: string;
  phone: string;
  contractType: 'PKWTT (Tetap)' | 'PKWT (Kontrak Proyek)' | 'Konsultan Ahli';
  k3Certified: boolean;
  bloodType: 'A+' | 'B+' | 'AB+' | 'O+' | 'O-' | '';
  emergencyContact: string;
  baseSalary: number;
  siteAllowance: number;
  transportMealAllowance: number;
  bankAccount: string;
  joinDate: string;
  photoUrl?: string;
}

interface EmployeeFormFieldsProps {
  data: EmployeeFormData;
  onChange: (field: keyof EmployeeFormData, value: unknown) => void;
  sites: PropertySite[];
  errors?: Partial<Record<keyof EmployeeFormData, string>>;
  mode?: 'add' | 'edit';
}

const INPUT_CLASS =
  'w-full h-10 sm:h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm sm:text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-colors';
const SELECT_CLASS =
  'w-full h-10 sm:h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm sm:text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition-colors cursor-pointer';

const DIVISIONS = [
  'Manajemen',
  'Administrasi & Keuangan',
  'Pemasaran & Penjualan',
  'Teknis Lapangan',
];

const SECTION_HEADER = 'text-xs sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-slate-400 pb-2 sm:pb-1 border-b border-slate-200 sm:border-slate-100 mb-3.5 sm:mb-3';

export const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  data,
  onChange,
  sites,
  errors = {},
  mode = 'add',
}) => {
  return (
    <div className="space-y-5 text-xs text-slate-800">
      {/* ── Section 1: Identitas ─────────────────────────── */}
      <div>
        <p className={SECTION_HEADER}>1. Identitas Karyawan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Nama Lengkap & Gelar" required error={errors.name} className="sm:col-span-2">
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Contoh: Ir. Muhammad Ridwan, S.T."
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Nomor Induk Kependudukan (NIK)" required error={errors.nik}>
            <input
              type="text"
              value={data.nik}
              onChange={(e) => onChange('nik', e.target.value)}
              placeholder="16 Digit NIK KTP"
              maxLength={16}
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          {(mode === 'add' || mode === 'edit') && (
            <FormField label="Tanggal Bergabung" error={errors.joinDate}>
              <input
                type="date"
                value={data.joinDate}
                onChange={(e) => onChange('joinDate', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
          )}
        </div>
      </div>

      {/* ── Section 2: Jabatan & Penugasan ───────────────── */}
      <div>
        <p className={SECTION_HEADER}>2. Jabatan & Penugasan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Jabatan / Posisi Kerja" required error={errors.title}>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Contoh: Site QA/QC Inspector"
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Divisi / Departemen" error={errors.division}>
            <select
              value={data.division}
              onChange={(e) => onChange('division', e.target.value)}
              className={SELECT_CLASS}
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Lokasi Proyek" error={errors.siteId}>
            <select
              value={data.siteId}
              onChange={(e) => onChange('siteId', e.target.value)}
              className={SELECT_CLASS}
            >
              {sites.map((site) => {
                const displayName = site.name.length > 35 
                  ? `${site.name.substring(0, 35)}...` 
                  : site.name;
                return (
                  <option key={site.id} value={site.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </FormField>

          <FormField label="Jenis Kontrak" error={errors.contractType}>
            <select
              value={data.contractType}
              onChange={(e) => onChange('contractType', e.target.value as EmployeeFormData['contractType'])}
              className={SELECT_CLASS}
            >
              <option value="PKWTT (Tetap)">Karyawan Tetap (PKWTT)</option>
              <option value="PKWT (Kontrak Proyek)">Kontrak Proyek (PKWT)</option>
              <option value="Konsultan Ahli">Konsultan Ahli</option>
            </select>
          </FormField>
        </div>
      </div>

      {/* ── Section 3: Kontak ─────────────────────────────── */}
      <div>
        <p className={SECTION_HEADER}>3. Kontak</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="nama@bumiraya.co.id"
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="No. HP / WhatsApp" error={errors.phone}>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+62 812-xxxx-xxxx"
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          <FormField label="Kontak Darurat (Keluarga)" error={errors.emergencyContact} className="sm:col-span-2">
            <input
              type="text"
              value={data.emergencyContact}
              onChange={(e) => onChange('emergencyContact', e.target.value)}
              placeholder="Contoh: Istri (Siti) - 0812-3456-7890"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </div>

      {/* ── Section 4: Kompensasi ────────────────────────── */}
      <div>
        <p className={SECTION_HEADER}>4. Kompensasi & Rekening</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Gaji Pokok (IDR/bulan)" error={errors.baseSalary}>
            <input
              type="number"
              min="0"
              step="500000"
              value={data.baseSalary}
              onChange={(e) => onChange('baseSalary', Number(e.target.value))}
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          <FormField label="Tunjangan Lapangan (IDR/bulan)" error={errors.siteAllowance}>
            <input
              type="number"
              min="0"
              step="250000"
              value={data.siteAllowance}
              onChange={(e) => onChange('siteAllowance', Number(e.target.value))}
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          <FormField label="Tunjangan Makan + Transport (IDR/bulan)" error={errors.transportMealAllowance}>
            <input
              type="number"
              min="0"
              step="100000"
              value={data.transportMealAllowance}
              onChange={(e) => onChange('transportMealAllowance', Number(e.target.value))}
              className={`${INPUT_CLASS} font-mono`}
            />
          </FormField>

          <FormField label="Rekening Bank Pembayaran Gaji" error={errors.bankAccount}>
            <input
              type="text"
              value={data.bankAccount}
              onChange={(e) => onChange('bankAccount', e.target.value)}
              placeholder="Contoh: Bank BRI 0001-01-xxxxxx a.n Nama"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </div>

      {/* ── Section 5: Medis & K3 ─────────────────────────── */}
      <div>
        <p className={SECTION_HEADER}>5. Medis & K3</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Golongan Darah" error={errors.bloodType}>
            <select
              value={data.bloodType}
              onChange={(e) => onChange('bloodType', e.target.value as EmployeeFormData['bloodType'])}
              className={SELECT_CLASS}
            >
              <option value="">— Tidak diketahui —</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </FormField>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.k3Certified}
                onChange={(e) => onChange('k3Certified', e.target.checked)}
                className="rounded text-[#0f766e] focus:ring-[#0f766e] accent-[#0f766e] w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-700">
                Sertifikat K3 AK3 Umum / Konstruksi
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
