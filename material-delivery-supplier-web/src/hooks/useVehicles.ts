"use client";

import {useCallback, useMemo, useState} from 'react';
import type {City} from '@/data/products';
import {INITIAL_VEHICLES, Vehicle, VehicleStatus} from '@/data/logistics';

export type VehicleFilters = {
  city?: City | 'ALL';
  status?: VehicleStatus | 'ALL';
  search?: string; // registration or type
};

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [filters, setFilters] = useState<VehicleFilters>({
    city: 'ALL',
    status: 'ALL',
    search: '',
  });

  const updateFilters = useCallback((partial: Partial<VehicleFilters>) => {
    setFilters((prev) => ({...prev, ...partial}));
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.city && filters.city !== 'ALL' && v.city !== filters.city) return false;
      if (filters.status && filters.status !== 'ALL' && v.status !== filters.status) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        return v.registrationNumber.toLowerCase().includes(term) || v.type.toLowerCase().includes(term);
      }
      return true;
    });
  }, [filters.city, filters.search, filters.status, vehicles]);

  const addVehicle = useCallback((input: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...input,
      id: `veh_${Date.now()}`,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    return newVehicle;
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? {...v, ...updates} : v)));
  }, []);

  const toggleVehicleStatus = useCallback((id: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
          : v,
      ),
    );
  }, []);

  return {
    vehicles,
    filteredVehicles,
    filters,
    updateFilters,
    addVehicle,
    updateVehicle,
    toggleVehicleStatus,
  };
}
