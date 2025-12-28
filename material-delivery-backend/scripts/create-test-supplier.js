// @ts-nocheck
const bcrypt = require('bcrypt');
const {PrismaClient, SupplierStatus, UserRole} = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const city = await prisma.city.findFirst();
    if (!city) {
      console.error('No city found in DB. Please seed cities first.');
      process.exit(1);
    }

    const email = 'supplier.test@example.com';
    const password = 'Passw0rd!';

    const existing = await prisma.user.findUnique({where: {email}});
    if (existing) {
      console.log('User already exists:', email);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone: '+911234567890',
        passwordHash,
        role: UserRole.SUPPLIER,
      },
    });

    const supplier = await prisma.supplier.create({
      data: {
        userId: user.id,
        companyName: 'Test Supplier',
        gstNumber: 'GSTTEST1234',
        cityId: city.id,
        address: 'Test address',
        status: SupplierStatus.ACTIVE,
      },
    });

    console.log('Created supplier login');
    console.log({email, password, city: city.name, companyName: supplier.companyName});
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
