
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
});

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !/^postgres(?:ql)?:\/\//.test(databaseUrl.trim())) {
  throw new Error(
    "DATABASE_URL is missing or invalid. Check the .env file in your project root."
  );
}

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Site Admin";

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in .env."
    );
  }

  const passwordHash = await hash(password, 12);

  await db.admin.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      name,
      email,
      passwordHash,
    },
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin account:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
