import type {City} from '@/data/products';

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  materialName: string;
  category: string;
  unit: 'ton' | 'm3' | 'bag' | 'piece';
  quantity: number;
  pricePerUnit: number;
};

export interface SupplierOrder {
  id: string; // e.g. "ORD-23001"
  customerName: string; // e.g. "Sri Venkateshwara Constructions"
  siteLabel: string; // e.g. "Site 1 - Main Site"
  city: City; // "Warangal" or "Hanumakonda"
  addressLine: string; // short address text
  contactPhone: string;
  createdAt: string; // ISO string
  deliverySlot: string; // e.g. "Today, 8–11 AM"
  status: OrderStatus;
  paymentMethod: 'COD';
  totalAmount: number;
  items: OrderItem[];
}

export const INITIAL_ORDERS: SupplierOrder[] = [
  {
    id: 'ORD-23021',
    customerName: 'Sri Venkateshwara Constructions',
    siteLabel: 'Site 1 - Main Site',
    city: 'Warangal',
    addressLine: 'Kazipet Ring Road, Plot 12',
    contactPhone: '+91 98765 43021',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Today, 8–11 AM',
    status: 'PLACED',
    paymentMethod: 'COD',
    totalAmount: 72500,
    items: [
      {
        id: 'item-1',
        materialName: 'River Sand - Zone II',
        category: 'Sand',
        unit: 'ton',
        quantity: 25,
        pricePerUnit: 1750,
      },
      {
        id: 'item-2',
        materialName: 'OPC Cement 53 Grade',
        category: 'Cement',
        unit: 'bag',
        quantity: 60,
        pricePerUnit: 370,
      },
    ],
  },
  {
    id: 'ORD-23022',
    customerName: 'Megha Infra Projects',
    siteLabel: 'Flyover Package - A1',
    city: 'Hanumakonda',
    addressLine: 'Parsigutta Road, Sector 3',
    contactPhone: '+91 99632 11223',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Tomorrow, 2–5 PM',
    status: 'ACCEPTED',
    paymentMethod: 'COD',
    totalAmount: 118000,
    items: [
      {
        id: 'item-3',
        materialName: 'Ready Mix M30',
        category: 'Ready Mix Concrete',
        unit: 'm3',
        quantity: 20,
        pricePerUnit: 5200,
      },
      {
        id: 'item-4',
        materialName: 'Hollow Bricks 150mm',
        category: 'Bricks',
        unit: 'piece',
        quantity: 1800,
        pricePerUnit: 12,
      },
    ],
  },
  {
    id: 'ORD-23023',
    customerName: 'GK Builders',
    siteLabel: 'Residential Tower - Phase 2',
    city: 'Warangal',
    addressLine: 'MGM Road, Beside Park',
    contactPhone: '+91 98480 76543',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Today, 11 AM–1 PM',
    status: 'DISPATCHED',
    paymentMethod: 'COD',
    totalAmount: 56200,
    items: [
      {
        id: 'item-5',
        materialName: 'M-Sand (Manufactured)',
        category: 'Sand',
        unit: 'ton',
        quantity: 20,
        pricePerUnit: 1450,
      },
      {
        id: 'item-6',
        materialName: 'PPC Cement 43 Grade',
        category: 'Cement',
        unit: 'bag',
        quantity: 40,
        pricePerUnit: 340,
      },
    ],
  },
  {
    id: 'ORD-23024',
    customerName: 'Urban Living Developers',
    siteLabel: 'Site 3 - Villas Cluster',
    city: 'Hanumakonda',
    addressLine: 'Hunter Road, Plot 44',
    contactPhone: '+91 90000 11122',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Today, 4–6 PM',
    status: 'DELIVERED',
    paymentMethod: 'COD',
    totalAmount: 28600,
    items: [
      {
        id: 'item-7',
        materialName: 'Hollow Bricks 150mm',
        category: 'Bricks',
        unit: 'piece',
        quantity: 2000,
        pricePerUnit: 12,
      },
      {
        id: 'item-8',
        materialName: 'Precast Compound Wall Panel',
        category: 'Precast Wall',
        unit: 'piece',
        quantity: 4,
        pricePerUnit: 2600,
      },
    ],
  },
  {
    id: 'ORD-23025',
    customerName: 'Srinidhi Infra',
    siteLabel: 'Industrial Shed',
    city: 'Warangal',
    addressLine: 'Outer Ring Road, Plot 88',
    contactPhone: '+91 91234 56700',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Tomorrow, 9–11 AM',
    status: 'ACCEPTED',
    paymentMethod: 'COD',
    totalAmount: 84500,
    items: [
      {
        id: 'item-9',
        materialName: 'Ready Mix M25',
        category: 'Ready Mix Concrete',
        unit: 'm3',
        quantity: 15,
        pricePerUnit: 4800,
      },
      {
        id: 'item-10',
        materialName: 'Solid Bricks 200mm',
        category: 'Bricks',
        unit: 'piece',
        quantity: 1500,
        pricePerUnit: 16,
      },
    ],
  },
  {
    id: 'ORD-23026',
    customerName: 'Skyline Structures',
    siteLabel: 'Mall Extension',
    city: 'Hanumakonda',
    addressLine: 'KUC X Road, Block B',
    contactPhone: '+91 98111 22334',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Today, 6–8 PM',
    status: 'CANCELLED',
    paymentMethod: 'COD',
    totalAmount: 15400,
    items: [
      {
        id: 'item-11',
        materialName: 'Flyash Brick Pallet',
        category: 'Other',
        unit: 'piece',
        quantity: 1700,
        pricePerUnit: 9,
      },
    ],
  },
  {
    id: 'ORD-23027',
    customerName: 'Greenfield Estates',
    siteLabel: 'Site 2 - West Block',
    city: 'Warangal',
    addressLine: 'Hanamkonda Chowrasta',
    contactPhone: '+91 99555 88990',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    deliverySlot: 'Today, 1–3 PM',
    status: 'DISPATCHED',
    paymentMethod: 'COD',
    totalAmount: 41200,
    items: [
      {
        id: 'item-12',
        materialName: 'M-Sand (Manufactured)',
        category: 'Sand',
        unit: 'ton',
        quantity: 18,
        pricePerUnit: 1450,
      },
      {
        id: 'item-13',
        materialName: 'OPC Cement 53 Grade',
        category: 'Cement',
        unit: 'bag',
        quantity: 30,
        pricePerUnit: 375,
      },
    ],
  },
];
