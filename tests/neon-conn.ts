import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "info", "warn", "error"],
});

async function test() {
  console.log("Connecting with Prisma to Neon...");
  try {
    const res = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log("Prisma Connected successfully:", res);
  } catch (err) {
    console.error("Prisma Connection Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
