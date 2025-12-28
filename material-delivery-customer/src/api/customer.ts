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
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateSitePayload {
  label: string;
  cityId: number;
  addressLine: string;
  pincode: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateSitePayload {
  label?: string;
  cityId?: number;
  addressLine?: string;
  pincode?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export async function fetchCustomerProfile(): Promise<ApiCustomerProfile> {
  const res = await api.get('/customer/profile');
  return res.data;
}

export async function fetchCustomerSites(): Promise<ApiCustomerSite[]> {
  const res = await api.get('/customer/sites');
  return res.data;
}

export async function updateCustomerProfile(
  payload: Partial<{fullName?: string; companyName?: string; gstNumber?: string}>,
): Promise<ApiCustomerProfile> {
  const res = await api.patch('/customer/profile', payload);
  return res.data;
}

export async function createCustomerSite(
  payload: CreateSitePayload,
): Promise<ApiCustomerSite> {
  const res = await api.post('/customer/sites', payload);
  return res.data;
}

export async function updateCustomerSite(
  id: string,
  payload: UpdateSitePayload,
): Promise<ApiCustomerSite> {
  const res = await api.patch(`/customer/sites/${id}`, payload);
  return res.data;
}

export async function deleteCustomerSite(id: string): Promise<void> {
  await api.delete(`/customer/sites/${id}`);
}
