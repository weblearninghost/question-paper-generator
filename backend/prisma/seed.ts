import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  for (let classNo = 1; classNo <= 10; classNo++) {
    await prisma.class.upsert({
      where: {
        classNo,
      },
      update: {},
      create: {
        name: `Class ${classNo}`,
        classNo,
      },
    });
  }

  console.log('Classes 1-10 seeded successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
