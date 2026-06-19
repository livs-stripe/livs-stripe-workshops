import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

function createPool() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.warn('[db] DATABASE_URL not set — queries will fail at runtime')
  }
  return new Pool({
    connectionString: url ?? 'postgresql://localhost:5432/fallback',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
}

export const pool = createPool()
export const db = drizzle(pool, { schema })
