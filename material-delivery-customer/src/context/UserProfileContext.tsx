import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {
  createCustomerSite,
  deleteCustomerSite,
  fetchCustomerProfile,
  fetchCustomerSites,
  updateCustomerProfile,
  updateCustomerSite,
  type ApiCustomerSite,
} from '../api/customer';
import {useAuth} from './AuthContext';
import {CityName, useLocation} from './LocationContext';

export type UserProfile = {
  fullName?: string;
  companyName?: string;
  gstNumber?: string;
};

export type Address = {
  id: string;
  label: string;
  city: CityName;
  line1: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type AddressInput = {
  id?: string;
  label: string;
  city: CityName;
  line1: string;
  pincode: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
};

export type UserProfileContextValue = {
  profile: UserProfile;
  addresses: Address[];
  loadingProfile: boolean;
  loadingAddresses: boolean;
  error?: string;
  refreshProfile: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addOrUpdateAddress: (input: AddressInput) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined,
);

function mapSiteToAddress(site: ApiCustomerSite): Address {
  const cityName = site.city.name.toLowerCase() === 'hanumakonda' ? 'Hanumakonda' : 'Warangal';
  return {
    id: site.id,
    label: site.label,
    city: cityName,
    line1: site.addressLine,
    pincode: site.pincode,
    isDefault: site.isDefault,
    latitude: site.latitude ?? null,
    longitude: site.longitude ?? null,
  };
}

export function UserProfileProvider({children}: {children: React.ReactNode}) {
  const {isAuthenticated} = useAuth();
  const {cityIds} = useLocation();

  const [profile, setProfile] = useState<UserProfile>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile({});
      setAddresses([]);
      setError(undefined);
      return;
    }

    const load = async () => {
      setLoadingProfile(true);
      setLoadingAddresses(true);
      try {
        await Promise.all([refreshProfile(), refreshAddresses()]);
      } finally {
        setLoadingProfile(false);
        setLoadingAddresses(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const refreshProfile = async () => {
    try {
      const apiProfile = await fetchCustomerProfile();
      setProfile({
        fullName: apiProfile.fullName ?? undefined,
        companyName: apiProfile.customer?.companyName ?? undefined,
        gstNumber: apiProfile.customer?.gstNumber ?? undefined,
      });
      setError(undefined);
    } catch (err) {
      setError('Unable to load profile');
    }
  };

  const refreshAddresses = async () => {
    try {
      const sites = await fetchCustomerSites();
      setAddresses(sites.map(mapSiteToAddress));
      setError(undefined);
    } catch (err) {
      setError('Unable to load addresses');
      setAddresses([]);
    }
  };

  const updateProfileHandler = async (updates: Partial<UserProfile>) => {
    const payload: Partial<{fullName?: string; companyName?: string; gstNumber?: string}> = {};
    if (updates.fullName !== undefined) payload.fullName = updates.fullName;
    if (updates.companyName !== undefined) payload.companyName = updates.companyName;
    if (updates.gstNumber !== undefined) payload.gstNumber = updates.gstNumber;

    const result = await updateCustomerProfile(payload);
    setProfile({
      fullName: result.fullName ?? undefined,
      companyName: result.customer?.companyName ?? undefined,
      gstNumber: result.customer?.gstNumber ?? undefined,
    });
  };

  const addOrUpdateAddress = async (input: AddressInput): Promise<Address> => {
    const cityId = cityIds[input.city];
    if (!cityId) {
      throw new Error('Selected city is not available');
    }

    const payload = {
      label: input.label,
      cityId,
      addressLine: input.line1,
      pincode: input.pincode,
      isDefault: input.isDefault,
      latitude: input.latitude,
      longitude: input.longitude,
    };

    const site = input.id
      ? await updateCustomerSite(input.id, payload)
      : await createCustomerSite(payload);

    const mapped = mapSiteToAddress(site);
    setAddresses(prev => {
      const next = prev.filter(a => a.id !== mapped.id);
      next.push(mapped);
      if (mapped.isDefault) {
        return next.map(a => ({...a, isDefault: a.id === mapped.id}));
      }
      return next;
    });
    return mapped;
  };

  const deleteAddress = async (id: string) => {
    await deleteCustomerSite(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    await updateCustomerSite(id, {isDefault: true});
    setAddresses(prev => prev.map(a => ({...a, isDefault: a.id === id})));
  };

  const getDefaultAddress = () => addresses.find(a => a.isDefault);

  const value = useMemo(
    () => ({
      profile,
      addresses,
      loadingProfile,
      loadingAddresses,
      error,
      refreshProfile,
      refreshAddresses,
      updateProfile: updateProfileHandler,
      addOrUpdateAddress,
      deleteAddress,
      setDefaultAddress,
      getDefaultAddress,
    }),
    [profile, addresses, loadingProfile, loadingAddresses, error],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}
