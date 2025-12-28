import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {City} from './LocationContext';
import {useAuth} from './AuthContext';
import {
  createCustomerSite,
  deleteCustomerSite,
  fetchCustomerProfile,
  fetchCustomerSites,
  updateCustomerProfile,
  updateCustomerSite,
  type ApiCustomerSite,
} from '../api/customer';

export type UserProfile = {
  fullName?: string;
  companyName?: string;
  gstNumber?: string;
};

export type Address = {
  id: string;
  label: string;
  city: City;
  line1: string;
  line2?: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
};

export type AddressInput = Omit<Address, 'id'> & {id?: string};

export type UserProfileContextValue = {
  profile: UserProfile;
  addresses: Address[];
  loadingProfile: boolean;
  loadingSites: boolean;
  error?: string;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addOrUpdateAddress: (input: AddressInput) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {isAuthenticated} = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isAuthenticated) {
        if (!isMounted) return;
        setProfile({});
        setAddresses([]);
        setLoadingProfile(false);
        setLoadingSites(false);
        setError(undefined);
        return;
      }

      try {
        setLoadingProfile(true);
        const data = await fetchCustomerProfile();
        if (!isMounted) return;
        setProfile({
          fullName: data.fullName ?? undefined,
          companyName: data.customer?.companyName ?? undefined,
          gstNumber: data.customer?.gstNumber ?? undefined,
        });
        setError(undefined);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load profile');
      } finally {
        if (isMounted) setLoadingProfile(false);
      }

      try {
        setLoadingSites(true);
        const sites = await fetchCustomerSites();
        if (!isMounted) return;
        setAddresses(sites.map(mapSiteToAddress));
        setError(undefined);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load sites');
        setAddresses([]);
      } finally {
        if (isMounted) setLoadingSites(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const payload = {
      fullName: updates.fullName,
      companyName: updates.companyName,
      gstNumber: updates.gstNumber,
    };
    const updated = await updateCustomerProfile(payload);
    setProfile({
      fullName: updated.fullName ?? undefined,
      companyName: updated.customer?.companyName ?? undefined,
      gstNumber: updated.customer?.gstNumber ?? undefined,
    });
  };

  const addOrUpdateAddress = async (input: AddressInput): Promise<Address> => {
    const cityId = CITY_ID_MAP[input.city];
    if (!cityId) {
      throw new Error('Unknown city');
    }

    const payload = {
      label: input.label,
      cityId,
      addressLine: formatAddressLine(input.line1, input.line2),
      pincode: input.pincode,
      isDefault: input.isDefault,
    };

    const site = input.id
      ? await updateCustomerSite(input.id, payload)
      : await createCustomerSite(payload);

    const mapped = mapSiteToAddress(site);

    setAddresses(prev => {
      const exists = prev.some(addr => addr.id === mapped.id);
      let next = exists
        ? prev.map(addr => (addr.id === mapped.id ? mapped : addr))
        : [...prev, mapped];

      if (mapped.isDefault) {
        next = next.map(addr => ({...addr, isDefault: addr.id === mapped.id}));
      }
      return next;
    });

    return mapped;
  };

  const deleteAddress = async (id: string) => {
    await deleteCustomerSite(id);
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    await updateCustomerSite(id, {isDefault: true});
    setAddresses(prev => prev.map(addr => ({...addr, isDefault: addr.id === id})));
  };

  const getDefaultAddress = () => addresses.find(addr => addr.isDefault);

  const value = useMemo(
    () => ({
      profile,
      addresses,
      loadingProfile,
      loadingSites,
      error,
      updateProfile,
      addOrUpdateAddress,
      deleteAddress,
      setDefaultAddress,
      getDefaultAddress,
    }),
    [profile, addresses, loadingProfile, loadingSites, error],
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = (): UserProfileContextValue => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within a UserProfileProvider');
  return ctx;
};

const CITY_ID_MAP: Record<City, number> = {
  Warangal: 1,
  Hanumakonda: 2,
};

function formatAddressLine(line1: string, line2?: string) {
  return `${line1}${line2 ? ', ' + line2 : ''}`;
}

function mapSiteToAddress(site: ApiCustomerSite): Address {
  const cityName = normalizeCity(site.city.name);
  return {
    id: site.id,
    label: site.label,
    city: cityName,
    line1: site.addressLine,
    pincode: site.pincode,
    isDefault: site.isDefault,
  };
}

function normalizeCity(name: string): City {
  const lowered = name.toLowerCase();
  if (lowered === 'warangal') return 'Warangal';
  if (lowered === 'hanumakonda') return 'Hanumakonda';
  return 'Warangal';
}
