import 'server-only'

import { db } from '@/lib/db'
import {
  attackJobs,
  chargeOutcomes,
  participants,
  events,
  scores,
  moduleProgress,
} from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { stripe, stripeWithRetry, idempotencyKey } from '@/lib/stripe'
import { newId } from '@/lib/id'

const MAX_CONCURRENT_JOBS = 5
const CHARGE_DELAY_MS = 300
const CHARGE_AMOUNT_CENTS = 2500

/**
 * Process queued attack jobs. Called by the cron endpoint every 30s.
 * Picks up to MAX_CONCURRENT_JOBS from the queue and fires charges sequentially
 * within each job (with delay) to avoid Stripe rate limits.
 */
export async function processAttackQueue(): Promise<{
  processed: number
  failed: number
}> {
  // Claim jobs atomically
  const jobs = await db
    .update(attackJobs)
    .set({ status: 'processing', startedAt: new Date() })
    .where(
      sql`${attackJobs.id} IN (
        SELECT id FROM attack_jobs
        WHERE status = 'queued'
        ORDER BY "queuedAt" ASC
        LIMIT ${MAX_CONCURRENT_JOBS}
        FOR UPDATE SKIP LOCKED
      )`,
    )
    .returning()

  if (jobs.length === 0) return { processed: 0, failed: 0 }

  let processed = 0
  let failed = 0

  await Promise.all(
    jobs.map(async (job) => {
      try {
        await processOneJob(job)
        processed++
      } catch (err) {
        console.error(`[attack-processor] Job ${job.id} failed:`, err)
        await db
          .update(attackJobs)
          .set({
            status: 'failed',
            completedAt: new Date(),
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
          })
          .where(eq(attackJobs.id, job.id))
        failed++
      }
    }),
  )

  return { processed, failed }
}

async function processOneJob(job: typeof attackJobs.$inferSelect) {
  const [participant] = await db
    .select({ stripeAccountId: participants.stripeAccountId })
    .from(participants)
    .where(eq(participants.id, job.participantId))
    .limit(1)

  const [event] = await db
    .select({ startingBalanceCents: events.startingBalanceCents })
    .from(events)
    .where(eq(events.id, job.eventId))
    .limit(1)

  if (!participant?.stripeAccountId) {
    throw new Error('No Stripe account assigned to participant')
  }

  let chargesFired = job.chargesFired
  let chargesBlocked = job.chargesBlocked
  let chargesSucceeded = job.chargesSucceeded

  for (let i = chargesFired; i < job.chargesTotal; i++) {
    const isFraud = Math.random() < 0.7
    const amount = isFraud
      ? CHARGE_AMOUNT_CENTS + Math.floor(Math.random() * 5000)
      : CHARGE_AMOUNT_CENTS

    let outcome: 'blocked' | 'succeeded' | 'disputed' = 'succeeded'
    let chargeId: string | null = null

    try {
      const idemKey = idempotencyKey(
        job.eventId,
        job.participantId,
        job.moduleId,
        String(i),
      )

      const charge = await stripeWithRetry(
        () =>
          stripe.charges.create(
            {
              amount,
              currency: 'usd',
              source: 'tok_visa',
              metadata: {
                workshop_event: job.eventId,
                participant: job.participantId,
                module: job.moduleId,
                charge_index: String(i),
                is_fraud: String(isFraud),
              },
            },
            {
              stripeAccount: participant.stripeAccountId!,
              idempotencyKey: idemKey,
            },
          ),
        { context: `attack:${job.id}:${i}` },
      )

      chargeId = charge.id
      if (charge.outcome?.type === 'blocked') {
        outcome = 'blocked'
        chargesBlocked++
      } else {
        outcome = 'succeeded'
        chargesSucceeded++
      }
    } catch (err: unknown) {
      // If the charge was declined by Radar, count as blocked
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'charge_declined_for_fraud'
      ) {
        outcome = 'blocked'
        chargesBlocked++
      } else {
        outcome = 'succeeded'
        chargesSucceeded++
      }
    }

    chargesFired++

    // Record outcome
    await db.insert(chargeOutcomes).values({
      id: newId('co'),
      eventId: job.eventId,
      participantId: job.participantId,
      moduleId: job.moduleId,
      chargeId,
      amount,
      outcome,
      isFraudAttempt: isFraud,
    })

    // Update job progress
    await db
      .update(attackJobs)
      .set({ chargesFired, chargesBlocked, chargesSucceeded })
      .where(eq(attackJobs.id, job.id))

    // Delay between charges
    if (i < job.chargesTotal - 1) {
      await new Promise((r) => setTimeout(r, CHARGE_DELAY_MS))
    }
  }

  // Mark complete
  await db
    .update(attackJobs)
    .set({
      status: 'complete',
      completedAt: new Date(),
      chargesFired,
      chargesBlocked,
      chargesSucceeded,
    })
    .where(eq(attackJobs.id, job.id))

  // Trigger score recalculation
  await recalculateScore(job.participantId, job.eventId)
}

async function recalculateScore(participantId: string, eventId: string) {
  const [event] = await db
    .select({ startingBalanceCents: events.startingBalanceCents })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  const startingBalance = event?.startingBalanceCents ?? 100000

  const [chargeAgg] = await db
    .select({
      fraudBlocked: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = true AND ${chargeOutcomes.outcome} = 'blocked' THEN 1 ELSE 0 END), 0)::int`,
      fraudLosses: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = true AND ${chargeOutcomes.outcome} = 'succeeded' THEN ${chargeOutcomes.amount} ELSE 0 END), 0)::int`,
      falsePositives: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = false AND ${chargeOutcomes.outcome} = 'blocked' THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(chargeOutcomes)
    .where(eq(chargeOutcomes.participantId, participantId))

  const [moduleAgg] = await db
    .select({
      quizPoints: sql<number>`COALESCE(SUM(${moduleProgress.score}), 0)::int`,
      modulesComplete: sql<number>`COUNT(*)::int`,
    })
    .from(moduleProgress)
    .where(
      and(
        eq(moduleProgress.participantId, participantId),
        eq(moduleProgress.status, 'completed'),
      ),
    )

  const fraudBlockedBonus = (chargeAgg?.fraudBlocked ?? 0) * 500
  const fraudLossAmount = chargeAgg?.fraudLosses ?? 0
  const falsePositivePenalty = (chargeAgg?.falsePositives ?? 0) * 2000

  const virtualBalance =
    startingBalance +
    fraudBlockedBonus -
    fraudLossAmount -
    falsePositivePenalty +
    (moduleAgg?.quizPoints ?? 0)

  const existingScore = await db
    .select({ id: scores.id })
    .from(scores)
    .where(eq(scores.participantId, participantId))
    .limit(1)

  if (existingScore.length > 0) {
    await db
      .update(scores)
      .set({
        virtualBalance,
        fraudBlocked: chargeAgg?.fraudBlocked ?? 0,
        fraudLosses: fraudLossAmount,
        falsePositives: chargeAgg?.falsePositives ?? 0,
        modulesComplete: moduleAgg?.modulesComplete ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(scores.participantId, participantId))
  } else {
    await db.insert(scores).values({
      id: newId('sc'),
      participantId,
      eventId,
      virtualBalance,
      fraudBlocked: chargeAgg?.fraudBlocked ?? 0,
      fraudLosses: fraudLossAmount,
      falsePositives: chargeAgg?.falsePositives ?? 0,
      modulesComplete: moduleAgg?.modulesComplete ?? 0,
    })
  }

  // Update participants.score for backward-compat leaderboard
  await db
    .update(participants)
    .set({ score: virtualBalance })
    .where(eq(participants.id, participantId))
}

/**
 * Queue a new attack job for a participant. Returns the job ID or error.
 * Enforced unique constraint on (participantId, moduleId) prevents double-fire.
 */
export async function queueAttackJob(
  eventId: string,
  participantId: string,
  moduleId: string,
  chargesTotal = 15,
): Promise<{ jobId: string } | { error: string }> {
  try {
    const id = newId('aj')
    await db.insert(attackJobs).values({
      id,
      eventId,
      participantId,
      moduleId,
      chargesTotal,
    })
    return { jobId: id }
  } catch (err: unknown) {
    // Unique constraint violation means already queued/fired
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === '23505'
    ) {
      return { error: 'Attack already fired for this module.' }
    }
    throw err
  }
}
