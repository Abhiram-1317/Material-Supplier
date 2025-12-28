import {api} from './client';

export type ApiNotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCESS'
  | 'GENERIC';

export type ApiNotificationChannel = 'IN_APP' | 'SMS' | 'PUSH' | 'EMAIL';
export type ApiNotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

export interface ApiNotification {
  id: string;
  userId: string;
  role?: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | null;
  type: ApiNotificationType;
  channel: ApiNotificationChannel;
  status: ApiNotificationStatus;
  title: string;
  body: string;
  data?: Record<string, any> | null;
  orderId?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export async function fetchNotifications(): Promise<ApiNotification[]> {
  const res = await api.get('/notifications');
  return res.data;
}

export async function markNotificationRead(
  id: string,
): Promise<ApiNotification | undefined> {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}
