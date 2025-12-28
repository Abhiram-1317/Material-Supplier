"use client";

import {api} from '@/lib/api';

export interface SupplierOrderRating {
  id: string;
  orderId: string;
  supplierId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderCode: string;
    scheduledSlot: string;
  } | null;
  customer?: {
    id: string;
    user?: {
      fullName?: string | null;
    } | null;
  } | null;
}

export async function fetchSupplierRatings(): Promise<SupplierOrderRating[]> {
  const res = await api.get('/supplier/ratings');
  return res.data;
}
