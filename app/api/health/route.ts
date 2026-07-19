import { NextResponse } from 'next/server'
import { isInstructor } from '@/lib/instructor-auth'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  let dbOk = false
  try {
    await db.select({ one: sql`1` }).from(events).limit(1)
    dbOk = true
  } catch {}

  const status = dbOk ? 'healthy' : 'degraded'

  if (!(await isInstructor())) {
    return NextResponse.json({ status }, { status: dbOk ? 200 : 503 })
  }

  const checks: Record<string, string> = { status }
  checks.database = dbOk ? 'connected' : 'unreachable'
  checks.stripe_key = process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
  checks.instructor_password = process.env.INSTRUCTOR_PASSWORD ? 'configured' : 'missing'

  return NextResponse.json(checks, { status: dbOk ? 200 : 503 })
}
