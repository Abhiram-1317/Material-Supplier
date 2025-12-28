"use client";

import {api} from '@/lib/api';

export interface SlotAvailability {
  label: string;
  maxOrdersPerDay: number;
  booked: number;
  available: number;
  isActive: boolean;
}

export async function fetchSlotAvailability(params: {
  supplierId: string;
  date: string; // YYYY-MM-DD
}): Promise<SlotAvailability[]> {
  const res = await api.get('/orders/slot-availability', {params});
  return res.data;
}
