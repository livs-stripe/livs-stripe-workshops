import 'server-only'

import { stripe, stripeWithRetry, idempotencyKey } from '@/lib/stripe'
import { db } from '@/lib/db'
import { connectedAccounts, accountPool } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { newId } from '@/lib/id'

const PREFIXES = [
  'Northwind', 'Acme', 'Lumen', 'Bluewave', 'Cobalt',
  'Maple', 'Summit', 'Harbor', 'Vertex', 'Orbit',
  'Pioneer', 'Cedar', 'Granite', 'Beacon', 'Tidal',
  'Aurora', 'Copper', 'Ironclad', 'Sterling', 'Kestrel',
]
const SUFFIXES = [
  'Coffee', 'Goods', 'Supply Co.', 'Studios', 'Labs',
  'Market', 'Outfitters', 'Apparel', 'Bakery', 'Hardware',
  'Records', 'Provisions', 'Bikes', 'Botanicals', 'Ceramics',
]

export function businessNameForSlot(slot: number): string {
  const prefix = PREFIXES[(slot - 1) % PREFIXES.length]
  const suffix = SUFFIXES[(slot - 1) % SUFFIXES.length]
  return `${prefix} ${suffix}`
}

export function dashboardUrlForAccount(stripeAccountId: string): string {
  const isTest = (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test')
  const base = `https://dashboard.stripe.com/${stripeAccountId}`
  return isTest ? `${base}/test` : base
}

// ---------------------------------------------------------------------------
// Account provisioning — batched with rate-limit awareness
// ---------------------------------------------------------------------------

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 200

async function createOneAccount(
  businessName: string,
  idemKey: string,
): Promise<string> {
  const account = await stripeWithRetry(
    () =>
      stripe.accounts.create(
        {
          controller: {
            losses: { payments: 'stripe' },
            fees: { payer: 'account' },
            stripe_dashboard: { type: 'full' },
            requirement_collection: 'stripe',
          },
          country: 'US',
          business_profile: { name: businessName },
          metadata: { source: 'radar-workshop' },
        },
        { idempotencyKey: idemKey },
      ),
    { context: `provision:${idemKey}` },
  )
  return account.id
}

/**
 * Pre-provision accounts into the account_pool for an event.
 * Called asynchronously when SA starts an event. Processes in batches of 5
 * with 200ms delay between batches to stay under Stripe rate limits.
 */
export async function provisionAccountPool(
  eventId: string,
  count: number,
): Promise<{ created: number; failed: number }> {
  let created = 0
  let failed = 0

  for (let batchStart = 0; batchStart < count; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, count)
    const batch = Array.from(
      { length: batchEnd - batchStart },
      (_, i) => batchStart + i,
    )

    await Promise.all(
      batch.map(async (index) => {
        const businessName = businessNameForSlot(index + 1)
        const idemKey = idempotencyKey(eventId, 'pool', String(index))
        try {
          const stripeAccountId = await createOneAccount(businessName, idemKey)
          await db.insert(accountPool).values({
            id: newId('ap'),
            eventId,
            stripeAccountId,
            status: 'available',
          })
          created++
        } catch (err) {
          console.error(
            `[provision] Failed pool account index=${index} event=${eventId}:`,
            err instanceof Error ? err.message : err,
          )
          failed++
        }
      }),
    )

    if (batchEnd < count) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return { created, failed }
}

/**
 * Claim the next available account from the pool for a participant.
 * Uses an atomic UPDATE ... RETURNING to prevent race conditions.
 * Returns the Stripe account ID or null if pool is exhausted.
 */
export async function claimPoolAccount(
  eventId: string,
  participantId: string,
): Promise<string | null> {
  const result = await db
    .update(accountPool)
    .set({ status: 'assigned' })
    .where(
      and(
        eq(accountPool.eventId, eventId),
        eq(accountPool.status, 'available'),
        sql`${accountPool.id} = (
          SELECT ${accountPool.id} FROM account_pool
          WHERE ${accountPool.eventId} = ${eventId}
          AND ${accountPool.status} = 'available'
          ORDER BY ${accountPool.createdAt} ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )`,
      ),
    )
    .returning({ stripeAccountId: accountPool.stripeAccountId })

  return result[0]?.stripeAccountId ?? null
}

/**
 * On-demand account creation with retry logic. Used as fallback when pool
 * is exhausted. Creates account + inserts into pool as 'assigned'.
 */
export async function provisionOnDemand(
  eventId: string,
  participantEmail: string,
): Promise<string | null> {
  const emailHash = Buffer.from(participantEmail).toString('base64url').slice(0, 16)
  const idemKey = idempotencyKey(eventId, emailHash)
  const slotIndex = Date.now() % 300
  const businessName = businessNameForSlot(slotIndex + 1)

  try {
    const stripeAccountId = await createOneAccount(businessName, idemKey)
    await db.insert(accountPool).values({
      id: newId('ap'),
      eventId,
      stripeAccountId,
      status: 'assigned',
    })
    return stripeAccountId
  } catch (err) {
    console.error(
      `[provision] On-demand failed event=${eventId}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

/**
 * Get provisioning progress for an event (for SA progress bar).
 */
export async function getProvisioningStatus(eventId: string) {
  const rows = await db
    .select({ status: accountPool.status })
    .from(accountPool)
    .where(eq(accountPool.eventId, eventId))

  const available = rows.filter((r) => r.status === 'available').length
  const assigned = rows.filter((r) => r.status === 'assigned').length
  return {
    total: rows.length,
    available,
    assigned,
    ready: available + assigned,
  }
}

// ---------------------------------------------------------------------------
// Legacy provisioning — keeps connected_accounts table in sync for SA panel
// ---------------------------------------------------------------------------

export async function provisionAccountsForEvent(
  eventId: string,
  count: number,
): Promise<{ created: number; failed: number }> {
  const slots = Array.from({ length: count }, (_, i) => i + 1)
  return provisionSlotsForEvent(eventId, slots)
}

export async function provisionSlotsForEvent(
  eventId: string,
  slots: number[],
): Promise<{ created: number; failed: number }> {
  let created = 0
  let failed = 0

  for (let i = 0; i < slots.length; i += BATCH_SIZE) {
    const batch = slots.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (slot) => {
        const businessName = businessNameForSlot(slot)
        const idemKey = idempotencyKey(eventId, 'slot', String(slot))
        try {
          const stripeAccountId = await createOneAccount(businessName, idemKey)
          await db.insert(connectedAccounts).values({
            id: newId('ca'),
            eventId,
            stripeAccountId,
            businessName,
            slotNumber: slot,
            status: 'active',
          })
          created++
        } catch (err) {
          console.error(
            `[provision] Failed slot ${slot} event=${eventId}:`,
            err instanceof Error ? err.message : err,
          )
          await db.insert(connectedAccounts).values({
            id: newId('ca'),
            eventId,
            stripeAccountId: '',
            businessName,
            slotNumber: slot,
            status: 'failed',
          })
          failed++
        }
      }),
    )
    if (i + BATCH_SIZE < slots.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return { created, failed }
}

/**
 * Generate a login link for a connected account (on-demand, 5-min TTL).
 */
export async function createLoginLink(stripeAccountId: string): Promise<string> {
  const link = await stripeWithRetry(
    () => stripe.accounts.createLoginLink(stripeAccountId),
    { context: `login-link:${stripeAccountId}` },
  )
  return link.url
}
