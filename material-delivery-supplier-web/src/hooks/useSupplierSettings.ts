"use client";

import {useCallback, useEffect, useState} from 'react';
import {
  DEFAULT_SUPPLIER_SETTINGS,
  DeliverySlot,
  SupplierSettings,
} from '@/data/supplierProfile';

const STORAGE_KEY = 'supplier_settings_v1';

export function useSupplierSettings() {
  const [settings, setSettings] = useState<SupplierSettings>(DEFAULT_SUPPLIER_SETTINGS);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  // hydrate from localStorage on mount (browser only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SupplierSettings;
        setSettings(parsed);
      }
    } catch (e) {
      console.warn('Failed to load supplier settings from storage', e);
    } finally {
      setLoadedFromStorage(true);
    }
  }, []);

  // persist to localStorage after initial load
  useEffect(() => {
    if (!loadedFromStorage) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save supplier settings to storage', e);
    }
  }, [settings, loadedFromStorage]);

  const updateBusinessProfile = useCallback(
    (updates: Partial<SupplierSettings['businessProfile']>) => {
      setSettings((prev) => ({
        ...prev,
        businessProfile: {...prev.businessProfile, ...updates},
      }));
    },
    [],
  );

  const updateServedCities = useCallback((cities: SupplierSettings['servedCities']) => {
    setSettings((prev) => ({
      ...prev,
      servedCities: cities,
      defaultCity: cities.includes(prev.defaultCity) ? prev.defaultCity : cities[0] ?? prev.defaultCity,
    }));
  }, []);

  const updateDefaultCity = useCallback((city: SupplierSettings['defaultCity']) => {
    setSettings((prev) => ({
      ...prev,
      defaultCity: city,
      servedCities: prev.servedCities.includes(city) ? prev.servedCities : [...prev.servedCities, city],
    }));
  }, []);

  const upsertDeliverySlot = useCallback((slot: Omit<DeliverySlot, 'id'> & {id?: string}) => {
    setSettings((prev) => {
      if (slot.id) {
        return {
          ...prev,
          deliverySlots: prev.deliverySlots.map((s) => (s.id === slot.id ? {...s, ...slot} : s)),
        };
      }
      const id = `slot_${Date.now()}`;
      const newSlot: DeliverySlot = {...slot, id};
      return {
        ...prev,
        deliverySlots: [...prev.deliverySlots, newSlot],
      };
    });
  }, []);

  const deleteDeliverySlot = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      deliverySlots: prev.deliverySlots.filter((s) => s.id !== id),
    }));
  }, []);

  const updateNotifications = useCallback(
    (updates: Partial<SupplierSettings['notifications']>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: {...prev.notifications, ...updates},
      }));
    },
    [],
  );

  return {
    settings,
    updateBusinessProfile,
    updateServedCities,
    updateDefaultCity,
    upsertDeliverySlot,
    deleteDeliverySlot,
    updateNotifications,
  };
}
