import { Building2, DollarSign, HardHat, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthUser } from '@/types/auth';

export interface AccountPresentation {
  Icon: LucideIcon;
  roleBadge: string;
  roleBadgeClass: string;
  dutyDescription: string;
}

export function getAccountPresentation(user: AuthUser): AccountPresentation {
  const isSuper = user.role === 'SUPER_ADMIN';
  const isSite = user.role === 'SITE_MANAGER';
  const isMarketing = user.division?.includes('Pemasaran');

  const roleBadge = user.title || user.roleLabel || 'Staf';

  if (isSuper) {
    return {
      Icon: Building2,
      roleBadge,
      roleBadgeClass: 'bg-teal-950/80 text-teal-300 border-teal-700/60',
      dutyDescription: 'Persetujuan Kasbon, Cuti & Ringkasan Bisnis',
    };
  }

  if (isSite) {
    return {
      Icon: DollarSign,
      roleBadge,
      roleBadgeClass: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      dutyDescription: 'Kelola Gaji, Kasbon, & Rekap Presensi',
    };
  }

  if (isMarketing) {
    return {
      Icon: Megaphone,
      roleBadge,
      roleBadgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      dutyDescription: 'Presensi Harian, Slip Gaji & Izin',
    };
  }

  return {
    Icon: HardHat,
    roleBadge,
    roleBadgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    dutyDescription: 'Presensi Proyek, Slip Gaji & Izin',
  };
}
