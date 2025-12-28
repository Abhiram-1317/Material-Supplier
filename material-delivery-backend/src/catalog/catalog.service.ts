import {Inject, Injectable} from '@nestjs/common';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import type {Cache} from 'cache-manager';
import {PrismaService} from '../prisma/prisma.service';
import {QueryProductsDto} from './dto/query-products.dto';

const DEMO_CITIES = [
  {id: 1, name: 'Mumbai', code: 'MUM'},
  {id: 2, name: 'Delhi', code: 'DEL'},
  {id: 3, name: 'Bengaluru', code: 'BLR'},
];

const DEMO_CATEGORIES = [
  {id: 1, name: 'Cement', slug: 'cement', description: 'Premium and OPC cement'},
  {id: 2, name: 'Sand', slug: 'sand', description: 'River and manufactured sand'},
  {id: 3, name: 'Bricks', slug: 'bricks', description: 'Clay and fly-ash bricks'},
];

const DEMO_SUPPLIERS = [
  {id: 'sup-1', companyName: 'Metro Materials'},
  {id: 'sup-2', companyName: 'BuildPro Supplies'},
];

const DEMO_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'UltraTech OPC 53',
    unit: 'BAG',
    basePrice: 380,
    minOrderQty: 50,
    leadTimeHours: 24,
    isActive: true,
    description: 'High-strength OPC 53 grade cement for structural work',
    category: DEMO_CATEGORIES[0],
    supplier: DEMO_SUPPLIERS[0],
    city: DEMO_CITIES[0],
  },
  {
    id: 'prod-2',
    name: 'River Sand (Washed)',
    unit: 'TON',
    basePrice: 1450,
    minOrderQty: 10,
    leadTimeHours: 36,
    isActive: true,
    description: 'Washed river sand suitable for plastering and masonry',
    category: DEMO_CATEGORIES[1],
    supplier: DEMO_SUPPLIERS[1],
    city: DEMO_CITIES[1],
  },
  {
    id: 'prod-3',
    name: 'Fly Ash Bricks',
    unit: 'PIECE',
    basePrice: 6.5,
    minOrderQty: 1000,
    leadTimeHours: 48,
    isActive: true,
    description: 'Eco-friendly fly ash bricks with uniform strength',
    category: DEMO_CATEGORIES[2],
    supplier: DEMO_SUPPLIERS[0],
    city: DEMO_CITIES[2],
  },
];

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async listCities() {
    const cacheKey = 'catalog:cities';
    const cached = await this.cache.get<typeof DEMO_CITIES>(cacheKey);
    if (cached) return cached;

    const cities = DEMO_CITIES;
    await this.cache.set(cacheKey, cities, 300);
    return cities;
  }

  async listCategories() {
    const cacheKey = 'catalog:categories';
    const cached = await this.cache.get<typeof DEMO_CATEGORIES>(cacheKey);
    if (cached) return cached;

    const categories = DEMO_CATEGORIES;
    await this.cache.set(cacheKey, categories, 300);
    return categories;
  }

  async listProducts(query: QueryProductsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    let filtered = DEMO_PRODUCTS.filter((p) => p.isActive);

    if (query.cityId) {
      filtered = filtered.filter((p) => p.city.id === Number(query.cityId));
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
    }

    if (query.categorySlug) {
      filtered = filtered.filter((p) => p.category.slug === query.categorySlug);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total,
    };
  }

  getProductById(id: string) {
    return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}
