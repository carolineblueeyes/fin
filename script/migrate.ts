import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../server/db";

async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed!");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});