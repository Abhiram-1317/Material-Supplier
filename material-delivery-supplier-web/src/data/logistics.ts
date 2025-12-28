import type {City} from '@/data/products';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'IN_SERVICE';

export type VehicleType = 'Tipper' | 'Transit Mixer' | 'Flatbed' | 'Tractor' | 'Other';

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g. "TS-02-AB-1234"
  type: VehicleType;
  capacityTons: number;
  city: City;
  status: VehicleStatus;
  assignedDriverName?: string;
  notes?: string;
}

export type DriverStatus = 'ACTIVE' | 'INACTIVE';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  city: City;
  licenseNumber: string;
  status: DriverStatus;
  assignedVehicleReg?: string;
}

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1001',
    registrationNumber: 'TS-02-AB-2311',
    type: 'Tipper',
    capacityTons: 18,
    city: 'Warangal',
    status: 'ACTIVE',
    assignedDriverName: 'Raju K',
    notes: 'Primary sand haul truck',
  },
  {
    id: 'veh_1002',
    registrationNumber: 'TS-32-BC-7788',
    type: 'Transit Mixer',
    capacityTons: 8,
    city: 'Hanumakonda',
    status: 'IN_SERVICE',
    assignedDriverName: 'Suresh P',
    notes: 'In service for drum maintenance',
  },
  {
    id: 'veh_1003',
    registrationNumber: 'TS-02-CD-5566',
    type: 'Flatbed',
    capacityTons: 20,
    city: 'Warangal',
    status: 'ACTIVE',
    assignedDriverName: 'Megha L',
    notes: 'Used for precast panels',
  },
  {
    id: 'veh_1004',
    registrationNumber: 'TS-02-EF-9090',
    type: 'Transit Mixer',
    capacityTons: 7,
    city: 'Hanumakonda',
    status: 'INACTIVE',
    assignedDriverName: undefined,
    notes: 'On standby',
  },
  {
    id: 'veh_1005',
    registrationNumber: 'TS-32-GH-4455',
    type: 'Tipper',
    capacityTons: 16,
    city: 'Warangal',
    status: 'ACTIVE',
    assignedDriverName: 'Anil D',
  },
  {
    id: 'veh_1006',
    registrationNumber: 'TS-02-IJ-1212',
    type: 'Tractor',
    capacityTons: 10,
    city: 'Hanumakonda',
    status: 'ACTIVE',
    assignedDriverName: 'Kiran Y',
  },
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv_2001',
    name: 'Raju K',
    phone: '+91 98765 32011',
    city: 'Warangal',
    licenseNumber: 'TS12 2024 5566',
    status: 'ACTIVE',
    assignedVehicleReg: 'TS-02-AB-2311',
  },
  {
    id: 'drv_2002',
    name: 'Suresh P',
    phone: '+91 99888 12345',
    city: 'Hanumakonda',
    licenseNumber: 'TS10 2019 7788',
    status: 'ACTIVE',
    assignedVehicleReg: 'TS-32-BC-7788',
  },
  {
    id: 'drv_2003',
    name: 'Megha L',
    phone: '+91 91234 55670',
    city: 'Warangal',
    licenseNumber: 'TS08 2021 2211',
    status: 'ACTIVE',
    assignedVehicleReg: 'TS-02-CD-5566',
  },
  {
    id: 'drv_2004',
    name: 'Anil D',
    phone: '+91 90000 44112',
    city: 'Warangal',
    licenseNumber: 'TS02 2020 8899',
    status: 'INACTIVE',
    assignedVehicleReg: 'TS-32-GH-4455',
  },
  {
    id: 'drv_2005',
    name: 'Kiran Y',
    phone: '+91 99555 77331',
    city: 'Hanumakonda',
    licenseNumber: 'TS22 2022 3344',
    status: 'ACTIVE',
    assignedVehicleReg: 'TS-02-IJ-1212',
  },
  {
    id: 'drv_2006',
    name: 'Lavanya S',
    phone: '+91 93450 11223',
    city: 'Hanumakonda',
    licenseNumber: 'TS18 2018 6677',
    status: 'INACTIVE',
    assignedVehicleReg: undefined,
  },
];
