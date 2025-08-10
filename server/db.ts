import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse connection string to determine if it's Supabase
const isSupabase = process.env.DATABASE_URL.includes('supabase.com');

// Use standard pg driver for Supabase (which is PostgreSQL compatible)
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });