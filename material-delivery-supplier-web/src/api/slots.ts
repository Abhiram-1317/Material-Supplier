"use client";

import {api} from '@/lib/api';

export interface SupplierSlotConfig {
  id: string;
  label: string;
  maxOrdersPerDay: number;
  isActive: boolean;
}

export async function fetchSupplierSlots(): Promise<SupplierSlotConfig[]> {
  const res = await api.get('/supplier/slots');
  return res.data;
}

export async function upsertSupplierSlots(slots: SupplierSlotConfig[]): Promise<SupplierSlotConfig[]> {
  const payload = {
    slots: slots.map((s) => ({
      label: s.label,
      maxOrdersPerDay: s.maxOrdersPerDay,
      isActive: s.isActive,
    })),
  };
  const res = await api.put('/supplier/slots', payload);
  return res.data;
}
