import {api} from '@/lib/api';

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
export type OrderSlaStatus = 'NOT_APPLICABLE' | 'ON_TIME' | 'LATE';

export interface AdminOrder {
  id: string;
  orderCode: string;
  status: OrderStatus;
  slaStatus?: OrderSlaStatus;
  scheduledDate?: string | null;
  slotLabel?: string | null;
  deliveredAt?: string | null;
  totalAmount: string;
  deliveryFee: string;
  taxAmount: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  supplier: {
    id: string;
    companyName: string;
  } | null;
  site: {
    id: string;
    label: string;
    city: {
      name: string;
      code: string;
    } | null;
  } | null;
  customer: {
    id: string;
    companyName?: string | null;
    user?: {
      fullName?: string | null;
    } | null;
  } | null;
}

export interface PaginatedOrders {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminRating {
  id: string;
  orderId: string;
  supplierId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    companyName: string;
  };
  customer: {
    id: string;
    user?: {
      id: string;
      fullName?: string | null;
      email?: string | null;
    } | null;
  } | null;
  order: {
    id: string;
    orderCode: string;
  };
}

export interface PaginatedRatings {
  items: AdminRating[];
  total: number;
  page: number;
  pageSize: number;
}

export type SupplierStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface AdminSupplier {
  id: string;
  companyName: string;
  status: SupplierStatus;
  address: string;
  gstNumber?: string | null;
  city: {
    id: number;
    name: string;
    code: string;
  };
  user?: {
    id: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  createdAt: string;
}

export interface PaginatedSuppliers {
  items: AdminSupplier[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchOrders(params?: {
  status?: OrderStatus;
  supplierId?: string;
  cityCode?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedOrders> {
  const res = await api.get('/admin/orders', {params});
  return res.data;
}

export async function fetchRatings(params?: {
  supplierId?: string;
  rating?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedRatings> {
  const res = await api.get('/admin/ratings', {params});
  return res.data;
}

export async function fetchSuppliers(params?: {
  status?: SupplierStatus;
  cityCode?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedSuppliers> {
  const res = await api.get('/admin/suppliers', {params});
  return res.data;
}

export async function createSupplier(data: {
  companyName: string;
  email: string;
  password: string;
  phone: string;
  cityId: number;
  address: string;
  gstNumber?: string;
}): Promise<AdminSupplier> {
  const res = await api.post('/admin/suppliers', data);
  return res.data;
}
