"use client";

import {api} from "@/lib/api";
import type {ApiCity} from "./catalog";

export interface ApiCustomerProfile {
  id: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  customer?: {
    id: string;
    companyName?: string | null;
    gstNumber?: string | null;
  } | null;
}

export interface ApiCustomerSite {
  id: string;
  label: string;
  addressLine: string;
  pincode: string;
  isDefault: boolean;
  city: ApiCity;
  latitude?: number | null;
  longitude?: number | null;
}

export async function fetchCustomerProfile(): Promise<ApiCustomerProfile> {
  const res = await api.get("/customer/profile");
  return res.data;
}

export async function fetchCustomerSites(): Promise<ApiCustomerSite[]> {
  const res = await api.get("/customer/sites");
  return res.data;
}

export async function createCustomerSite(payload: {
  label: string;
  cityId: number;
  addressLine: string;
  pincode: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}): Promise<ApiCustomerSite> {
  const res = await api.post("/customer/sites", payload);
  return res.data;
}
