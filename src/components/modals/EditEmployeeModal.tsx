'use client';

import React, { useState, useEffect } from 'react';
import { Employee, PropertySite, EmployeeStatus } from '@/types/hris';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { EmployeeFormFields, EmployeeFormData } from '@/components/employee/EmployeeFormFields';
import { Save, AlertCircle } from 'lucide-react';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  sites: PropertySite[];
  onUpdateEmployee: (updated: Employee) => void;
}

const EMPLOYEE_STATUSES: EmployeeStatus[] = ['Aktif', 'Cuti', 'Nonaktif'];

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  sites,
  onUpdateEmployee,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
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

  const [status, setStatus] = useState<EmployeeStatus>('Aktif');
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: employee.name || '',
        nik: employee.nik || '',
        title: employee.title || '',
        division: employee.division || 'Pemasaran & Penjualan',
        siteId: employee.siteId || sites[0]?.id || 'SITE-01',
        email: employee.email || '',
        phone: employee.phone || '',
        contractType: employee.contractType || 'PKWTT (Tetap)',
        k3Certified: !!employee.k3Certified,
        bloodType: employee.bloodType || 'O+',
        emergencyContact: employee.emergencyContact || '',
        baseSalary: employee.baseSalary || 3500000,
        siteAllowance: employee.siteAllowance || 0,
        transportMealAllowance: employee.transportMealAllowance || 500000,
        bankAccount: employee.bankAccount || '',
        joinDate: employee.joinDate || new Date().toISOString().slice(0, 10),
        photoUrl: employee.photoUrl || undefined,
      });
      setStatus(employee.status || 'Aktif');
      setErrors({});
      setGeneralError(null);
    }
  }, [employee, isOpen, sites]);

  if (!isOpen || !employee) return null;

  const handleChange = (field: keyof EmployeeFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama karyawan tidak boleh kosong.';
    }
    if (!formData.nik.trim()) {
      newErrors.nik = 'NIK tidak boleh kosong.';
    } else if (!/^\d{16}$/.test(formData.nik.trim())) {
      newErrors.nik = 'NIK harus berupa 16 digit angka.';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Jabatan karyawan tidak boleh kosong.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setGeneralError('Silakan periksa kolom yang ditandai merah di atas.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedSite = sites.find((s) => s.id === formData.siteId) || sites[0];

    const newInitials =
      formData.name
        .trim()
        .split(/\s+/)
        .filter((n) => !n.includes('.') && n.length > 0)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('') || employee.initials;

    const updatedEmp: Employee = {
      ...employee,
      name: formData.name.trim(),
      nik: formData.nik.trim(),
      title: formData.title.trim(),
      division: formData.division,
      siteId: matchedSite.id,
      siteName: matchedSite.name,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status,
      contractType: formData.contractType,
      k3Certified: formData.k3Certified,
      bloodType: formData.bloodType ? (formData.bloodType as Employee['bloodType']) : undefined,
      baseSalary: Number(formData.baseSalary) || 0,
      transportMealAllowance: Number(formData.transportMealAllowance) || 0,
      siteAllowance: Number(formData.siteAllowance) || 0,
      k3Allowance: formData.k3Certified ? 500000 : 0,
      bankAccount: formData.bankAccount.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      joinDate: formData.joinDate || employee.joinDate,
      initials: newInitials,
      photoUrl: formData.photoUrl || undefined,
    };

    onUpdateEmployee(updatedEmp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data Karyawan"
      subtitle={`${employee.name} · ${employee.jobCode}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto Profil & Status Kepegawaian */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <AvatarUpload
            photoUrl={formData.photoUrl}
            employeeName={formData.name || employee.name}
            initials={employee.initials}
            avatarColor={employee.avatarColor}
            size="lg"
            onPhotoChange={(url) => handleChange('photoUrl', url || undefined)}
          />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">{employee.name}</h3>
            <p className="text-xs text-slate-500 font-mono">{employee.jobCode} · {employee.nik}</p>
            <div className="pt-1.5 flex items-center justify-center sm:justify-start gap-2">
              <label className="text-[11px] font-semibold uppercase text-slate-500">Status Kepegawaian:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
              >
                {EMPLOYEE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
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
          mode="edit"
        />

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
