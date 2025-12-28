"use client";

import {api} from '@/lib/api';

export const VehicleStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  IN_SERVICE: 'IN_SERVICE',
} as const;
export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const VehicleType = {
  TIPPER: 'TIPPER',
  TRANSIT_MIXER: 'TRANSIT_MIXER',
  FLATBED: 'FLATBED',
  TRACTOR: 'TRACTOR',
  OTHER: 'OTHER',
} as const;
export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const DriverStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];

export interface ApiCityRef {
  id: number;
  name: string;
  code: string;
}

export interface ApiVehicle {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  capacityTons: number;
  status: VehicleStatus;
  notes?: string | null;
  city: ApiCityRef;
  assignedDriver?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  createdAt: string;
}

export interface ApiDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  city: ApiCityRef;
  assignedVehicle?: {
    id: string;
    registrationNumber: string;
  } | null;
  createdAt: string;
}

export interface CreateVehiclePayload {
  registrationNumber: string;
  type: VehicleType;
  capacityTons: number;
  cityId: number;
  status?: VehicleStatus;
  notes?: string;
}

export interface UpdateVehiclePayload {
  type?: VehicleType;
  capacityTons?: number;
  cityId?: number;
  status?: VehicleStatus;
  notes?: string;
  assignedDriverId?: string | null;
}

export interface CreateDriverPayload {
  name: string;
  phone: string;
  cityId: number;
  licenseNumber: string;
  status?: DriverStatus;
  assignedVehicleId?: string;
}

export interface UpdateDriverPayload {
  name?: string;
  phone?: string;
  cityId?: number;
  licenseNumber?: string;
  status?: DriverStatus;
  assignedVehicleId?: string | null;
}

export async function fetchVehicles(): Promise<ApiVehicle[]> {
  const res = await api.get('/supplier/vehicles');
  return res.data;
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<ApiVehicle> {
  const res = await api.post('/supplier/vehicles', payload);
  return res.data;
}

export async function updateVehicle(id: string, payload: UpdateVehiclePayload): Promise<ApiVehicle> {
  const res = await api.patch(`/supplier/vehicles/${id}`, payload);
  return res.data;
}

export async function fetchDrivers(): Promise<ApiDriver[]> {
  const res = await api.get('/supplier/drivers');
  return res.data;
}

export async function createDriver(payload: CreateDriverPayload): Promise<ApiDriver> {
  const res = await api.post('/supplier/drivers', payload);
  return res.data;
}

export async function updateDriver(id: string, payload: UpdateDriverPayload): Promise<ApiDriver> {
  const res = await api.patch(`/supplier/drivers/${id}`, payload);
  return res.data;
}
