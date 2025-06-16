import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// If no DATABASE_URL, skip real database initialization (e.g., during early dev)
let pool: Pool | any;
let db: ReturnType<typeof drizzle> | any;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn("DATABASE_URL not set. Skipping database initialization.");
  pool = {} as any;
  db = {} as any;
}
export { pool, db };