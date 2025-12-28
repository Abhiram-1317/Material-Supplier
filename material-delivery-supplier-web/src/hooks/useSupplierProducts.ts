"use client";

import {useCallback, useMemo, useState} from 'react';
import {
  City,
  INITIAL_PRODUCTS,
  ProductCategory,
  SupplierProduct,
  SupplierProductStatus,
} from '@/data/products';

export type ProductFilters = {
  city?: City;
  category?: ProductCategory | 'ALL';
  status?: SupplierProductStatus | 'ALL';
  search?: string;
};

type NewProductInput = Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>;

type UpdateInput = Partial<Omit<SupplierProduct, 'id' | 'createdAt'>>;

export function useSupplierProducts() {
  const [products, setProducts] = useState<SupplierProduct[]>(INITIAL_PRODUCTS);
  const [filters, setFilters] = useState<ProductFilters>({
    city: undefined,
    category: 'ALL',
    status: 'ACTIVE',
    search: '',
  });

  const updateFilters = useCallback((partial: Partial<ProductFilters>) => {
    setFilters((prev) => ({...prev, ...partial}));
  }, []);

  const filteredProducts = useMemo(() => {
    const searchValue = (filters.search ?? '').trim().toLowerCase();
    return products.filter((product) => {
      if (filters.city && product.city !== filters.city) return false;
      if (filters.category && filters.category !== 'ALL' && product.category !== filters.category) return false;
      if (filters.status && filters.status !== 'ALL' && product.status !== filters.status) return false;
      if (searchValue && !product.name.toLowerCase().includes(searchValue)) return false;
      return true;
    });
  }, [filters.category, filters.city, filters.search, filters.status, products]);

  const addProduct = useCallback((input: NewProductInput) => {
    const now = new Date().toISOString();
    const newProduct: SupplierProduct = {
      ...input,
      id: `prod_${Date.now()}`,
      status: input.status ?? 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updates: UpdateInput) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? {...p, ...updates, updatedAt: now} : p)),
    );
  }, []);

  const toggleProductStatus = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    );
  }, []);

  return {
    products,
    filteredProducts,
    filters,
    updateFilters,
    addProduct,
    updateProduct,
    toggleProductStatus,
  };
}
