'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS } from '@/data/authUsers';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, HardHat, UserCheck, AlertCircle } from 'lucide-react';

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
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0f766e]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/15 blur-[140px] pointer-events-none" />

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
            PT Bumi Raya Propertindo Tbk
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mt-0.5">
            Property HRIS & Construction Field Operations
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Sistem Manajemen SDM, Presensi Geofence GPS & Proyek Konstruksi (Kalimantan Selatan)
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white tracking-tight">
              Masuk ke Akun Portal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan email korporat atau pilih simulasi role instan di bawah
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
              <span>{isSubmitting ? 'Memproses Verifikasi...' : 'Masuk ke Sistem'}</span>
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
                Atau Masuk Cepat Sebagai (Multi-Role Demo)
              </span>
            </div>
          </div>

          {/* Demo Role Switcher Buttons */}
          <div className="space-y-2">
            {DEMO_USERS.map((user) => {
              const isSuper = user.role === 'SUPER_ADMIN';
              const isSite = user.role === 'SITE_MANAGER';
              const Icon = isSuper ? Building2 : isSite ? HardHat : UserCheck;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => loginAsDemo(user.id)}
                  className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-left transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {user.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {user.roleLabel}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {user.role}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Security Notice */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Koneksi Aman TLS 1.3 · Dokumen Rahasia Korporat</span>
          </div>
        </div>

        {/* Footer address */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          Menara Bumi Raya Lt. 3-5, Jl. Jend. A. Yani Km. 4.5 No. 21, Banjarmasin, Kalimantan Selatan
        </p>
      </div>
    </div>
  );
};
