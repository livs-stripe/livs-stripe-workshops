import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { participants, chargeOutcomes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getStripe, stripeWithRetry, idempotencyKey } from '@/lib/stripe'
import { newId } from '@/lib/id'

export const maxDuration = 30

type Intensity = 'low' | 'medium' | 'high'

interface DdosRequest {
  participantId: string
  eventId: string
  intensity: Intensity
}

const TEST_CARDS_STANDARD = [
  'pm_card_visa',
  'pm_card_mastercard',
  'pm_card_amex',
  'pm_card_visa_debit',
  'pm_card_mastercard_prepaid',
  'pm_card_discover',
  'pm_card_jcb',
  'pm_card_unionpay',
  'pm_card_visa_chargeDeclined',
  'pm_card_visa_chargeDeclinedInsufficientFunds',
]

const TEST_CARDS_FRAUD = [
  'pm_card_chargeDeclinedFraudulent',
]

const IPS_LOW = ['198.51.100.42']
const IPS_MEDIUM = ['198.51.100.42', '203.0.113.99']
const IPS_HIGH = ['198.51.100.1', '198.51.100.2', '198.51.100.3', '198.51.100.4', '198.51.100.5']

function getConfig(intensity: Intensity) {
  switch (intensity) {
    case 'low':
      return {
        totalCharges: 20,
        delayMs: 300,
        cards: TEST_CARDS_STANDARD.slice(0, 3),
        amountRange: [500, 1500] as const,
        ips: IPS_LOW,
        fraudCardRatio: 0,
        wave: 'ddos_low',
      }
    case 'medium':
      return {
        totalCharges: 50,
        delayMs: 150,
        cards: TEST_CARDS_STANDARD,
        amountRange: [100, 5000] as const,
        ips: IPS_MEDIUM,
        fraudCardRatio: 0,
        wave: 'ddos_medium',
      }
    case 'high':
      return {
        totalCharges: 100,
        delayMs: 80,
        cards: [...TEST_CARDS_STANDARD, ...TEST_CARDS_STANDARD],
        amountRange: [50, 20000] as const,
        ips: IPS_HIGH,
        fraudCardRatio: 0.6,
        wave: 'ddos_high',
      }
  }
}

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

type ChargeResult = {
  index: number
  chargeId: string | null
  amount: number
  outcome: 'blocked' | 'succeeded'
  sourceIp: string
}

export async function POST(req: Request) {
  const jar = await cookies()
  const body = (await req.json()) as DdosRequest
  const { participantId, eventId, intensity } = body

  if (!participantId || !eventId || !['low', 'medium', 'high'].includes(intensity)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Verify caller is either the participant or an SA
  const callerId = jar.get('participant_id')?.value
  const instructorCookie = jar.get('instructor_session')?.value
  if (callerId !== participantId && !instructorCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [p] = await db
    .select({ stripeAccountId: participants.stripeAccountId })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)

  if (!p?.stripeAccountId) {
    return NextResponse.json({ error: 'No Stripe account assigned' }, { status: 404 })
  }

  const config = getConfig(intensity)
  const waveId = newId('ddos')
  const stripe = getStripe()
  const startTime = Date.now()

  const results: ChargeResult[] = []
  let inFlight = 0
  const MAX_CONCURRENT = 5

  async function fireCharge(index: number): Promise<ChargeResult> {
    const ip = config.ips[index % config.ips.length]
    const useFraudCard = config.fraudCardRatio > 0 && Math.random() < config.fraudCardRatio
    const card = useFraudCard
      ? TEST_CARDS_FRAUD[0]
      : config.cards[index % config.cards.length]
    const amount = randomAmount(config.amountRange[0], config.amountRange[1])

    const idemKey = idempotencyKey('ddos', participantId, waveId, String(index))

    try {
      const pi = await stripeWithRetry(
        () =>
          stripe.paymentIntents.create(
            {
              amount,
              currency: 'aud',
              payment_method: card,
              confirm: true,
              automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
              metadata: {
                source_ip: ip,
                fraud_type: 'payment_ddos',
                wave: config.wave,
                charge_index: String(index),
              },
            },
            {
              idempotencyKey: idemKey,
              stripeAccount: p.stripeAccountId!,
            },
          ),
        { maxRetries: 3, context: `ddos:${index}/${config.totalCharges}` },
      )

      const outcome = pi.status === 'succeeded' ? 'succeeded' : 'blocked'
      return { index, chargeId: pi.id, amount, outcome, sourceIp: ip }
    } catch (err: unknown) {
      const isDecline =
        err instanceof Error &&
        ('code' in err || err.message.includes('declined') || err.message.includes('blocked'))
      return {
        index,
        chargeId: null,
        amount,
        outcome: isDecline ? 'blocked' : 'blocked',
        sourceIp: ip,
      }
    }
  }

  // Controlled concurrency: max 5 in-flight, with delay between launches
  const queue = Array.from({ length: config.totalCharges }, (_, i) => i)

  async function worker() {
    while (queue.length > 0) {
      const idx = queue.shift()
      if (idx === undefined) break
      if (idx > 0) await sleep(config.delayMs)
      const result = await fireCharge(idx)
      results.push(result)

      // Record outcome immediately
      try {
        await db.insert(chargeOutcomes).values({
          id: newId('co'),
          eventId,
          participantId,
          moduleId: 'ddos-simulation',
          chargeId: result.chargeId,
          amount: result.amount,
          outcome: result.outcome,
          isFraudAttempt: true,
        })
      } catch {
        // Non-critical — don't abort simulation for DB write failures
      }
    }
  }

  const workers = Array.from({ length: MAX_CONCURRENT }, () => worker())
  await Promise.all(workers)

  const durationMs = Date.now() - startTime
  const totalBlocked = results.filter((r) => r.outcome === 'blocked').length
  const totalSucceeded = results.filter((r) => r.outcome === 'succeeded').length
  const totalAmountLost = results
    .filter((r) => r.outcome === 'succeeded')
    .reduce((sum, r) => sum + r.amount, 0)

  return NextResponse.json({
    waveId,
    total_fired: results.length,
    total_blocked: totalBlocked,
    total_succeeded: totalSucceeded,
    total_amount_lost: totalAmountLost,
    duration_ms: durationMs,
    block_rate: results.length > 0 ? Math.round((totalBlocked / results.length) * 100) : 0,
    charges: results.map((r) => ({
      index: r.index,
      amount: r.amount,
      outcome: r.outcome,
      sourceIp: r.sourceIp,
    })),
  })
}
