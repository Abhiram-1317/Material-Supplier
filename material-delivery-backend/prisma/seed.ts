/*
Run migrations then seed:
  npx prisma migrate dev --name init
  npx prisma db seed
*/

import {PrismaClient, SupplierStatus, Unit, UserRole} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {Pool} from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({connectionString: process.env.DATABASE_URL});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

async function main() {
  // Cities
  const warangal = await prisma.city.upsert({
    where: {code: 'WARANGAL'},
    update: {},
    create: {name: 'Warangal', code: 'WARANGAL'},
  });

  const hanumakonda = await prisma.city.upsert({
    where: {code: 'HANUMAKONDA'},
    update: {},
    create: {name: 'Hanumakonda', code: 'HANUMAKONDA'},
  });

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: {email: 'admin@example.com'},
    update: {passwordHash: adminPassword, role: UserRole.ADMIN},
    create: {
      email: 'admin@example.com',
      fullName: 'Super Admin',
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
      admin: {create: {roleName: 'SUPER_ADMIN'}},
    },
  });

  // Additional admin user for web login
  const adminPasswordHash = await bcrypt.hash('Abhiram1317', 10);
  const adminUser2 = await prisma.user.upsert({
    where: {email: 'Shivarathriabhiram12@gmail.com'},
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email: 'Shivarathriabhiram12@gmail.com',
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
      fullName: 'Abhiram',
    },
  });

  await prisma.admin.upsert({
    where: {userId: adminUser2.id},
    update: {},
    create: {
      userId: adminUser2.id,
      roleName: 'SUPER_ADMIN',
    },
  });

  // Supplier user (for supplier web login)
  const supplierPassword = await bcrypt.hash('Abhiram1317', 10);
  const supplierUser = await prisma.user.upsert({
    where: {email: 'shivarathriabhiram12@gamil.com'},
    update: {passwordHash: supplierPassword, role: UserRole.SUPPLIER},
    create: {
      email: 'shivarathriabhiram12@gamil.com',
      fullName: 'Supplier User',
      role: UserRole.SUPPLIER,
      passwordHash: supplierPassword,
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: {userId: supplierUser.id},
    update: {},
    create: {
      userId: supplierUser.id,
      companyName: 'Warangal Materials Co.',
      gstNumber: 'GST-DEMO-1234',
      cityId: warangal.id,
      address: 'Industrial Area, Warangal',
      status: SupplierStatus.ACTIVE,
    },
  });

  // Optional plant
  await prisma.supplierPlant.upsert({
    where: {id: supplier.id}, // unique trick: ensure single plant per seed run via id reuse
    update: {},
    create: {
      id: supplier.id,
      supplierId: supplier.id,
      cityId: warangal.id,
      name: 'Primary Plant',
      address: 'Industrial Area, Warangal',
    },
  });

  // Slot capacities (optional for testing)
  const defaultSlots = [
    {label: '8–11 AM', maxOrdersPerDay: 5},
    {label: '11–2 PM', maxOrdersPerDay: 4},
    {label: '2–5 PM', maxOrdersPerDay: 3},
  ];

  for (const cfg of defaultSlots) {
    await prisma.supplierSlotConfig.upsert({
      where: {supplierId_label: {supplierId: supplier.id, label: cfg.label}},
      update: {maxOrdersPerDay: cfg.maxOrdersPerDay, isActive: true},
      create: {
        supplierId: supplier.id,
        label: cfg.label,
        maxOrdersPerDay: cfg.maxOrdersPerDay,
        isActive: true,
      },
    });
  }

  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: {slug: 'sand'},
      update: {},
      create: {name: 'Sand', slug: 'sand', description: 'River sand and manufactured sand'},
    }),
    prisma.productCategory.upsert({
      where: {slug: 'cement'},
      update: {},
      create: {name: 'Cement', slug: 'cement', description: 'OPC and PPC grades'},
    }),
    prisma.productCategory.upsert({
      where: {slug: 'rmc'},
      update: {},
      create: {name: 'Ready Mix Concrete', slug: 'rmc', description: 'RMC supply'},
    }),
  ]);

  const [sandCat, cementCat, rmcCat] = categories;

  // Products
  await prisma.product.upsert({
    where: {id: 'sand-40mm'},
    update: {},
    create: {
      id: 'sand-40mm',
      supplierId: supplier.id,
      categoryId: sandCat.id,
      name: 'M-Sand 40mm',
      unit: Unit.TON,
      basePrice: 950.0,
      minOrderQty: 5,
      leadTimeHours: 6,
      cityId: warangal.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: {id: 'cement-ppc'},
    update: {},
    create: {
      id: 'cement-ppc',
      supplierId: supplier.id,
      categoryId: cementCat.id,
      name: 'Cement PPC 50kg',
      unit: Unit.BAG,
      basePrice: 380.0,
      minOrderQty: 50,
      leadTimeHours: 12,
      cityId: warangal.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: {id: 'rmc-m30'},
    update: {},
    create: {
      id: 'rmc-m30',
      supplierId: supplier.id,
      categoryId: rmcCat.id,
      name: 'RMC M30',
      unit: Unit.M3,
      basePrice: 5200.0,
      minOrderQty: 5,
      leadTimeHours: 24,
      cityId: warangal.id,
      isActive: true,
    },
  });

  // Test supplier user for dashboard login
  const supplierPasswordHash = await bcrypt.hash('Supplier123!', 10);

  const supplierUserTest = await prisma.user.upsert({
    where: {email: 'supplier@test.com'},
    update: {
      passwordHash: supplierPasswordHash,
      role: UserRole.SUPPLIER,
      fullName: 'Test Supplier',
    },
    create: {
      email: 'supplier@test.com',
      role: UserRole.SUPPLIER,
      passwordHash: supplierPasswordHash,
      fullName: 'Test Supplier',
    },
  });

  const warangalCityForSupplier =
    (await prisma.city.findFirst({where: {code: 'WARANGAL'}})) ?? (await prisma.city.findFirst());

  if (!warangalCityForSupplier) {
    throw new Error('No city found to attach supplier to');
  }

  await prisma.supplier.upsert({
    where: {userId: supplierUserTest.id},
    update: {},
    create: {
      userId: supplierUserTest.id,
      companyName: 'Test Supplier Company',
      status: SupplierStatus.ACTIVE,
      cityId: warangalCityForSupplier.id,
      address: 'Warangal, Telangana',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
