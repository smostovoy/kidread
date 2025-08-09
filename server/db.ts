import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using a local database or Neon
const isLocalDB = process.env.DATABASE_URL.includes('localhost') || 
                  process.env.DATABASE_URL.includes('127.0.0.1');

let db: any;
let pool: any;

if (isLocalDB) {
  // Use standard pg driver for local PostgreSQL
  const { Pool: PgPool } = await import('pg');
  const { drizzle: drizzlePg } = await import('drizzle-orm/node-postgres');
  
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
} else {
  // Use Neon serverless driver for production
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle: drizzleNeon } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
}

export { pool, db };