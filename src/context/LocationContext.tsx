import React, {createContext, useContext, useState} from 'react';

export type City = 'Warangal' | 'Hanumakonda';

export type LocationContextValue = {
  currentCity: City;
  setCity: (city: City) => void;
  SERVICE_CITIES: City[];
};

const SERVICE_CITIES: City[] = ['Warangal', 'Hanumakonda'];

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [currentCity, setCity] = useState<City>('Warangal');

  return (
    <LocationContext.Provider value={{currentCity, setCity, SERVICE_CITIES}}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextValue => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
};
