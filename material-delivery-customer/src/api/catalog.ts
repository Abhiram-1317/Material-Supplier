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

const DEMO_CATEGORIES: ApiCategory[] = [
  {id: 1, name: 'Cement', slug: 'cement', description: 'OPC and PPC grades'},
  {id: 2, name: 'Sand', slug: 'sand', description: 'River and M-sand'},
  {id: 3, name: 'Bricks', slug: 'bricks', description: 'Clay and fly ash'},
  {id: 4, name: 'Steel', slug: 'steel', description: 'TMT bars'},
];

function getDemoCity(cityId?: number): ApiCitySummary {
  if (cityId === 1) return {id: 1, name: 'Warangal', code: 'WAR'};
  if (cityId) return {id: cityId, name: 'Hanumakonda', code: 'HAN'};
  return {id: 99, name: 'Demo City', code: 'DEM'};
}

function getDemoProducts(cityId?: number, categorySlug?: string): ApiProduct[] {
  const city = getDemoCity(cityId);
  const base: ApiProduct[] = [
    {
      id: `demo-${city.code}-cement`,
      name: `${city.name} OPC 53 Grade Cement`,
      imageUrl: null,
      unit: 'BAG',
      basePrice: 430,
      minOrderQty: 50,
      leadTimeHours: 12,
      isActive: true,
      attributes: {type: 'OPC 53', size: '50kg'},
      bulkTiers: [
        {minQty: 200, price: 415},
        {minQty: 500, price: 400},
      ],
      deliveryCharge: 12,
      category: DEMO_CATEGORIES[0],
      supplier: {id: 'demo-supplier', companyName: 'Demo Materials'},
      city,
    },
    {
      id: `demo-${city.code}-sand`,
      name: `${city.name} River Sand (fine)`,
      imageUrl: null,
      unit: 'TON',
      basePrice: 1450,
      minOrderQty: 10,
      leadTimeHours: 24,
      isActive: true,
      attributes: {type: 'River', size: 'Fine'},
      bulkTiers: [
        {minQty: 50, price: 1400},
        {minQty: 100, price: 1350},
      ],
      deliveryCharge: 150,
      category: DEMO_CATEGORIES[1],
      supplier: {id: 'demo-supplier', companyName: 'Demo Materials'},
      city,
    },
    {
      id: `demo-${city.code}-bricks`,
      name: `${city.name} Clay Bricks (Class A)`,
      imageUrl: null,
      unit: 'PIECE',
      basePrice: 9,
      minOrderQty: 500,
      leadTimeHours: 24,
      isActive: true,
      attributes: {type: 'Clay', size: '9 inch', custom_name_option: false},
      bulkTiers: [
        {minQty: 1000, price: 8.5},
        {minQty: 5000, price: 8},
      ],
      deliveryCharge: 0.5,
      category: DEMO_CATEGORIES[2],
      supplier: {id: 'demo-supplier', companyName: 'Demo Materials'},
      city,
    },
    {
      id: `demo-${city.code}-steel`,
      name: `${city.name} TMT Steel Fe500 (12mm)`,
      imageUrl: null,
      unit: 'TON',
      basePrice: 55500,
      minOrderQty: 1,
      leadTimeHours: 18,
      isActive: true,
      attributes: {type: 'Fe500', size: '12mm'},
      bulkTiers: [
        {minQty: 5, price: 54800},
        {minQty: 15, price: 54000},
      ],
      deliveryCharge: 900,
      category: DEMO_CATEGORIES[3],
      supplier: {id: 'demo-supplier', companyName: 'Demo Materials'},
      city,
    },
  ];

  if (categorySlug) {
    return base.filter(p => p.category.slug === categorySlug);
  }
  return base;
}

export type ProductQueryParams = {
  cityId?: number;
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchCities(): Promise<ApiCity[]> {
  try {
    const response = await api.get<ApiCity[]>('/catalog/cities');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const response = await api.get<ApiCategory[]>('/catalog/categories');
    const data = response.data;
    return data.length ? data : DEMO_CATEGORIES;
  } catch (error) {
    return DEMO_CATEGORIES;
  }
}

export async function fetchProducts(
  params: ProductQueryParams,
): Promise<PaginatedProductsResponse> {
  try {
    const response = await api.get<PaginatedProductsResponse>(
      '/catalog/products',
      {params},
    );
    const data = response.data;

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
    const response = await api.get<ApiProduct>(`/catalog/products/${id}`);
    return response.data;
  } catch (error) {
    const demo = getDemoProducts().find(p => p.id === id);
    if (!demo) throw error;
    return demo;
  }
}
