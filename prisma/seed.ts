import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as never);

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
