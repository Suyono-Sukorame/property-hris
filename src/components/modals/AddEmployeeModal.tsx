'use client';

import React, { useState, useEffect } from 'react';
import { Employee, PropertySite } from '@/types/hris';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { EmployeeFormFields, EmployeeFormData } from '@/components/employee/EmployeeFormFields';
import { UserPlus, AlertCircle } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: PropertySite[];
  onAddEmployee: (emp: Employee) => void;
  existingNiks?: string[];
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  sites,
  onAddEmployee,
  existingNiks = [],
}) => {
  const getInitialFormData = (): EmployeeFormData => ({
    name: '',
    nik: '',
    title: '',
    division: 'Pemasaran & Penjualan',
    siteId: sites[0]?.id || 'SITE-01',
    email: '',
    phone: '',
    contractType: 'PKWTT (Tetap)',
    k3Certified: false,
    bloodType: 'O+',
    emergencyContact: '',
    baseSalary: 3500000,
    siteAllowance: 0,
    transportMealAllowance: 500000,
    bankAccount: '',
    joinDate: new Date().toISOString().slice(0, 10),
    photoUrl: undefined,
  });

  const [formData, setFormData] = useState<EmployeeFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setGeneralError(null);
    }
  }, [isOpen, sites]);

  const handleChange = (field: keyof EmployeeFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    }

    if (!formData.nik.trim()) {
      newErrors.nik = 'NIK wajib diisi.';
    } else if (!/^\d{16}$/.test(formData.nik.trim())) {
      newErrors.nik = 'NIK harus berupa 16 digit angka.';
    } else if (existingNiks.includes(formData.nik.trim())) {
      newErrors.nik = 'NIK ini sudah terdaftar di sistem. Gunakan NIK yang berbeda.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Jabatan / posisi kerja wajib diisi.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setGeneralError('Silakan lengkapi kolom yang bertanda merah di atas.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedSite = sites.find((s) => s.id === formData.siteId) || sites[0] || {
      id: 'SITE-01',
      name: 'Griya Bumi Raya',
    };

    const initials =
      formData.name
        .trim()
        .split(/\s+/)
        .filter((n) => !n.includes('.') && n.length > 0)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('') || 'EM';

    const newEmp: Employee = {
      id: `EMP-${Date.now()}`,
      nik: formData.nik.trim(),
      name: formData.name.trim(),
      title: formData.title.trim(),
      jobCode: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      division: formData.division,
      siteId: matchedSite.id,
      siteName: matchedSite.name,
      email:
        formData.email.trim() ||
        `${formData.name.toLowerCase().trim().replace(/\s+/g, '.')}@bumiraya.co.id`,
      phone: formData.phone.trim() || '+62 812-9988-7700',
      joinDate: formData.joinDate || new Date().toISOString().slice(0, 10),
      status: 'Aktif',
      contractType: formData.contractType,
      k3Certified: formData.k3Certified,
      bloodType: formData.bloodType ? (formData.bloodType as Employee['bloodType']) : undefined,
      emergencyContact: formData.emergencyContact.trim() || 'Kontak Darurat Keluarga Terdaftar',
      baseSalary: Number(formData.baseSalary) || 3500000,
      siteAllowance: Number(formData.siteAllowance) || 0,
      k3Allowance: formData.k3Certified ? 500000 : 0,
      transportMealAllowance: Number(formData.transportMealAllowance) || 500000,
      bankAccount: formData.bankAccount.trim() || `Bank BRI a.n ${formData.name.trim()}`,
      initials,
      avatarColor: '#0f766e',
      photoUrl: formData.photoUrl,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Karyawan Baru"
      subtitle="Pendaftaran Anggota Tim & Master Payroll"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto Profil Avatar Upload Header */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl">
          <AvatarUpload
            photoUrl={formData.photoUrl}
            employeeName={formData.name || 'Calon Karyawan'}
            initials={
              formData.name
                ? formData.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join('')
                : 'EM'
            }
            size="lg"
            onPhotoChange={(url) => handleChange('photoUrl', url || undefined)}
          />
          <p className="text-xs sm:text-[11px] font-semibold text-slate-700 mt-2">
            {formData.photoUrl ? 'Foto Profil Terpasang' : 'Unggah Foto Profil'}
          </p>
          <p className="text-[11px] sm:text-[10px] text-slate-400 text-center px-2">
            Klik avatar untuk memilih foto (JPG/PNG, otomatis dikompresi)
          </p>
        </div>

        {generalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Shared Form Fields */}
        <EmployeeFormFields
          data={formData}
          onChange={handleChange}
          sites={sites}
          errors={errors}
          mode="add"
        />

        {/* Footer Actions */}
        <div className="sticky bottom-0 pt-4 pb-safe border-t border-slate-200 bg-white flex items-center justify-end gap-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Simpan &amp; Daftarkan Karyawan</span>
            <span className="sm:hidden">Simpan</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
