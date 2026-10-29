export type UserRole = 'SUPER_ADMIN' | 'SITE_MANAGER' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  division: string;
  siteId?: string; // If restricted to specific site
  siteName?: string;
  avatarColor: string;
  initials: string;
  employeeId?: string; // Links to Employee record
}
