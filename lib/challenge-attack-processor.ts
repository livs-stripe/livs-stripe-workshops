import 'server-only'

import { db } from '@/lib/db'
import { participants, moduleAttackQueue, chargeOutcomes } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getStripe, idempotencyKey } from '@/lib/stripe'
import { newId } from '@/lib/id'
import { CHALLENGE_MODULES, type ChargeConfig } from '@/lib/challenge-modules'

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Process a single module attack from the queue.
 * Fires charges against the participant's connected Stripe account
 * and deducts losses from their balance.
 */
export async function processChallengeAttack(attackId: string) {
  const [attack] = await db
    .select()
    .from(moduleAttackQueue)
    .where(eq(moduleAttackQueue.id, attackId))
    .limit(1)

  if (!attack || attack.status !== 'pending') return

  // Mark as running
  await db
    .update(moduleAttackQueue)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(moduleAttackQueue.id, attackId))

  const [participant] = await db
    .select({
      stripeAccountId: participants.stripeAccountId,
      currentBalance: participants.currentBalance,
    })
    .from(participants)
    .where(eq(participants.id, attack.participantId))
    .limit(1)

  if (!participant?.stripeAccountId) {
    await db
      .update(moduleAttackQueue)
      .set({ status: 'failed', completedAt: new Date() })
      .where(eq(moduleAttackQueue.id, attackId))
    return
  }

  const mod = CHALLENGE_MODULES.find((m) => m.number === attack.moduleNumber)
  if (!mod) {
    await db
      .update(moduleAttackQueue)
      .set({ status: 'failed', completedAt: new Date() })
      .where(eq(moduleAttackQueue.id, attackId))
    return
  }

  const stripe = getStripe()
  let chargesFired = 0
  let chargesBlocked = 0
  let chargesSucceeded = 0
  let amountLostCents = 0

  // Build charge list from config
  const charges: { amount: number; metadata: Record<string, string>; testCard: string }[] = []
  for (const config of mod.chargeConfig) {
    for (let i = 0; i < config.count; i++) {
      charges.push({
        amount: randomBetween(config.amountMinCents, config.amountMaxCents),
        metadata: { ...config.metadata, module: String(mod.number), charge_index: String(charges.length) },
        testCard: config.testCard ?? 'pm_card_visa',
      })
    }
  }

  // Shuffle charges for realistic attack pattern
  for (let i = charges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [charges[i], charges[j]] = [charges[j], charges[i]]
  }

  // Fire charges sequentially with small delays
  for (const charge of charges) {
    const idemKey = idempotencyKey(attack.id, String(chargesFired))
    const isFraud = charge.metadata.fraud_type !== 'legitimate'

    try {
      const result = await stripe.charges.create(
        {
          amount: charge.amount,
          currency: 'aud',
          source: charge.testCard,
          metadata: charge.metadata,
          description: `Challenge M${mod.number}: ${charge.metadata.fraud_type}`,
        },
        {
          stripeAccount: participant.stripeAccountId,
          idempotencyKey: idemKey,
        },
      )

      chargesFired++

      if (result.status === 'succeeded') {
        chargesSucceeded++
        if (isFraud) {
          amountLostCents += charge.amount
        }
      } else {
        chargesBlocked++
      }

      // Record outcome
      await db.insert(chargeOutcomes).values({
        id: newId('co'),
        participantId: attack.participantId,
        eventId: attack.eventId,
        chargeId: result.id,
        amount: charge.amount,
        blocked: result.status !== 'succeeded',
        metadata: JSON.stringify(charge.metadata),
      })
    } catch {
      // Charge was declined/blocked by Radar
      chargesFired++
      chargesBlocked++

      await db.insert(chargeOutcomes).values({
        id: newId('co'),
        participantId: attack.participantId,
        eventId: attack.eventId,
        chargeId: `declined_${idemKey}`,
        amount: charge.amount,
        blocked: true,
        metadata: JSON.stringify(charge.metadata),
      })
    }

    await sleep(150)
  }

  // Calculate bonus for boss round
  let bonusAmount = 0
  if (mod.bonusCents && mod.bonusThreshold) {
    const fraudCharges = charges.filter((c) => c.metadata.fraud_type !== 'legitimate').length
    const fraudBlockRate = fraudCharges > 0 ? chargesBlocked / fraudCharges : 0
    if (fraudBlockRate >= mod.bonusThreshold) {
      bonusAmount = mod.bonusCents
    }
  }

  // Update attack queue record
  await db
    .update(moduleAttackQueue)
    .set({
      status: 'complete',
      completedAt: new Date(),
      chargesFired,
      chargesBlocked,
      chargesSucceeded,
      amountLostCents,
    })
    .where(eq(moduleAttackQueue.id, attackId))

  // Deduct losses from participant balance (and add bonus if earned)
  await db
    .update(participants)
    .set({
      currentBalance: sql`${participants.currentBalance} - ${amountLostCents} + ${bonusAmount}`,
      totalLostAmount: sql`${participants.totalLostAmount} + ${amountLostCents}`,
      totalBlockedAmount: sql`${participants.totalBlockedAmount} + ${chargesBlocked}`,
    })
    .where(eq(participants.id, attack.participantId))
}

/**
 * Process all pending challenge attacks in the queue.
 */
export async function processChallengeAttackQueue() {
  const pending = await db
    .select({ id: moduleAttackQueue.id })
    .from(moduleAttackQueue)
    .where(eq(moduleAttackQueue.status, 'pending'))
    .limit(5)

  for (const attack of pending) {
    await processChallengeAttack(attack.id)
  }

  return { processed: pending.length }
}
