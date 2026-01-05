"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, type AuthUser} from "@/api/auth";
import {setAuthToken} from "@/lib/api";

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  requestingOtp: boolean;
  verifyingOtp: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtpAndLogin: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "customer_token";
const USER_KEY = "customer_user";
const LAST_PHONE_KEY = "customer_last_phone";

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Hydrate from storage on load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
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

  useEffect(() => {
    setAuthToken(token);
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }

      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    }
  }, [token, user]);

  const requestOtp = async (phone: string) => {
    setRequestingOtp(true);
    try {
      await apiRequestOtp(phone);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(LAST_PHONE_KEY, phone);
      }
    } finally {
      setRequestingOtp(false);
    }
  };

  const verifyOtpAndLogin = async (phone: string, otp: string) => {
    setVerifyingOtp(true);
    try {
      const {accessToken, user: authedUser} = await apiVerifyOtp(phone, otp);
      setToken(accessToken);
      setUser(authedUser);
      setAuthToken(accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(authedUser));
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const value: AuthState = {
    isAuthenticated: !!token,
    user,
    token,
    loading,
    requestingOtp,
    verifyingOtp,
    requestOtp,
    verifyOtpAndLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export {LAST_PHONE_KEY};
