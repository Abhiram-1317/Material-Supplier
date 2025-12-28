import {api} from './client';

export interface TrackingPoint {
  id: string;
  orderId: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export async function fetchLatestTrackingPoint(orderId: string): Promise<TrackingPoint | null> {
  const res = await api.get(`/orders/${orderId}/track/latest`);
  return res.data ?? null;
}
