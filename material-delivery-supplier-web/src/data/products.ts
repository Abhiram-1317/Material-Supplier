export type City = 'Warangal' | 'Hanumakonda';

export type ProductCategory =
  | 'Sand'
  | 'Cement'
  | 'Ready Mix Concrete'
  | 'Bricks'
  | 'Precast Wall'
  | 'Other';

export type Unit = 'ton' | 'm3' | 'bag' | 'piece';

export type SupplierProductStatus = 'ACTIVE' | 'INACTIVE';

export interface SupplierProduct {
  id: string;
  name: string;
  category: ProductCategory;
  unit: Unit;
  basePrice: number; // price per unit
  minOrderQuantity: number;
  city: City;
  leadTimeHours: number;
  status: SupplierProductStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_PRODUCTS: SupplierProduct[] = [
  {
    id: 'prod_1001',
    name: 'River Sand - Zone II',
    category: 'Sand',
    unit: 'ton',
    basePrice: 1750,
    minOrderQuantity: 10,
    city: 'Warangal',
    leadTimeHours: 24,
    status: 'ACTIVE',
    createdAt: '2024-11-01T08:00:00.000Z',
    updatedAt: '2024-12-01T08:00:00.000Z',
  },
  {
    id: 'prod_1002',
    name: 'M-Sand (Manufactured)',
    category: 'Sand',
    unit: 'ton',
    basePrice: 1450,
    minOrderQuantity: 12,
    city: 'Hanumakonda',
    leadTimeHours: 18,
    status: 'ACTIVE',
    createdAt: '2024-10-21T08:00:00.000Z',
    updatedAt: '2024-12-02T08:00:00.000Z',
  },
  {
    id: 'prod_1003',
    name: 'OPC Cement 53 Grade',
    category: 'Cement',
    unit: 'bag',
    basePrice: 375,
    minOrderQuantity: 100,
    city: 'Warangal',
    leadTimeHours: 12,
    status: 'ACTIVE',
    createdAt: '2024-09-10T08:00:00.000Z',
    updatedAt: '2024-11-12T08:00:00.000Z',
  },
  {
    id: 'prod_1004',
    name: 'PPC Cement 43 Grade',
    category: 'Cement',
    unit: 'bag',
    basePrice: 340,
    minOrderQuantity: 120,
    city: 'Hanumakonda',
    leadTimeHours: 16,
    status: 'INACTIVE',
    createdAt: '2024-09-14T08:00:00.000Z',
    updatedAt: '2024-11-20T08:00:00.000Z',
  },
  {
    id: 'prod_1005',
    name: 'Ready Mix M25',
    category: 'Ready Mix Concrete',
    unit: 'm3',
    basePrice: 4800,
    minOrderQuantity: 15,
    city: 'Warangal',
    leadTimeHours: 10,
    status: 'ACTIVE',
    createdAt: '2024-08-01T08:00:00.000Z',
    updatedAt: '2024-12-05T08:00:00.000Z',
  },
  {
    id: 'prod_1006',
    name: 'Ready Mix M30',
    category: 'Ready Mix Concrete',
    unit: 'm3',
    basePrice: 5200,
    minOrderQuantity: 12,
    city: 'Hanumakonda',
    leadTimeHours: 12,
    status: 'ACTIVE',
    createdAt: '2024-08-18T08:00:00.000Z',
    updatedAt: '2024-11-30T08:00:00.000Z',
  },
  {
    id: 'prod_1007',
    name: 'Solid Bricks 200mm',
    category: 'Bricks',
    unit: 'piece',
    basePrice: 16,
    minOrderQuantity: 2000,
    city: 'Warangal',
    leadTimeHours: 36,
    status: 'INACTIVE',
    createdAt: '2024-07-05T08:00:00.000Z',
    updatedAt: '2024-10-15T08:00:00.000Z',
  },
  {
    id: 'prod_1008',
    name: 'Hollow Bricks 150mm',
    category: 'Bricks',
    unit: 'piece',
    basePrice: 12,
    minOrderQuantity: 2500,
    city: 'Hanumakonda',
    leadTimeHours: 30,
    status: 'ACTIVE',
    createdAt: '2024-07-10T08:00:00.000Z',
    updatedAt: '2024-11-01T08:00:00.000Z',
  },
  {
    id: 'prod_1009',
    name: 'Precast Compound Wall Panel',
    category: 'Precast Wall',
    unit: 'piece',
    basePrice: 2600,
    minOrderQuantity: 20,
    city: 'Warangal',
    leadTimeHours: 48,
    status: 'ACTIVE',
    createdAt: '2024-06-25T08:00:00.000Z',
    updatedAt: '2024-10-30T08:00:00.000Z',
  },
  {
    id: 'prod_1010',
    name: 'Flyash Brick Pallet',
    category: 'Other',
    unit: 'piece',
    basePrice: 9,
    minOrderQuantity: 3000,
    city: 'Hanumakonda',
    leadTimeHours: 30,
    status: 'ACTIVE',
    createdAt: '2024-06-20T08:00:00.000Z',
    updatedAt: '2024-11-15T08:00:00.000Z',
  },
];
