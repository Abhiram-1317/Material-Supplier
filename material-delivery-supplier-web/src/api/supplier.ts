import {api} from '@/lib/api';

export type Unit = 'TON' | 'M3' | 'BAG' | 'PIECE';
export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface SupplierProfile {
  id: string;
  companyName: string;
  gstNumber?: string | null;
  city: {id: number; name: string; code: string};
}

export interface SupplierProduct {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  unit: Unit;
  basePrice: number | string;
  minOrderQty: number;
  leadTimeHours: number;
   attributes?: Record<string, any> | null;
   bulkTiers?: Array<{minQty: number; price: number}> | null;
   deliveryCharge?: number | string | null;
  isActive: boolean;
  category: {id: number; name: string; slug: string};
  city: {id: number; name: string; code: string};
}

export interface SupplierOrderItem {
  id: string;
  quantity: number;
  totalPrice: number | string;
  product: {id: string; name: string; unit: Unit};
}

export interface SupplierOrder {
  id: string;
  orderCode: string;
  status: OrderStatus;
  scheduledSlot: string;
  totalAmount: number | string;
  createdAt: string;
  site: {
    id: string;
    label: string;
    addressLine: string;
    pincode: string;
    city: {id: number; name: string; code: string};
  };
  customer: {
    id: string;
    fullName?: string | null;
    companyName?: string | null;
  } | null;
  items: SupplierOrderItem[];
}

export async function fetchSupplierProfile(): Promise<SupplierProfile> {
  const res = await api.get('/supplier/me');
  return res.data;
}

export async function fetchSupplierProducts(): Promise<SupplierProduct[]> {
  const res = await api.get('/supplier/products');
  return res.data;
}

export async function createSupplierProduct(data: {
  name: string;
  categorySlug: string;
  unit: Unit;
  basePrice: number;
  minOrderQty: number;
  leadTimeHours: number;
  attributes?: Record<string, any>;
  bulkTiers?: Array<{minQty: number; price: number}>;
  deliveryCharge?: number;
  imageUrl?: string | null;
  description?: string;
}): Promise<SupplierProduct> {
  const res = await api.post('/supplier/products', data);
  return res.data;
}

export async function updateSupplierProduct(
  id: string,
  data: Partial<{
    name: string;
    categorySlug: string;
    unit: Unit;
    basePrice: number;
    minOrderQty: number;
    leadTimeHours: number;
    isActive: boolean;
    attributes?: Record<string, any>;
    bulkTiers?: Array<{minQty: number; price: number}>;
    deliveryCharge?: number;
    imageUrl?: string | null;
    description?: string;
  }>,
): Promise<SupplierProduct> {
  const res = await api.patch(`/supplier/products/${id}`, data);
  return res.data;
}

export async function fetchSupplierOrders(): Promise<SupplierOrder[]> {
  const res = await api.get('/supplier/orders');
  return res.data;
}

export async function fetchSupplierOrderById(id: string): Promise<SupplierOrder> {
  const res = await api.get(`/supplier/orders/${id}`);
  return res.data;
}

export async function updateSupplierOrderStatus(id: string, status: OrderStatus): Promise<SupplierOrder> {
  const res = await api.patch(`/supplier/orders/${id}/status`, {status});
  return res.data;
}
