import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@seusite.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin já existe:", adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      name: "Administrador",
      role: "ADMIN",
      ageVerified: true,
    },
  });

  console.log("Admin criado:", admin.email);
  console.log("Senha:", adminPassword);
  console.log("Troque a senha após o primeiro login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
