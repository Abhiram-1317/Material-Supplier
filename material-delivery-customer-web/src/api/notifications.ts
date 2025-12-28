"use client";

import {api} from "@/lib/api";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";
export type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_FAILED"
  | "PAYMENT_SUCCESS"
  | "GENERIC";

export interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  status: NotificationStatus;
  orderId?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export async function fetchNotifications(): Promise<ApiNotification[]> {
  const res = await api.get("/notifications");
  return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}
