'use client';

import React, { useState, useEffect } from 'react';
import { AuthUser } from '@/types/auth';
import {
  X, User, Phone, Lock, Eye, EyeOff, Check,
  Shield, Building2, Briefcase, Hash, CheckCircle2,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSave: (updates: {
    name: string;
    phone?: string;
    avatarColor: string;
    initials: string;
    password?: string;
  }) => void;
}

const AVATAR_COLOR_PALETTE = [
  { name: 'Teal Korporat', value: '#0f766e', bgClass: 'bg-[#0f766e]' },
  { name: 'Emerald Hijau', value: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Navy Modern', value: '#1e3a8a', bgClass: 'bg-blue-900' },
  { name: 'Indigo Elegan', value: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Amber Proyek', value: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Slate Abu', value: '#475569', bgClass: 'bg-slate-600' },
  { name: 'Rose Tegas', value: '#e11d48', bgClass: 'bg-rose-600' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'SECURITY'>('INFO');
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '0812-9876-5432');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#0f766e');
  const [initials, setInitials] = useState(user.initials || 'U');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Sync state whenever modal opens with user data
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setPhone(user.phone || '0812-9876-5432');
      setAvatarColor(user.avatarColor || '#0f766e');
      setInitials(user.initials || 'U');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setIsSavedSuccess(false);
      setActiveTab('INFO');
    }
  }, [isOpen, user]);

  // Compute initials dynamically from name
  const handleNameChange = (val: string) => {
    setName(val);
    const parts = val.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      setInitials(`${parts[0][0]}${parts[1][0]}`.toUpperCase());
    } else if (parts.length === 1 && parts[0].length >= 2) {
      setInitials(parts[0].substring(0, 2).toUpperCase());
    } else if (parts.length === 1) {
      setInitials(parts[0][0].toUpperCase());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (activeTab === 'SECURITY' || newPassword || confirmPassword) {
      if (newPassword && newPassword.length < 6) {
        setPasswordError('Kata sandi minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSave({
        name: name.trim() || user.name,
        phone: phone.trim(),
        avatarColor,
        initials,
        password: newPassword || undefined,
      });
      setIsSubmitting(false);
      setIsSavedSuccess(true);
      setTimeout(() => {
        setIsSavedSuccess(false);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                Edit Profil Saya
              </h3>
              <p className="text-[11px] text-slate-500">
                Pembaruan data akun &amp; preferensi pengguna
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-5 pt-3 pb-1 border-b border-slate-100 flex gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('INFO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'INFO'
                ? 'bg-[#0f766e] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Informasi Pribadi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SECURITY'
                ? 'bg-[#0f766e] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Keamanan &amp; Sandi</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'INFO' ? (
            <>
              {/* Avatar Color Picker & Live Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-200 shrink-0 transition-transform"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Pilih Warna Avatar Akun
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    {AVATAR_COLOR_PALETTE.map((pal) => (
                      <button
                        key={pal.value}
                        type="button"
                        onClick={() => setAvatarColor(pal.value)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                          avatarColor === pal.value
                            ? 'scale-115 border-white ring-2 ring-[#0f766e]'
                            : 'border-transparent hover:scale-105'
                        } ${pal.bgClass}`}
                        title={pal.name}
                        aria-label={pal.name}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Inisial otomatis: <strong>{initials}</strong>
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full h-9.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Nomor WhatsApp / Telepon Aktif
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-9.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                      placeholder="Contoh: 0812-3456-7890"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Digunakan untuk koordinasi lapangan dan verifikasi presensi.
                  </span>
                </div>
              </div>

              {/* Data Terkunci Ketenagakerjaan (Read-Only) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Data Otoritas (Dikelola Manajemen)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-slate-400" /> Role
                    </span>
                    <span className="font-semibold text-slate-800">{user.roleLabel}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5 text-slate-400" /> Lokasi Proyek
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">{user.siteName || 'Griya Bumi Raya'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 text-slate-400" /> Divisi
                    </span>
                    <span className="font-semibold text-slate-800">{user.division || 'Manajemen'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5 text-slate-400" /> ID Akun
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{user.employeeId || user.id}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* SECURITY TAB */
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                <p className="font-semibold">Perlindungan Akun</p>
                <p className="mt-0.5 text-amber-700">
                  Gunakan kata sandi yang kuat dengan minimal 6 karakter kombinasi huruf dan angka.
                </p>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9.5 pl-9 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                    placeholder="Masukkan kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-9.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSavedSuccess}
              className="h-9 px-5 rounded-xl bg-[#0f766e] hover:bg-[#0d6962] active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSavedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Tersimpan!</span>
                </>
              ) : isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
