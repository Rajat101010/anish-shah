
require("dotenv").config({ override: true });

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  console.log("Database URL loaded:", Boolean(process.env.DATABASE_URL));
  console.log(
    "Database URL protocol:",
    process.env.DATABASE_URL?.split(":")[0]
  );

  const result = await db.$queryRaw`SELECT current_database()`;
  console.log("Database connection successful:", result);
}

main()
  .catch((error) => {
    console.error("DATABASE TEST FAILED:");
    console.error(error);
  })
  .finally(() => db.$disconnect());
