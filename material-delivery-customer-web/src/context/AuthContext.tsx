"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {type AuthUser} from "@/api/auth";
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

const demoUser: AuthUser = {
  id: "demo-user",
  role: "CUSTOMER",
  phone: "+911234567890",
  fullName: "Demo User",
};
const demoToken = "demo-token";

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(() => demoUser);
  const [token, setToken] = useState<string | null>(() => demoToken);
  const loading = false;
  const requestingOtp = false;
  const verifyingOtp = false;

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
    // no-op in bypass mode
    if (typeof window !== "undefined") {
      sessionStorage.setItem(LAST_PHONE_KEY, phone);
    }
  };

  const verifyOtpAndLogin = async (_phone: string, _otp: string) => {
    void _phone;
    void _otp;
    // no-op in bypass mode
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
