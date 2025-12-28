"use client";

import {api} from "@/lib/api";
import type {ApiProduct} from "./catalog";
import type {ApiCustomerSite} from "./customer";

export type ApiOrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface ApiOrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: Pick<ApiProduct, "id" | "name" | "unit">;
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
  paymentMethod: string;
  paymentStatus: string;
  site: ApiCustomerSite;
  supplier: {
    id: string;
    companyName: string;
  };
  items: ApiOrderItem[];
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  siteId: string;
  supplierId: string;
  scheduledSlot: string;
  items: CreateOrderItemInput[];
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const res = await api.get("/orders");
  return res.data;
}

export async function fetchOrderById(id: string): Promise<ApiOrder> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  const res = await api.post("/orders", payload);
  return res.data;
}
