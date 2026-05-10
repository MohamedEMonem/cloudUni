import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = "postgresql://root:dokkanroot@dokkandb.c854csucuyms.us-east-1.rds.amazonaws.com:5432/postgres";
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined. Ensure .env is loaded before Prisma client initialization.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;