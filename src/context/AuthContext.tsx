import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api, setAuthToken} from '../api/client';

export type UserRole = 'CUSTOMER' | 'SUPPLIER' | 'ADMIN';

export type AuthUser = {
  id: string;
  role: UserRole;
  phone?: string | null;
  email?: string | null;
  fullName?: string | null;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean; // true while restoring from storage
  user: AuthUser | null;
  accessToken: string | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
        ]);

        if (storedToken) {
          setAccessToken(storedToken);
          setAuthToken(storedToken);
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        // Swallow restore errors; user will re-auth.
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setSession = async (token: string | null, authUser: AuthUser | null) => {
    setAccessToken(token);
    setUser(authUser);

    if (token && authUser) {
      await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
      setAuthToken(token);
    } else {
      await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
      setAuthToken(null);
    }
  };

  const requestOtp = async (phone: string) => {
    await api.post('/auth/customer/otp/request', {phone});
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const response = await api.post('/auth/customer/otp/verify', {phone, otp});
    const {accessToken: token, user: apiUser} = response.data;
    const authUser: AuthUser = {
      id: apiUser.id,
      role: apiUser.role,
      phone: apiUser.phone,
      email: apiUser.email,
      fullName: apiUser.fullName,
    };
    await setSession(token, authUser);
  };

  const logout = async () => {
    await setSession(null, null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!accessToken,
      loading,
      user,
      accessToken,
      requestOtp,
      verifyOtp,
      logout,
    }),
    [accessToken, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
