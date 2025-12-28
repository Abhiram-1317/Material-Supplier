"use client";

import {api} from "@/lib/api";

export interface AuthUser {
  id: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  fullName?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function requestOtp(phone: string): Promise<void> {
  await api.post("/auth/customer/otp/request", {phone});
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  const res = await api.post("/auth/customer/otp/verify", {phone, otp});
  return res.data;
}
