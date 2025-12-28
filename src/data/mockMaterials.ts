export type MaterialCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
};

export type Supplier = {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  city: string;
  distanceKm: number;
  isVerified: boolean;
};

export type MaterialProduct = {
  id: string;
  name: string;
  categoryId: string;
  supplierId: string;
  unit: 'ton' | 'm3' | 'bag' | 'piece';
  pricePerUnit: number;
  minOrderQuantity: number;
  leadTimeHours: number;
  description?: string;
  grade?: string;
  imageUrl?: string;
  isPopular?: boolean;
};

export const CATEGORIES: MaterialCategory[] = [
  {
    id: 'cat-sand',
    name: 'Sand',
    slug: 'sand',
    icon: 'dump-truck',
    description: 'River sand, M-sand, plastering sand for all site needs.',
  },
  {
    id: 'cat-cement',
    name: 'Cement',
    slug: 'cement',
    icon: 'bag-checked',
    description: 'OPC/PPC/PSC bags from trusted brands.',
  },
  {
    id: 'cat-rmc',
    name: 'Ready Mix Concrete',
    slug: 'rmc',
    icon: 'truck-fast',
    description: 'RMC grades M20 to M40 delivered in transit mixers.',
  },
  {
    id: 'cat-bricks',
    name: 'Bricks',
    slug: 'bricks',
    icon: 'wall',
    description: 'Clay bricks, blocks, and fly-ash options.',
  },
  {
    id: 'cat-precast',
    name: 'Precast Walls',
    slug: 'precast',
    icon: 'home-modern',
    description: 'Precast compound walls and slabs.',
  },
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'BuildRight Suppliers',
    rating: 4.6,
    totalRatings: 182,
    city: 'Warangal',
    distanceKm: 8.4,
    isVerified: true,
  },
  {
    id: 'sup-2',
    name: 'MegaCem Depot',
    rating: 4.4,
    totalRatings: 240,
    city: 'Warangal',
    distanceKm: 12.1,
    isVerified: true,
  },
  {
    id: 'sup-3',
    name: 'Sri Lakshmi RMC',
    rating: 4.7,
    totalRatings: 321,
    city: 'Hanumakonda',
    distanceKm: 6.2,
    isVerified: true,
  },
  {
    id: 'sup-4',
    name: 'Prime Bricks & Blocks',
    rating: 4.3,
    totalRatings: 98,
    city: 'Hanumakonda',
    distanceKm: 9.7,
    isVerified: false,
  },
];

export const MATERIALS: MaterialProduct[] = [
  {
    id: 'mat-1',
    name: 'River Sand - Grade A',
    categoryId: 'cat-sand',
    supplierId: 'sup-1',
    unit: 'ton',
    pricePerUnit: 1200,
    minOrderQuantity: 2,
    leadTimeHours: 4,
    isPopular: true,
    description: 'Washed river sand suitable for plastering and concrete.',
  },
  {
    id: 'mat-2',
    name: 'M-Sand (Zone II)',
    categoryId: 'cat-sand',
    supplierId: 'sup-1',
    unit: 'ton',
    pricePerUnit: 1050,
    minOrderQuantity: 2,
    leadTimeHours: 5,
    description: 'Manufactured sand with consistent grading.',
  },
  {
    id: 'mat-3',
    name: 'OPC Cement 53 Grade',
    categoryId: 'cat-cement',
    supplierId: 'sup-2',
    unit: 'bag',
    pricePerUnit: 360,
    minOrderQuantity: 20,
    leadTimeHours: 3,
    isPopular: true,
    description: 'High strength OPC 53 grade cement bags.',
  },
  {
    id: 'mat-4',
    name: 'PPC Cement',
    categoryId: 'cat-cement',
    supplierId: 'sup-2',
    unit: 'bag',
    pricePerUnit: 340,
    minOrderQuantity: 20,
    leadTimeHours: 4,
  },
  {
    id: 'mat-5',
    name: 'RMC M25',
    categoryId: 'cat-rmc',
    supplierId: 'sup-3',
    unit: 'm3',
    pricePerUnit: 5200,
    minOrderQuantity: 6,
    leadTimeHours: 6,
    grade: 'M25',
    isPopular: true,
    description: 'Transit-mixed concrete, slump adjustable on site.',
  },
  {
    id: 'mat-6',
    name: 'RMC M30',
    categoryId: 'cat-rmc',
    supplierId: 'sup-3',
    unit: 'm3',
    pricePerUnit: 5600,
    minOrderQuantity: 6,
    leadTimeHours: 6,
    grade: 'M30',
  },
  {
    id: 'mat-7',
    name: 'Clay Bricks - Class A',
    categoryId: 'cat-bricks',
    supplierId: 'sup-4',
    unit: 'piece',
    pricePerUnit: 8.5,
    minOrderQuantity: 500,
    leadTimeHours: 8,
  },
  {
    id: 'mat-8',
    name: 'Fly Ash Blocks 8 inch',
    categoryId: 'cat-bricks',
    supplierId: 'sup-4',
    unit: 'piece',
    pricePerUnit: 42,
    minOrderQuantity: 200,
    leadTimeHours: 10,
    isPopular: true,
  },
  {
    id: 'mat-9',
    name: 'Precast Compound Wall Panel',
    categoryId: 'cat-precast',
    supplierId: 'sup-1',
    unit: 'piece',
    pricePerUnit: 1800,
    minOrderQuantity: 20,
    leadTimeHours: 24,
    description: 'Reinforced precast panel for quick boundary walls.',
  },
  {
    id: 'mat-10',
    name: 'RMC M20',
    categoryId: 'cat-rmc',
    supplierId: 'sup-3',
    unit: 'm3',
    pricePerUnit: 4800,
    minOrderQuantity: 6,
    leadTimeHours: 6,
    grade: 'M20',
  },
];
