'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS } from '@/data/authUsers';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, DollarSign, Megaphone, HardHat, UserCheck, AlertCircle } from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa';
import { DeveloperBranding } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Silakan masukkan email perusahaan Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login gagal.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden antialiased">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full bg-[#0f766e]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 rounded-full bg-emerald-600/15 blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Company Header Card */}
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center border border-slate-700/60 shadow-md">
              <Image
                src="/property-hris.png"
                alt="Logo PT Bumi Raya Propertindo Tbk"
                width={48}
                height={48}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
            Griya Bumi Raya
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mt-0.5">
            Property HRIS — Mode Rintisan
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Sistem Manajemen Tim & Presensi Properti
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white tracking-tight">
              Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan email perusahaan atau pilih akun simulasi di bawah
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Email Perusahaan
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bumiraya.co.id"
                  className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 mt-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-slate-900 px-3 text-slate-500">
                Atau Masuk Menggunakan Akun Demo
              </span>
            </div>
          </div>

          {/* Demo Role Switcher Buttons */}
          <div className="space-y-2">
            {DEMO_USERS.map((user) => {
              const isSuper = user.role === 'SUPER_ADMIN';
              const isSite = user.role === 'SITE_MANAGER';
              const isMarketing = user.division?.includes('Pemasaran');

              // Ikon & Badge berbasis peran nyata
              let Icon = UserCheck;
              let roleBadge = 'Staf';
              let roleBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
              let dutyDescription = 'Presensi Proyek, Slip Gaji & Ajukan Izin';

              if (isSuper) {
                Icon = Building2;
                roleBadge = 'Pemilik / Direktur';
                roleBadgeClass = 'bg-teal-950/80 text-teal-300 border-teal-700/60';
                dutyDescription = 'Persetujuan Kasbon, Cuti & Ringkasan Bisnis';
              } else if (isSite) {
                Icon = DollarSign;
                roleBadge = 'Admin & Keuangan';
                roleBadgeClass = 'bg-sky-950/80 text-sky-300 border-sky-700/60';
                dutyDescription = 'Kelola Gaji, Kasbon, & Rekap Presensi';
              } else if (isMarketing) {
                Icon = Megaphone;
                roleBadge = 'Marketing';
                roleBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
                dutyDescription = 'Presensi Harian, Slip Gaji & Izin';
              } else {
                Icon = HardHat;
                roleBadge = 'Pengawas';
                roleBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
                dutyDescription = 'Presensi Proyek, Slip Gaji & Izin';
              }

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => loginAsDemo(user.id)}
                  className="w-full p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {user.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleBadgeClass}`}>
                        {roleBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {dutyDescription}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Griya Bumi Raya · Mode Rintisan v1</span>
          </div>
        </div>

        {/* Pasang Aplikasi di HP / Tablet */}
        <div className="mt-4 flex flex-col items-center justify-center gap-1.5">
          <PWAInstallButton
            variant="pill"
            size="sm"
            customLabel="Pasang Aplikasi di Layar Utama HP"
            className="w-full sm:w-auto"
          />
          <p className="text-[10px] text-slate-500 text-center">
            Mendukung Android &amp; iPhone · Akses 1-Ketuk Fullscreen
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500">
          <p className="text-center text-[10px] text-slate-500">
            Griya Bumi Raya · Kalimantan Selatan
          </p>
          <DeveloperBranding variant="dark" size="xs" />
        </div>
      </div>
    </div>
  );
};
