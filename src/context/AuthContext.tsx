'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '@/types/auth';
import { DEMO_USERS } from '@/data/authUsers';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsDemo: (userId: string) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<AuthUser>) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'property_hris_session_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount & sync latest profile from Supabase
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            try {
              const { data: dbUser } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', parsed.id)
                .single();
              if (dbUser) {
                const refreshed: AuthUser = {
                  ...parsed,
                  name: dbUser.name,
                  email: dbUser.email,
                  phone: dbUser.phone,
                  avatarColor: dbUser.avatar_color,
                  initials: dbUser.initials,
                  role: dbUser.role,
                  roleLabel: dbUser.role_label,
                  title: dbUser.title,
                  division: dbUser.division,
                  siteId: dbUser.site_id,
                  siteName: dbUser.site_name,
                  employeeId: dbUser.employee_id,
                };
                setCurrentUser(refreshed);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
              }
            } catch {
              // Fallback to local session
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved session:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    }

    // Default fallback: masuk sebagai Direktur / Pemilik
    const genericUser: AuthUser = {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'SUPER_ADMIN',
      roleLabel: 'Pemilik / Direktur',
      title: 'Direktur Utama',
      division: 'Manajemen',
      siteId: 'SITE-01',
      siteName: 'Griya Bumi Raya',
      avatarColor: '#0f766e',
      initials: email.substring(0, 2).toUpperCase(),
    };
    setCurrentUser(genericUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(genericUser));
    return { success: true };
  };

  const loginAsDemo = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateCurrentUser = (updates: Partial<AuthUser>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save updated session:', e);
      }

      // Sinkronisasi permanen ke Supabase table user_profiles & employees
      (async () => {
        try {
          const dbUpdates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };
          if (updates.name) dbUpdates.name = updates.name;
          if (updates.phone) dbUpdates.phone = updates.phone;
          if (updates.avatarColor) dbUpdates.avatar_color = updates.avatarColor;
          if (updates.initials) dbUpdates.initials = updates.initials;
          if (updates.password) dbUpdates.password_hash = updates.password;

          await supabase.from('user_profiles').update(dbUpdates).eq('id', prev.id);

          // Jika user terhubung ke record karyawan di tabel employees
          if (prev.employeeId) {
            const empUpdates: Record<string, unknown> = {};
            if (updates.name) empUpdates.name = updates.name;
            if (updates.phone) empUpdates.phone = updates.phone;
            if (updates.avatarColor) empUpdates.avatar_color = updates.avatarColor;
            if (updates.initials) empUpdates.initials = updates.initials;
            await supabase.from('employees').update(empUpdates).eq('id', prev.employeeId);
          }
        } catch (err) {
          console.error('Error syncing user profile to Supabase:', err);
        }
      })();

      return updated;
    });
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        loginAsDemo,
        logout,
        updateCurrentUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
