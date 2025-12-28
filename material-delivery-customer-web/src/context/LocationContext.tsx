"use client";

import React, {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from "react";
import {fetchCities, type ApiCity} from "@/api/catalog";

type LocationContextValue = {
  cities: ApiCity[];
  currentCity: ApiCity | null;
  loading: boolean;
  error: string | null;
  setCurrentCityId: (cityId: number) => void;
  autoDetecting: boolean;
  autoDetectError: string | null;
  autoDetectCity: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

const STORAGE_KEY = "customer_current_city_id";
const AUTO_CITY_KEY = "web_location_auto_city_done";
const FALLBACK_CITIES: ApiCity[] = [
  {id: 1, name: "Warangal", code: "WAR"},
  {id: 2, name: "Hanumakonda", code: "HAN"},
  {id: 3, name: "Hyderabad", code: "HYD"},
];

export function LocationProvider({children}: {children: ReactNode}) {
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [currentCity, setCurrentCity] = useState<ApiCity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoDetectError, setAutoDetectError] = useState<string | null>(null);

  const autoDetectCity = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setAutoDetectError("Geolocation not supported in this browser.");
      return;
    }

    setAutoDetecting(true);
    setAutoDetectError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAutoDetecting(false);
        const {latitude, longitude} = pos.coords;

        const warangalCenter = {lat: 17.9689, lng: 79.5941};
        const hanumakondaCenter = {lat: 18.004, lng: 79.56};

        const dist = (a: {lat: number; lng: number}, b: {lat: number; lng: number}) =>
          Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));

        const dWar = dist({lat: latitude, lng: longitude}, warangalCenter);
        const dHan = dist({lat: latitude, lng: longitude}, hanumakondaCenter);
        const targetName = dWar <= dHan ? "Warangal" : "Hanumakonda";

        const detectedCity =
          cities.find((c) => c.name.toLowerCase().includes(targetName.toLowerCase())) ??
          null;

        const fallbackCity = detectedCity ?? cities[0] ?? null;

        if (fallbackCity) {
          setCurrentCity(fallbackCity);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, String(fallbackCity.id));
          }
          setAutoDetectError(null);
        } else {
          setAutoDetectError("Could not detect a supported city.");
        }
      },
      (err) => {
        setAutoDetecting(false);
        setAutoDetectError(err.message || "Failed to get location.");
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
  }, [cities]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await fetchCities();
        const filtered = fetched.filter((c) => {
          const name = c.name.toLowerCase();
          return name.includes("warangal") || name.includes("hanumakonda");
        });
        const allCities = filtered.length ? filtered : fetched;
        if (!active) return;
        setCities(allCities);

        let savedId: number | null = null;
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) savedId = Number(stored);
        }

        const byId = savedId ? allCities.find((c) => c.id === savedId) ?? null : null;
        setCurrentCity(byId ?? allCities[0] ?? null);
      } catch (_err) {
        if (!active) return;
        setError("Failed to load cities");
        setCities(FALLBACK_CITIES);
        setCurrentCity(FALLBACK_CITIES[0]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(AUTO_CITY_KEY);
    if (stored === "1") return;

    autoDetectCity();
    window.localStorage.setItem(AUTO_CITY_KEY, "1");
  }, [loading, autoDetectCity]);

  const setCurrentCityId = (cityId: number) => {
    const city = cities.find((c) => c.id === cityId) ?? null;
    setCurrentCity(city);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(cityId));
    }
  };

  return (
    <LocationContext.Provider
      value={{
        cities,
        currentCity,
        loading,
        error,
        setCurrentCityId,
        autoDetecting,
        autoDetectError,
        autoDetectCity,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used within LocationProvider");
  return ctx;
}
