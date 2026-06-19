import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  chargeOutcomes,
  scores,
  participants,
  events,
  moduleProgress,
} from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { newId } from '@/lib/id'

/**
 * Recalculates score for a participant from charge_outcomes + module_progress.
 * Called internally by the attack job processor after a job completes.
 *
 * Score formula:
 *   virtualBalance = startingBalance
 *     + (fraud charges blocked × $5 bonus)
 *     - (fraud charges that succeeded × charge amount)
 *     - (false positives × $20 penalty)
 *     + (sum of module_progress quiz points)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ participantId: string }> },
) {
  const { participantId } = await params

  const [participant] = await db
    .select({
      id: participants.id,
      eventId: participants.eventId,
    })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)

  if (!participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
  }

  const [event] = await db
    .select({ startingBalanceCents: events.startingBalanceCents })
    .from(events)
    .where(eq(events.id, participant.eventId))
    .limit(1)

  const startingBalance = event?.startingBalanceCents ?? 100000

  // Aggregate charge outcomes
  const [chargeAgg] = await db
    .select({
      fraudBlocked: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = true AND ${chargeOutcomes.outcome} = 'blocked' THEN 1 ELSE 0 END), 0)::int`,
      fraudLosses: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = true AND ${chargeOutcomes.outcome} = 'succeeded' THEN ${chargeOutcomes.amount} ELSE 0 END), 0)::int`,
      falsePositives: sql<number>`COALESCE(SUM(CASE WHEN ${chargeOutcomes.isFraudAttempt} = false AND ${chargeOutcomes.outcome} = 'blocked' THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(chargeOutcomes)
    .where(eq(chargeOutcomes.participantId, participantId))

  // Sum module quiz points
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

  const fraudBlockedBonus = (chargeAgg?.fraudBlocked ?? 0) * 500 // $5 per block in cents
  const fraudLossAmount = chargeAgg?.fraudLosses ?? 0
  const falsePositivePenalty = (chargeAgg?.falsePositives ?? 0) * 2000 // $20 per FP in cents

  const virtualBalance =
    startingBalance +
    fraudBlockedBonus -
    fraudLossAmount -
    falsePositivePenalty +
    (moduleAgg?.quizPoints ?? 0)

  // Upsert into scores table
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
      eventId: participant.eventId,
      virtualBalance,
      fraudBlocked: chargeAgg?.fraudBlocked ?? 0,
      fraudLosses: fraudLossAmount,
      falsePositives: chargeAgg?.falsePositives ?? 0,
      modulesComplete: moduleAgg?.modulesComplete ?? 0,
    })
  }

  // Also update the participants.score for backward compat with existing leaderboard
  await db
    .update(participants)
    .set({ score: virtualBalance })
    .where(eq(participants.id, participantId))

  return NextResponse.json({
    participantId,
    virtualBalance,
    fraudBlocked: chargeAgg?.fraudBlocked ?? 0,
    fraudLosses: fraudLossAmount,
    falsePositives: chargeAgg?.falsePositives ?? 0,
    modulesComplete: moduleAgg?.modulesComplete ?? 0,
  })
}
