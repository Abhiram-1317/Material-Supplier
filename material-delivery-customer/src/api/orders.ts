import {api} from './client';

export type ApiOrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ApiOrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: {
    id: string;
    name: string;
    unit: 'TON' | 'M3' | 'BAG' | 'PIECE';
  };
}

export interface ApiOrder {
  id: string;
  orderCode: string;
  status: ApiOrderStatus;
  scheduledSlot: string;
  totalAmount: number | string;
  deliveryFee: number | string;
  taxAmount: number | string;
  createdAt: string;
  paymentMethod: 'COD';
  site: {
    id: string;
    label: string;
    addressLine: string;
    pincode: string;
    city: {id: number; name: string; code: string};
  };
  supplier: {
    id: string;
    companyName: string;
  };
  items: ApiOrderItem[];
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  siteId: string;
  supplierId: string;
  scheduledSlot: string;
  items: CreateOrderItemPayload[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  const res = await api.post('/orders', payload);
  return res.data;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const res = await api.get('/orders');
  return res.data;
}

export async function fetchOrderById(id: string): Promise<ApiOrder> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}
