import {api} from './client';

export interface ApiCity {
  id: number;
  name: string;
  code: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export type ApiUnit = 'TON' | 'M3' | 'BAG' | 'PIECE';

export interface ApiSupplierSummary {
  id: string;
  companyName: string;
}

export interface ApiCitySummary {
  id: number;
  name: string;
  code: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  unit: ApiUnit;
  basePrice: number | string;
  minOrderQty: number;
  leadTimeHours: number;
  isActive: boolean;
  attributes?: Record<string, any> | null;
  bulkTiers?: Array<{minQty: number; price: number}> | null;
  deliveryCharge?: number | string | null;
  category: ApiCategory;
  supplier: ApiSupplierSummary;
  city: ApiCitySummary;
}

export interface PaginatedProductsResponse {
  items: ApiProduct[];
  page: number;
  pageSize: number;
  total: number;
}

export type ProductQueryParams = {
  cityId?: number;
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchCities(): Promise<ApiCity[]> {
  const response = await api.get<ApiCity[]>('/catalog/cities');
  return response.data;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const response = await api.get<ApiCategory[]>('/catalog/categories');
  return response.data;
}

export async function fetchProducts(
  params: ProductQueryParams,
): Promise<PaginatedProductsResponse> {
  const response = await api.get<PaginatedProductsResponse>(
    '/catalog/products',
    {params},
  );
  return response.data;
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  const response = await api.get<ApiProduct>(`/catalog/products/${id}`);
  return response.data;
}
