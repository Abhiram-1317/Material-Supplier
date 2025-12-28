"use client";

import {useCallback, useMemo, useState} from 'react';
import type {City} from '@/data/products';
import {Driver, DriverStatus, INITIAL_DRIVERS} from '@/data/logistics';

export type DriverFilters = {
  city?: City | 'ALL';
  status?: DriverStatus | 'ALL';
  search?: string; // name, phone, license
};

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [filters, setFilters] = useState<DriverFilters>({
    city: 'ALL',
    status: 'ALL',
    search: '',
  });

  const updateFilters = useCallback((partial: Partial<DriverFilters>) => {
    setFilters((prev) => ({...prev, ...partial}));
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (filters.city && filters.city !== 'ALL' && d.city !== filters.city) return false;
      if (filters.status && filters.status !== 'ALL' && d.status !== filters.status) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        return (
          d.name.toLowerCase().includes(term) ||
          d.phone.toLowerCase().includes(term) ||
          d.licenseNumber.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [drivers, filters.city, filters.search, filters.status]);

  const addDriver = useCallback((input: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...input,
      id: `drv_${Date.now()}`,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    return newDriver;
  }, []);

  const updateDriver = useCallback((id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? {...d, ...updates} : d)));
  }, []);

  const toggleDriverStatus = useCallback((id: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
          : d,
      ),
    );
  }, []);

  return {
    drivers,
    filteredDrivers,
    filters,
    updateFilters,
    addDriver,
    updateDriver,
    toggleDriverStatus,
  };
}
