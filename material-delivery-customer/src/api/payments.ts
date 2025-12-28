import {api} from './client';

export type ClientPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type ClientPaymentMethod = 'COD' | 'PREPAID' | 'UPI';

export interface PaymentIntentResponse {
  paymentId: string;
  orderId: string;
  amount: number | string;
  currency: string;
  provider: string;
  paymentMethod: ClientPaymentMethod;
  upiDeepLink?: string | null;
}

export interface CreatePaymentIntentPayload {
  orderId: string;
  paymentMethod?: ClientPaymentMethod;
}

export interface UpdatePaymentStatusPayload {
  orderId: string;
  status: ClientPaymentStatus;
  providerPaymentId?: string;
}

export async function createPaymentIntent(
  payload: CreatePaymentIntentPayload,
): Promise<PaymentIntentResponse> {
  const res = await api.post('/payments/intent', payload);
  return res.data;
}

export async function updatePaymentStatus(payload: UpdatePaymentStatusPayload): Promise<void> {
  await api.post('/payments/status', payload);
}
