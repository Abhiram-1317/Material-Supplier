"use client";

import {api} from "@/lib/api";

export interface ApiCity {
  id: number;
  name: string;
  code: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export type ApiUnit = "TON" | "M3" | "BAG" | "PIECE";

export interface ApiProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  unit: ApiUnit;
  basePrice: number | string;
  minOrderQty: number;
  leadTimeHours: number;
  isActive: boolean;
  description?: string | null;
  category: ApiCategory;
  supplier: {
    id: string;
    companyName: string;
  };
  city: ApiCity;
}

export interface PaginatedProductsResponse {
  items: ApiProduct[];
  page: number;
  pageSize: number;
  total: number;
}

export async function fetchCities(): Promise<ApiCity[]> {
  const res = await api.get("/catalog/cities");
  return res.data as ApiCity[];
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await api.get("/catalog/categories");
  return res.data as ApiCategory[];
}

export async function fetchProducts(params: {
  cityId?: number;
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedProductsResponse> {
  const res = await api.get("/catalog/products", {params});
  return res.data as PaginatedProductsResponse;
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  const res = await api.get(`/catalog/products/${id}`);
  return res.data as ApiProduct;
}
