import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events, accountPool, attackJobs } from '@/lib/db/schema'
import { eq, and, sql, gte } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'

export type ReadinessCheck = {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

export type ReadinessResponse = {
  checks: ReadinessCheck[]
  allPassed: boolean
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const checks: ReadinessCheck[] = []

  // 1. Stripe API key validation
  try {
    await stripe.accounts.list({ limit: 1 })
    checks.push({
      id: 'stripe_key',
      label: 'Stripe platform API key validated',
      status: 'pass',
      detail: 'API key is active and Connect-enabled.',
    })
  } catch (err) {
    checks.push({
      id: 'stripe_key',
      label: 'Stripe platform API key validated',
      status: 'fail',
      detail: err instanceof Error ? err.message : 'Key validation failed.',
    })
  }

  // 2. Account pool provisioning status
  const [event] = await db
    .select({ maxParticipants: events.maxParticipants })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)

  const poolRows = await db
    .select({ status: accountPool.status })
    .from(accountPool)
    .where(eq(accountPool.eventId, id))

  const poolReady = poolRows.filter(
    (r) => r.status === 'available' || r.status === 'assigned',
  ).length
  const maxP = event?.maxParticipants ?? 50

  if (poolReady >= maxP) {
    checks.push({
      id: 'accounts_provisioned',
      label: `${poolReady} / ${maxP} accounts pre-provisioned`,
      status: 'pass',
      detail: 'All participant slots have Stripe accounts ready.',
    })
  } else if (poolReady >= 10) {
    checks.push({
      id: 'accounts_provisioned',
      label: `${poolReady} / ${maxP} accounts pre-provisioned`,
      status: 'warn',
      detail:
        'Minimum 10 accounts ready. Provisioning may still be in progress.',
    })
  } else {
    checks.push({
      id: 'accounts_provisioned',
      label: `${poolReady} / ${maxP} accounts pre-provisioned`,
      status: 'fail',
      detail:
        'Need at least 10 accounts before participants can join. Wait for provisioning.',
    })
  }

  // 3. Database connectivity
  try {
    await db.select({ one: sql`1` }).from(events).limit(1)
    checks.push({
      id: 'database',
      label: 'Database reachable',
      status: 'pass',
      detail: 'PostgreSQL connection pool active.',
    })
  } catch (err) {
    checks.push({
      id: 'database',
      label: 'Database reachable',
      status: 'fail',
      detail: err instanceof Error ? err.message : 'Connection failed.',
    })
  }

  // 4. Attack job processor active (last ran within 60 seconds)
  const sixtySecondsAgo = new Date(Date.now() - 60_000)
  const recentJobs = await db
    .select({ id: attackJobs.id })
    .from(attackJobs)
    .where(
      and(
        eq(attackJobs.status, 'complete'),
        gte(attackJobs.completedAt, sixtySecondsAgo),
      ),
    )
    .limit(1)

  // If there are no attack jobs at all, that's fine — processor just has nothing to do
  const totalJobs = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attackJobs)
    .where(eq(attackJobs.eventId, id))

  if (recentJobs.length > 0 || (totalJobs[0]?.count ?? 0) === 0) {
    checks.push({
      id: 'processor',
      label: 'Attack job processor active',
      status: 'pass',
      detail:
        recentJobs.length > 0
          ? 'Processor completed a job within the last 60 seconds.'
          : 'No attack jobs queued — processor will activate when needed.',
    })
  } else {
    checks.push({
      id: 'processor',
      label: 'Attack job processor active',
      status: 'warn',
      detail:
        'No jobs completed recently. Processor may be inactive — verify cron is running.',
    })
  }

  const allPassed = checks.every((c) => c.status !== 'fail')

  return NextResponse.json({ checks, allPassed } satisfies ReadinessResponse)
}
