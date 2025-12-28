import {api} from './client';

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
  city: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateSitePayload {
  label: string;
  cityId: number;
  addressLine: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UpdateSitePayload {
  label?: string;
  cityId?: number;
  addressLine?: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  companyName?: string;
  gstNumber?: string;
}

export async function fetchCustomerProfile(): Promise<ApiCustomerProfile> {
  const response = await api.get<ApiCustomerProfile>('/customer/profile');
  return response.data;
}

export async function updateCustomerProfile(
  payload: UpdateProfilePayload,
): Promise<ApiCustomerProfile> {
  const response = await api.patch<ApiCustomerProfile>('/customer/profile', payload);
  return response.data;
}

export async function fetchCustomerSites(): Promise<ApiCustomerSite[]> {
  const response = await api.get<ApiCustomerSite[]>('/customer/sites');
  return response.data;
}

export async function createCustomerSite(
  payload: CreateSitePayload,
): Promise<ApiCustomerSite> {
  const response = await api.post<ApiCustomerSite>('/customer/sites', payload);
  return response.data;
}

export async function updateCustomerSite(
  id: string,
  payload: UpdateSitePayload,
): Promise<ApiCustomerSite> {
  const response = await api.patch<ApiCustomerSite>(`/customer/sites/${id}`, payload);
  return response.data;
}

export async function deleteCustomerSite(id: string): Promise<void> {
  await api.delete(`/customer/sites/${id}`);
}
