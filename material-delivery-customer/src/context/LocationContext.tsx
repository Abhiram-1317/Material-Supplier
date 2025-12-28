import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {fetchCities, type ApiCity} from '../api/catalog';
import {requestAndDetectCity} from '../services/locationService';

export type CityName = 'Warangal' | 'Hanumakonda';

const SERVICE_CITIES: CityName[] = ['Warangal', 'Hanumakonda'];
const AUTO_CITY_KEY = 'location_auto_city_done';

type LocationContextValue = {
  currentCity: CityName;
  setCity: (city: CityName) => void;
  SERVICE_CITIES: CityName[];
  cities: ApiCity[];
  cityIds: Partial<Record<CityName, number>>;
  loadingCities: boolean;
  error?: string;
  autoDetecting: boolean;
  autoDetectError?: string | null;
  autoDetectCity: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined,
);

export function LocationProvider({children}: {children: React.ReactNode}) {
  const [currentCity, setCurrentCity] = useState<CityName>('Warangal');
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [cityIds, setCityIds] = useState<Partial<Record<CityName, number>>>({});
  const [loadingCities, setLoadingCities] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetectError, setAutoDetectError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCities = async () => {
      try {
        const response = await fetchCities();
        if (!isMounted) return;

        setCities(response);

        const ids = response.reduce<Partial<Record<CityName, number>>>((acc, city) => {
          const name = city.name.toLowerCase();
          if (name === 'warangal') acc.Warangal = city.id;
          if (name === 'hanumakonda') acc.Hanumakonda = city.id;
          return acc;
        }, {});

        setCityIds(ids);
        setError(undefined);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load cities');
        setCityIds({});
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, []);

  const autoDetectCity = async () => {
    setAutoDetecting(true);
    setAutoDetectError(null);
    const res = await requestAndDetectCity();
    setAutoDetecting(false);

    if (res.city) {
      setCurrentCity(res.city);
    } else if (res.error) {
      setAutoDetectError(res.error);
    } else {
      setAutoDetectError('Could not detect a supported city.');
    }
  };

  useEffect(() => {
    const runAutoDetectOnce = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTO_CITY_KEY);
        if (stored === '1') {
          return;
        }
        await autoDetectCity();
        await AsyncStorage.setItem(AUTO_CITY_KEY, '1');
      } catch (e) {
        // non-blocking; user can still tap button
        console.warn('Auto city detection failed', e);
      }
    };

    if (!loadingCities) {
      runAutoDetectOnce();
    }
  }, [loadingCities, autoDetectCity]);

  const value = useMemo(
    () => ({
      currentCity,
      setCity: setCurrentCity,
      SERVICE_CITIES,
      cities,
      cityIds,
      loadingCities,
      error,
      autoDetecting,
      autoDetectError,
      autoDetectCity,
    }),
    [currentCity, cities, cityIds, loadingCities, error, autoDetecting, autoDetectError],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
}
