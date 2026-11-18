import { AuthUser, UserRole } from '@/types/auth';
import { Employee } from '@/types/hris';
import { DEMO_USERS } from '@/data/authUsers';
import { supabase } from '@/lib/supabase';

export const DEFAULT_ACCOUNT_PASSWORD = '123456';

interface UserProfileRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  role_label: string;
  title: string;
  division: string;
  site_id?: string | null;
  site_name?: string | null;
  avatar_color: string;
  initials: string;
  employee_id?: string | null;
  password_hash?: string | null;
}

export function mapProfileToAuthUser(row: UserProfileRow): AuthUser {
  const normalizedRoleLabel = row.role_label?.trim().toLowerCase() === 'pengawas' ? 'Pengawas Lapangan' : row.role_label;
  const normalizedTitle = row.title?.trim().toLowerCase() === 'pengawas' ? 'Pengawas Lapangan' : row.title;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    role: row.role,
    roleLabel: normalizedRoleLabel || 'Staf',
    title: normalizedTitle || normalizedRoleLabel || 'Staf',
    division: row.division,
    siteId: row.site_id ?? undefined,
    siteName: row.site_name ?? undefined,
    avatarColor: row.avatar_color,
    initials: row.initials,
    employeeId: row.employee_id ?? undefined,
    password: row.password_hash ?? undefined,
  };
}

export async function getAccounts(): Promise<AuthUser[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data?.length) return DEMO_USERS;
  return (data as UserProfileRow[]).map(mapProfileToAuthUser);
}

export async function findAccountByEmail(email: string): Promise<AuthUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (!error && data) return mapProfileToAuthUser(data as UserProfileRow);
  return DEMO_USERS.find((user) => user.email.toLowerCase() === cleanEmail) ?? null;
}

export async function createEmployeeAccount(employee: Employee): Promise<AuthUser | null> {
  const email = employee.email.trim().toLowerCase();
  if (!email) return null;

  const existing = await findAccountByEmail(email);
  if (existing) return existing;

  const account: UserProfileRow = {
    id: `USR-${employee.id.replace(/^EMP-/, '')}`,
    name: employee.name,
    email,
    phone: employee.phone,
    role: 'EMPLOYEE',
    role_label: employee.title,
    title: employee.title,
    division: employee.division,
    site_id: employee.siteId,
    site_name: employee.siteName,
    avatar_color: employee.avatarColor,
    initials: employee.initials,
    employee_id: employee.id,
    password_hash: DEFAULT_ACCOUNT_PASSWORD,
  };

  const { data, error } = await supabase.from('user_profiles').insert(account).select().single();
  if (error) {
    console.error('Failed to create employee login account:', error);
    return null;
  }
  return mapProfileToAuthUser(data as UserProfileRow);
}
