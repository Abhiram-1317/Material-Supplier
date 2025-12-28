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
  const response = await api.post<ApiOrder>('/orders', payload);
  return response.data;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const response = await api.get<ApiOrder[]>('/orders');
  return response.data;
}

export async function fetchOrderById(id: string): Promise<ApiOrder> {
  const response = await api.get<ApiOrder>(`/orders/${id}`);
  return response.data;
}
