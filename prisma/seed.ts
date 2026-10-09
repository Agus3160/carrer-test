import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const seed = async () => {
  await prisma.$transaction(async (tx) => {
    const password = process.env.ADMIN_PASSWORD || "Admin123";
    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";

    await tx.user.create({
      data: { email, name: "Admin", password: await bcrypt.hash(password, 12) },
    });
  });
};

seed()
  .then(() => console.log("Seed executed"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
