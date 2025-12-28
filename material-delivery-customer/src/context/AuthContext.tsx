import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAuthToken} from '../api/client';

const TOKEN_KEY = 'auth_token';

export type AuthContextValue = {
  token?: string;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (!isMounted) return;
        if (stored) {
          setToken(stored);
          setAuthToken(stored);
        } else if (process.env.EXPO_PUBLIC_DEV_TOKEN) {
          const fallback = process.env.EXPO_PUBLIC_DEV_TOKEN;
          setToken(fallback);
          setAuthToken(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (value: string) => {
    setToken(value);
    setAuthToken(value);
    await AsyncStorage.setItem(TOKEN_KEY, value);
  };

  const logout = async () => {
    setToken(undefined);
    setAuthToken(undefined);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
    }),
    [token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
