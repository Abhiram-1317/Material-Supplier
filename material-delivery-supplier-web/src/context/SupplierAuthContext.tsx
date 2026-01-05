"use client";

import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {api, setAuthToken} from '@/lib/api';

export type SupplierUser = {
  id: string;
  role: 'SUPPLIER' | 'ADMIN' | string;
  email?: string | null;
  fullName?: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: SupplierUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'supplier_token';
const USER_KEY = 'supplier_user';

const SupplierAuthContext = createContext<AuthState | undefined>(undefined);

export function SupplierAuthProvider({children}: {children: React.ReactNode}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SupplierUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', {email, password});
    const accessToken: string = res.data?.accessToken;
    const apiUser = res.data?.user as SupplierUser;
    if (!accessToken || !apiUser) {
      throw new Error('Invalid login response');
    }

    setToken(accessToken);
    setUser(apiUser);
    setAuthToken(accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const value: AuthState = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      user,
      loading,
      login,
      logout,
    }),
    [token, user, loading],
  );

  return <SupplierAuthContext.Provider value={value}>{children}</SupplierAuthContext.Provider>;
}

export function useSupplierAuth(): AuthState {
  const ctx = useContext(SupplierAuthContext);
  if (!ctx) throw new Error('useSupplierAuth must be used within SupplierAuthProvider');
  return ctx;
}
