"use client";

import {api} from "@/lib/api";

export interface ApiOrderRating {
  id: string;
  orderId: string;
  customerId: string;
  supplierId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertRatingPayload {
  rating: number;
  comment?: string;
}

export async function fetchOrderRating(orderId: string): Promise<ApiOrderRating | null> {
  try {
    const res = await api.get(`/ratings/orders/${orderId}`);
    return res.data ?? null;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function upsertOrderRating(
  orderId: string,
  payload: UpsertRatingPayload,
): Promise<ApiOrderRating> {
  const res = await api.post(`/ratings/orders/${orderId}`, payload);
  return res.data;
}
