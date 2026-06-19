import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.DATABASE_URL = process.env.DATABASE_URL ? 'set' : 'MISSING'
  checks.INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD ? 'set' : 'MISSING'
  checks.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ? 'set' : 'MISSING'
  checks.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ? 'set' : 'MISSING'

  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
    checks.db_query = `ok (${count} events)`
  } catch (err) {
    checks.db_query = `FAILED: ${err instanceof Error ? err.message : String(err)}`
  }

  try {
    const cols = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position`,
    )
    checks.events_columns = (cols.rows as { column_name: string }[])
      .map((r) => r.column_name)
      .join(', ')
  } catch (err) {
    checks.events_columns = `FAILED: ${err instanceof Error ? err.message : String(err)}`
  }

  return NextResponse.json(checks, { status: 200 })
}
