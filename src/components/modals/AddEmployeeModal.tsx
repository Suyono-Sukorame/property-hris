'use client';
import React, { useState } from 'react';
import { Employee, PropertySite } from '@/types/hris';
import { X, UserPlus } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: PropertySite[];
  onAddEmployee: (emp: Employee) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  sites,
  onAddEmployee,
}) => {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [title, setTitle] = useState('');
  const [division, setDivision] = useState('Teknik Sipil & Struktur');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractType, setContractType] = useState<'PKWTT (Tetap)' | 'PKWT (Kontrak Proyek)'>('PKWT (Kontrak Proyek)');
  const [k3Certified, setK3Certified] = useState(true);
  const [bloodType, setBloodType] = useState<'A+' | 'B+' | 'AB+' | 'O+' | 'O-'>('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [baseSalary, setBaseSalary] = useState(15000000);
  const [siteAllowance, setSiteAllowance] = useState(3500000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nik || !title) return;

    const matchedSite = sites.find((s) => s.id === siteId) || sites[0];
    const initials = name
      .split(' ')
      .filter((n) => !n.includes('.') && n.length > 0)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'EM';

    const newEmp: Employee = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      nik,
      name,
      title,
      jobCode: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      division,
      siteId: matchedSite.id,
      siteName: matchedSite.name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@bumiraya.co.id`,
      phone: phone || '+62 812-9988-7700',
      joinDate: '2026-10-01',
      status: 'Aktif',
      contractType,
      k3Certified,
      bloodType,
      emergencyContact: emergencyContact || 'Kontak Darurat Keluarga Terdaftar',
      baseSalary: Number(baseSalary) || 12000000,
      siteAllowance: Number(siteAllowance) || 3000000,
      k3Allowance: k3Certified ? 1000000 : 0,
      transportMealAllowance: 1800000,
      bankAccount: 'Bank Mandiri Corporate a.n ' + name,
      initials,
      avatarColor: '#0f766e',
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-[#0f766e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <h2 className="text-sm font-bold tracking-tight text-white">
              Tambah Karyawan Baru & Penugasan Proyek
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-slate-800 text-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ir. Muhammad Ridwan, S.T."
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Nomor Induk Kependudukan (NIK) *
              </label>
              <input
                type="text"
                required
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 Digit NIK KTP"
                maxLength={16}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Jabatan / Posisi Kerja *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Site QA/QC Inspector"
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Divisi / Departemen
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              >
                <option value="Teknik Sipil & Struktur">Teknik Sipil & Struktur</option>
                <option value="Arsitektur & Desain Masterplan">Arsitektur & Desain Masterplan</option>
                <option value="MEP (Mekanikal Elektrikal Plumbing)">MEP (Mekanikal Elektrikal)</option>
                <option value="Operasional Proyek & K3 Lapangan">Operasional Proyek & K3 Lapangan</option>
                <option value="Legalitas, Pertanahan & Perizinan">Legalitas, Pertanahan & Perizinan</option>
                <option value="Pemasaran & Penjualan Properti">Pemasaran & Penjualan Properti</option>
                <option value="Keuangan, Pengadaan & HR">Keuangan, Pengadaan & HR</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Penempatan Lokasi Proyek
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Status Perjanjian Kerja
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              >
                <option value="PKWTT (Tetap)">PKWTT (Karyawan Tetap)</option>
                <option value="PKWT (Kontrak Proyek)">PKWT (Kontrak Proyek)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Gaji Pokok Dasar (IDR)
              </label>
              <input
                type="number"
                step="500000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Tunjangan Lapangan (IDR)
              </label>
              <input
                type="number"
                step="250000"
                value={siteAllowance}
                onChange={(e) => setSiteAllowance(Number(e.target.value))}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Golongan Darah
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as any)}
                className="w-full h-[38px] px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={k3Certified}
                  onChange={(e) => setK3Certified(e.target.checked)}
                  className="rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Memiliki Sertifikat AK3 Umum / Konstruksi
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0f766e] rounded-lg hover:bg-[#115e59] transition-colors shadow-2xs"
            >
              Simpan & Daftarkan Karyawan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
