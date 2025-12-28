import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import {CreateSiteDto, UpdateSiteDto} from './dto/site.dto';
import {UpdateCustomerProfileDto} from './dto/update-customer-profile.dto';

const DEMO_CUSTOMER_ID = 'demo-customer';
const DEMO_CITIES = [
  {id: 1, name: 'Mumbai', code: 'MUM'},
  {id: 2, name: 'Delhi', code: 'DEL'},
  {id: 3, name: 'Bengaluru', code: 'BLR'},
];

type DemoSite = {
  id: string;
  customerId: string;
  label: string;
  city: (typeof DEMO_CITIES)[number];
  addressLine: string;
  pincode: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};

const demoCustomerProfile = {
  user: {
    id: DEMO_CUSTOMER_ID,
    role: 'CUSTOMER',
    fullName: 'Demo Customer',
    phone: '+911234567890',
    email: 'demo@example.com',
  },
  customer: {
    id: DEMO_CUSTOMER_ID,
    companyName: 'Demo Constructions',
    gstNumber: 'GST-DEMO-001',
  },
};

let demoSites = [
  {
    id: 'demo-site-1',
    customerId: DEMO_CUSTOMER_ID,
    label: 'Main Site',
    city: DEMO_CITIES[2],
    addressLine: 'MG Road, Bengaluru',
    pincode: '560001',
    isDefault: true,
    latitude: null,
    longitude: null,
  },
] as DemoSite[];

function pickDemoCity(cityId?: number) {
  if (cityId) {
    const found = DEMO_CITIES.find((c) => c.id === cityId);
    if (found) return found;
  }
  return DEMO_CITIES[0];
}

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    if (userId === DEMO_CUSTOMER_ID) {
      const defaultSite = demoSites.find((s) => s.isDefault) ?? null;
      return {...demoCustomerProfile, defaultSite};
    }

    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      include: {
        customer: true,
        supplier: false,
        admin: false,
      },
    });

    if (!user || !user.customer) {
      throw new NotFoundException('Customer not found');
    }

    const defaultSite = await this.prisma.customerSite.findFirst({
      where: {customerId: user.customer.id, isDefault: true},
      include: {city: true},
    });

    return {
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      },
      customer: user.customer,
      defaultSite,
    };
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto) {
    if (userId === DEMO_CUSTOMER_ID) {
      const updatedUser = {...demoCustomerProfile.user};
      const updatedCustomer = {...demoCustomerProfile.customer};

      if (dto.fullName !== undefined) updatedUser.fullName = dto.fullName;
      if (dto.companyName !== undefined) updatedCustomer.companyName = dto.companyName;
      if (dto.gstNumber !== undefined) updatedCustomer.gstNumber = dto.gstNumber;

      demoCustomerProfile.user = updatedUser;
      demoCustomerProfile.customer = updatedCustomer;
      return {user: updatedUser, customer: updatedCustomer};
    }

    let customer = await this.prisma.customer.findUnique({where: {userId}});
    if (!customer) {
      customer = await this.prisma.customer.create({data: {userId}});
    }

    const userUpdate: Record<string, unknown> = {};
    if (dto.fullName !== undefined) userUpdate.fullName = dto.fullName;

    const customerUpdate: Record<string, unknown> = {};
    if (dto.companyName !== undefined) customerUpdate.companyName = dto.companyName;
    if (dto.gstNumber !== undefined) customerUpdate.gstNumber = dto.gstNumber;

    return this.prisma.user.update({
      where: {id: userId},
      data: {
        ...userUpdate,
        customer: {
          update: customerUpdate,
        },
      },
      include: {
        customer: true,
      },
    });
  }

  listSites(customerId: string) {
    if (customerId === DEMO_CUSTOMER_ID) {
      return demoSites;
    }
    return this.prisma.customerSite.findMany({
      where: {customerId},
      include: {city: true},
      orderBy: {createdAt: 'desc'},
    });
  }

  async createSite(customerId: string, dto: CreateSiteDto) {
    if (customerId === DEMO_CUSTOMER_ID) {
      if (dto.isDefault) {
        demoSites = demoSites.map((s) => ({...s, isDefault: false}));
      }

      const city = pickDemoCity(dto.cityId);
      const newSite = {
        id: `demo-site-${Date.now()}`,
        customerId,
        label: dto.label,
        city,
        addressLine: dto.addressLine,
        pincode: dto.pincode,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        isDefault: dto.isDefault ?? false,
      };

      demoSites = [...demoSites, newSite];
      return newSite;
    }

    const city = await this.prisma.city.findUnique({where: {id: dto.cityId}});
    if (!city) {
      throw new BadRequestException('Invalid city');
    }

    if (dto.isDefault) {
      await this.prisma.customerSite.updateMany({where: {customerId}, data: {isDefault: false}});
    }

    return this.prisma.customerSite.create({
      data: {
        customerId,
        label: dto.label,
        cityId: dto.cityId,
        addressLine: dto.addressLine,
        pincode: dto.pincode,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        isDefault: dto.isDefault ?? false,
      },
      include: {city: true},
    });
  }

  async ensureSiteOwnership(customerId: string, siteId: string) {
    const site = await this.prisma.customerSite.findUnique({where: {id: siteId}});
    if (!site) throw new NotFoundException('Site not found');
    if (site.customerId !== customerId) throw new ForbiddenException('Not your site');
    return site;
  }

  async updateSite(customerId: string, siteId: string, dto: UpdateSiteDto) {
    if (customerId === DEMO_CUSTOMER_ID) {
      const site = demoSites.find((s) => s.id === siteId);
      if (!site) throw new NotFoundException('Site not found');

      const updatedCity = dto.cityId ? pickDemoCity(dto.cityId) : site.city;
      let updatedSites = demoSites;

      if (dto.isDefault) {
        updatedSites = demoSites.map((s) => ({...s, isDefault: false}));
      }

      const updatedSite = {
        ...site,
        ...dto,
        latitude: dto.latitude ?? site.latitude ?? null,
        longitude: dto.longitude ?? site.longitude ?? null,
        city: updatedCity,
      };

      demoSites = updatedSites.map((s) => (s.id === siteId ? updatedSite : s));
      return updatedSite;
    }

    await this.ensureSiteOwnership(customerId, siteId);

    if (dto.cityId) {
      const city = await this.prisma.city.findUnique({where: {id: dto.cityId}});
      if (!city) throw new BadRequestException('Invalid city');
    }

    if (dto.isDefault) {
      await this.prisma.customerSite.updateMany({where: {customerId}, data: {isDefault: false}});
    }

    const data: Prisma.CustomerSiteUpdateInput = {...dto};
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;

    return this.prisma.customerSite.update({
      where: {id: siteId},
      data,
      include: {city: true},
    });
  }

  async deleteSite(customerId: string, siteId: string) {
    if (customerId === DEMO_CUSTOMER_ID) {
      const index = demoSites.findIndex((s) => s.id === siteId);
      if (index === -1) throw new NotFoundException('Site not found');
      const wasDefault = demoSites[index]?.isDefault;
      demoSites = [...demoSites.slice(0, index), ...demoSites.slice(index + 1)];
      if (wasDefault && demoSites.length > 0) {
        demoSites = [{...demoSites[0], isDefault: true}, ...demoSites.slice(1)];
      }
      return {success: true};
    }

    await this.ensureSiteOwnership(customerId, siteId);
    // Optional: block delete if linked orders
    const ordersCount = await this.prisma.order.count({where: {siteId}});
    if (ordersCount > 0) {
      throw new BadRequestException('Cannot delete a site with orders');
    }
    await this.prisma.customerSite.delete({where: {id: siteId}});
    return {success: true};
  }
}
