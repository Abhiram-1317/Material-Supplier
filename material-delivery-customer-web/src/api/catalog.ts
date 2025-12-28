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

const DEMO_CATEGORIES: ApiCategory[] = [
  {id: 1, name: "Cement", slug: "cement", description: "OPC and PPC grades"},
  {id: 2, name: "Sand", slug: "sand", description: "River and M-sand"},
  {id: 3, name: "Bricks", slug: "bricks", description: "Clay and fly ash"},
  {id: 4, name: "Steel", slug: "steel", description: "TMT bars"},
];

const DEMO_CITIES: ApiCity[] = [
  {id: 1, name: "Warangal", code: "WAR"},
  {id: 2, name: "Hanumakonda", code: "HAN"},
  {id: 3, name: "Hyderabad", code: "HYD"},
];

function getDemoCity(cityId?: number): ApiCity {
  if (cityId === 1) return {id: 1, name: "Warangal", code: "WAR"};
  if (cityId) return {id: cityId, name: "Hanumakonda", code: "HAN"};
  return {id: 99, name: "Demo City", code: "DEM"};
}

function getDemoProducts(cityId?: number, categorySlug?: string): ApiProduct[] {
  const city = getDemoCity(cityId);
  const base: ApiProduct[] = [
    {
      id: `demo-${city.code}-cement`,
      name: `${city.name} OPC 53 Grade Cement`,
      imageUrl: null,
      unit: "BAG",
      basePrice: 430,
      minOrderQty: 50,
      leadTimeHours: 12,
      isActive: true,
      description: "Premium 53 grade cement for structural work.",
      category: DEMO_CATEGORIES[0],
      supplier: {id: "demo-supplier", companyName: "Demo Materials"},
      city,
    },
    {
      id: `demo-${city.code}-sand`,
      name: `${city.name} River Sand (fine)`,
      imageUrl: null,
      unit: "TON",
      basePrice: 1450,
      minOrderQty: 10,
      leadTimeHours: 24,
      isActive: true,
      description: "Washed river sand suitable for plastering and block work.",
      category: DEMO_CATEGORIES[1],
      supplier: {id: "demo-supplier", companyName: "Demo Materials"},
      city,
    },
    {
      id: `demo-${city.code}-bricks`,
      name: `${city.name} Clay Bricks (Class A)`,
      imageUrl: null,
      unit: "PIECE",
      basePrice: 9,
      minOrderQty: 500,
      leadTimeHours: 24,
      isActive: true,
      description: "Uniform size, kiln-baked bricks for walling.",
      category: DEMO_CATEGORIES[2],
      supplier: {id: "demo-supplier", companyName: "Demo Materials"},
      city,
    },
    {
      id: `demo-${city.code}-steel`,
      name: `${city.name} TMT Steel Fe500 (12mm)`,
      imageUrl: null,
      unit: "TON",
      basePrice: 55500,
      minOrderQty: 1,
      leadTimeHours: 18,
      isActive: true,
      description: "Corrosion-resistant Fe500 TMT bars for reinforcement.",
      category: DEMO_CATEGORIES[3],
      supplier: {id: "demo-supplier", companyName: "Demo Materials"},
      city,
    },
  ];

  if (categorySlug) {
    return base.filter((p) => p.category.slug === categorySlug);
  }
  return base;
}

export async function fetchCities(): Promise<ApiCity[]> {
  try {
    const res = await api.get("/catalog/cities");
    const data: ApiCity[] = res.data;
    return data.length ? data : DEMO_CITIES;
  } catch (_err) {
    return DEMO_CITIES;
  }
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const res = await api.get("/catalog/categories");
    const data: ApiCategory[] = res.data;
    return data.length ? data : DEMO_CATEGORIES;
  } catch (error) {
    return DEMO_CATEGORIES;
  }
}

export async function fetchProducts(params: {
  cityId?: number;
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedProductsResponse> {
  try {
    const res = await api.get("/catalog/products", {params});
    const data: PaginatedProductsResponse = res.data;

    if ((data.items?.length ?? 0) === 0) {
      const demoItems = getDemoProducts(params?.cityId, params?.categorySlug);
      return {
        ...data,
        items: demoItems,
        total: demoItems.length,
        page: 1,
        pageSize: demoItems.length,
      };
    }

    return data;
  } catch (error) {
    const demoItems = getDemoProducts(params?.cityId, params?.categorySlug);
    return {
      items: demoItems,
      total: demoItems.length,
      page: 1,
      pageSize: demoItems.length,
    };
  }
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  try {
    const res = await api.get(`/catalog/products/${id}`);
    return res.data;
  } catch (error) {
    const demo = getDemoProducts().find((p) => p.id === id);
    if (!demo) throw error;
    return demo;
  }
}
