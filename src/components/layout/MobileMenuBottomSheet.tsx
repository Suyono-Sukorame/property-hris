'use client';

import React, { useEffect } from 'react';
import { ActiveNavModule } from '@/types/hris';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  Banknote,
  CheckSquare,
  BarChart3,
  Building,
  LogOut,
  X,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa';

interface MobileMenuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ActiveNavModule;
  onSelectModule: (module: ActiveNavModule) => void;
  pendingApprovalsCount?: number;
  onOpenEmployeeIDCard?: () => void;
}

interface NavMenuItem {
  id: ActiveNavModule;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

const getMenuForRole = (role: 'SUPER_ADMIN' | 'SITE_MANAGER' | 'EMPLOYEE'): NavMenuItem[] => {
  if (role === 'EMPLOYEE') {
    return [
      {
        id: 'attendance',
        label: 'Presensi & Riwayat',
        sublabel: 'Absen GPS, selfie & log harian',
        icon: Clock,
        badge: false,
      },
      {
        id: 'payroll',
        label: 'Slip Gaji Saya',
        sublabel: 'Rincian gaji pokok & tunjangan',
        icon: Banknote,
        badge: false,
      },
      {
        id: 'approvals',
        label: 'Pengajuan Saya',
        sublabel: 'Permohonan kasbon & izin',
        icon: CheckSquare,
        badge: true,
      },
    ];
  }

  if (role === 'SITE_MANAGER') {
    return [
      {
        id: 'dashboard',
        label: 'Beranda Operasional',
        sublabel: 'Ringkasan presensi & aktivitas',
        icon: LayoutDashboard,
        badge: false,
      },
      {
        id: 'employees',
        label: 'Data Tim',
        sublabel: 'Kelola anggota proyek',
        icon: Users,
        badge: false,
      },
      {
        id: 'attendance',
        label: 'Monitoring Presensi',
        sublabel: 'Pantau log absen tim realtime',
        icon: Clock,
        badge: false,
      },
      {
        id: 'payroll',
        label: 'Gaji & Kasbon Tim',
        sublabel: 'Rekap slip & pembayaran',
        icon: Banknote,
        badge: false,
      },
      {
        id: 'approvals',
        label: 'Verifikasi Pengajuan',
        sublabel: 'Tinjau kasbon & permohonan',
        icon: CheckSquare,
        badge: true,
      },
    ];
  }

  // SUPER_ADMIN (Pemilik / Direktur)
  return [
    {
      id: 'dashboard',
      label: 'Ringkasan Eksekutif',
      sublabel: 'KPI keuangan & operasional',
      icon: LayoutDashboard,
      badge: false,
    },
    {
      id: 'employees',
      label: 'Data Karyawan',
      sublabel: 'Master SDM & kontrak kerja',
      icon: Users,
      badge: false,
    },
    {
      id: 'attendance',
      label: 'Monitoring Presensi',
      sublabel: 'Rekap kehadiran & lembur',
      icon: Clock,
      badge: false,
    },
    {
      id: 'payroll',
      label: 'Rekap Penggajian',
      sublabel: 'Otorisasi gaji & kasbon',
      icon: Banknote,
      badge: false,
    },
    {
      id: 'approvals',
      label: 'Persetujuan Direktur',
      sublabel: 'Approval kasbon & cuti',
      icon: CheckSquare,
      badge: true,
    },
    {
      id: 'reports',
      label: 'Laporan Bisnis & K3',
      sublabel: 'Analisa performa & kepatuhan K3',
      icon: BarChart3,
      badge: false,
    },
    {
      id: 'settings',
      label: 'Pengaturan Proyek',
      sublabel: 'Geofence radius & sistem',
      icon: Building,
      badge: false,
    },
  ];
};

export const MobileMenuBottomSheet: React.FC<MobileMenuBottomSheetProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
  pendingApprovalsCount = 0,
  onOpenEmployeeIDCard,
}) => {
  const { currentUser, logout } = useAuth();
  const userRole = currentUser?.role || 'SUPER_ADMIN';
  const menuItems = getMenuForRole(userRole);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (moduleId: ActiveNavModule) => {
    onSelectModule(moduleId);
    onClose();
  };

  const roleBadgeLabel = currentUser?.title || currentUser?.roleLabel || 'Staf Lapangan';

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop with smooth fade */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Modal Container */}
      <div
        className="relative z-10 w-full max-h-[86dvh] bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
      >
        {/* Native Pull / Drag Bar Indicator */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-600/90 rounded-full" />
        </div>

        {/* User Identity Header */}
        <div className="px-4 py-3 border-b border-slate-800/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/20 shadow-sm"
              style={{ backgroundColor: currentUser?.avatarColor || '#0f766e' }}
            >
              {currentUser?.initials || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-sm truncate">
                  {currentUser?.name || 'Pengguna'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-emerald-950/80 text-emerald-300 border-emerald-700/60 whitespace-nowrap">
                  {roleBadgeLabel}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{currentUser?.siteName || 'Griya Bumi Raya'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Menu Items Grid */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 overscroll-contain space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Menu Utama
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                const badgeCount = item.badge ? pendingApprovalsCount : 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] ${
                      isActive
                        ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-900/80 text-emerald-400 border border-slate-700/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs leading-tight truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[10px] leading-tight truncate mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {badgeCount > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold ${
                            isActive
                              ? 'bg-white text-[#0f766e]'
                              : 'bg-amber-500 text-slate-950 ring-2 ring-slate-900'
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts & Utilities */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Pintasan &amp; Akses
            </p>

            <div className="grid grid-cols-2 gap-2">
              {onOpenEmployeeIDCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmployeeIDCard();
                  }}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Kartu ID</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Keluar Akun</span>
              </button>
            </div>

            {/* PWA Install Button */}
            <div className="pt-1">
              <PWAInstallButton
                variant="pill"
                size="sm"
                customLabel="Pasang di Layar Utama HP"
                className="w-full justify-center bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Bottom Footer Note with Safe Area */}
        <div className="px-4 py-2.5 border-t border-slate-800/90 bg-slate-950/60 text-center shrink-0 pb-safe">
          <p className="text-[10px] text-slate-500 font-medium">
            Griya Bumi Raya · Property HRIS Mobile v1
          </p>
        </div>
      </div>
    </div>
  );
};
