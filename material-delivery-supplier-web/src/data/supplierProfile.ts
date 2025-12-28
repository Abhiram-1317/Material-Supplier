import type {City} from '@/data/products';

export interface SupplierBusinessProfile {
  companyName: string;
  gstNumber?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export interface DeliverySlot {
  id: string;
  city: City;
  label: string; // e.g. "Morning 8–11 AM"
  startTime: string; // "08:00"
  endTime: string; // "11:00"
  active: boolean;
}

export interface SupplierSettings {
  businessProfile: SupplierBusinessProfile;
  servedCities: City[];
  defaultCity: City;
  deliverySlots: DeliverySlot[];
  notifications: {
    orderUpdates: boolean;
    criticalAlerts: boolean;
    marketing: boolean;
  };
}

export const DEFAULT_SUPPLIER_SETTINGS: SupplierSettings = {
  businessProfile: {
    companyName: 'Sri Lakshmi Ready Mix Concrete',
    contactName: 'Ravi Kumar',
    contactPhone: '+91-98765-43210',
    contactEmail: 'ops@srilakshmirms.com',
    gstNumber: '36ABCDE1234F1Z5',
  },
  servedCities: ['Warangal', 'Hanumakonda'],
  defaultCity: 'Warangal',
  deliverySlots: [
    {
      id: 'slot_1',
      city: 'Warangal',
      label: 'Morning 8–11 AM',
      startTime: '08:00',
      endTime: '11:00',
      active: true,
    },
    {
      id: 'slot_2',
      city: 'Warangal',
      label: 'Afternoon 12–3 PM',
      startTime: '12:00',
      endTime: '15:00',
      active: true,
    },
    {
      id: 'slot_3',
      city: 'Hanumakonda',
      label: 'Morning 9–12 AM',
      startTime: '09:00',
      endTime: '12:00',
      active: true,
    },
  ],
  notifications: {
    orderUpdates: true,
    criticalAlerts: true,
    marketing: false,
  },
};
