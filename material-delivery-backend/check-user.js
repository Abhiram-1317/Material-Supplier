require('dotenv').config({path: `${__dirname}/.env`});
const {PrismaClient} = require('@prisma/client');
const {Pool} = require('pg');
const {PrismaPg} = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

(async () => {
  const pool = new Pool({connectionString: process.env.DATABASE_URL});
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({adapter});
  try {
    const user = await prisma.user.findUnique({where: {email: 'supplier@test.com'}});
    console.log('user', user);
    if (user) {
      const ok = await bcrypt.compare('Supplier123!', user.passwordHash || '');
      console.log('password matches?', ok);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
