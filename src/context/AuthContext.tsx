'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '@/types/auth';
import { DEMO_USERS } from '@/data/authUsers';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsDemo: (userId: string) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'property_hris_session_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    }

    // Default fallback to super admin if arbitrary enterprise email used
    const genericUser: AuthUser = {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: 'SUPER_ADMIN',
      roleLabel: 'Direksi / Head of Human Capital',
      title: 'Enterprise Administrator',
      division: 'Direksi & Human Capital',
      siteId: 'SITE-HQ',
      siteName: 'Kantor Pusat - Menara Bumi Raya Banjarmasin',
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
