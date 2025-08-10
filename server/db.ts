import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Hardcoded database URL for Supabase
const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://postgres.penajxugmtgjryffuhqi:GQB5ziQktCb3kumN@aws-0-eu-north-1.pooler.supabase.com:5432/postgres";

// Parse connection string to determine if it's Supabase
const isSupabase = DATABASE_URL.includes('supabase.com');

// Use standard pg driver for Supabase (which is PostgreSQL compatible)
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });