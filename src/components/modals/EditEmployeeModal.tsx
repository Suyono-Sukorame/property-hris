'use client';
import React, { useState, useEffect } from 'react';
import { Employee, PropertySite, EmployeeStatus } from '@/types/hris';
import { X, UserCheck, Save, AlertCircle } from 'lucide-react';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  sites: PropertySite[];
  onUpdateEmployee: (updated: Employee) => void;
}

const STARTUP_DIVISIONS = [
  'Manajemen',
  'Administrasi & Keuangan',
  'Pemasaran & Penjualan',
  'Teknis Lapangan',
];

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  sites,
  onUpdateEmployee,
}) => {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [title, setTitle] = useState('');
  const [division, setDivision] = useState(STARTUP_DIVISIONS[0]);
  const [siteId, setSiteId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('Aktif');
  const [contractType, setContractType] = useState<'PKWTT (Tetap)' | 'PKWT (Kontrak Proyek)'>('PKWTT (Tetap)');
  const [baseSalary, setBaseSalary] = useState(3500000);
  const [transportMealAllowance, setTransportMealAllowance] = useState(500000);
  const [siteAllowance, setSiteAllowance] = useState(0);
  const [bankAccount, setBankAccount] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize state whenever employee changes or modal opens
  useEffect(() => {
    if (employee && isOpen) {
      setName(employee.name || '');
      setNik(employee.nik || '');
      setTitle(employee.title || '');
      setDivision(employee.division || STARTUP_DIVISIONS[0]);
      setSiteId(employee.siteId || sites[0]?.id || 'SITE-01');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setStatus(employee.status || 'Aktif');
      setContractType(
        employee.contractType === 'PKWT (Kontrak Proyek)'
          ? 'PKWT (Kontrak Proyek)'
          : 'PKWTT (Tetap)'
      );
      setBaseSalary(employee.baseSalary || 3000000);
      setTransportMealAllowance(employee.transportMealAllowance || 0);
      setSiteAllowance(employee.siteAllowance || 0);
      setBankAccount(employee.bankAccount || '');
      setEmergencyContact(employee.emergencyContact || '');
      setErrorMessage('');
    }
  }, [employee, isOpen, sites]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama karyawan tidak boleh kosong.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Jabatan karyawan tidak boleh kosong.');
      return;
    }

    const matchedSite = sites.find((s) => s.id === siteId) || sites[0];

    const updatedEmp: Employee = {
      ...employee,
      name: name.trim(),
      nik: nik.trim() || employee.nik,
      title: title.trim(),
      division,
      siteId: matchedSite.id,
      siteName: matchedSite.name,
      email: email.trim(),
      phone: phone.trim(),
      status,
      contractType,
      baseSalary: Number(baseSalary) || 0,
      transportMealAllowance: Number(transportMealAllowance) || 0,
      siteAllowance: Number(siteAllowance) || 0,
      k3Allowance: employee.k3Allowance || 0,
      bankAccount: bankAccount.trim(),
      emergencyContact: emergencyContact.trim(),
    };

    onUpdateEmployee(updatedEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0f766e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10">
              <UserCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Edit Data Karyawan
              </h2>
              <p className="text-[11px] text-emerald-100">
                Perbarui profil, penempatan, gaji, dan status tim
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 text-slate-800 text-xs space-y-5">
          {/* Section 1: Data Identitas Diri */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
              1. Identitas & Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="Contoh: Suyono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="16 digit NIK KTP"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="+62 812-xxxx-xxxx"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="nama@bumiraya.co.id"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Kontak Darurat (Keluarga)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="Contoh: Istri (Siti) - 0812-3456-7890"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pekerjaan & Penempatan */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
              2. Jabatan, Divisi & Penempatan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jabatan / Posisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="Contoh: Marketing & Penjualan"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Divisi Kerja
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-white cursor-pointer"
                >
                  {STARTUP_DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Lokasi Penempatan
                </label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-white cursor-pointer"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Status Kerja
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-white cursor-pointer"
                >
                  <option value="Aktif">Aktif Bekerja</option>
                  <option value="Cuti">Sedang Cuti</option>
                  <option value="Nonaktif">Nonaktif / Berhenti</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jenis Kontrak
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as 'PKWTT (Tetap)' | 'PKWT (Kontrak Proyek)')}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-white cursor-pointer"
                >
                  <option value="PKWTT (Tetap)">PKWTT (Karyawan Tetap)</option>
                  <option value="PKWT (Kontrak Proyek)">PKWT (Kontrak Proyek)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Gaji & Rekening Bank */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pb-1 border-b border-slate-100">
              3. Kompensasi & Rekening Gaji
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Gaji Pokok (Rp/bulan)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Uang Makan & Transport (Rp/bulan)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={transportMealAllowance}
                  onChange={(e) => setTransportMealAllowance(Number(e.target.value))}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Rekening Bank Pembayaran Gaji
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                  placeholder="Contoh: Bank BRI 0001-01-000001-00-0 a.n Nama Karyawan"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer text-xs active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

