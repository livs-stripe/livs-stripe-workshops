import 'server-only'

import Stripe from 'stripe'
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
// Sequential provisioning with proper error handling and rate limit awareness
// ---------------------------------------------------------------------------

const PROVISION_DELAY_MS = 250

function extractStripeError(err: unknown): { message: string; code: string; type: string; requestId: string } {
  if (err instanceof Stripe.errors.StripeError) {
    return {
      message: err.message,
      code: err.code ?? 'unknown',
      type: err.type,
      requestId: (err as { requestId?: string }).requestId ?? '',
    }
  }
  if (err instanceof Error) {
    return { message: err.message, code: 'unknown', type: 'unknown', requestId: '' }
  }
  return { message: String(err), code: 'unknown', type: 'unknown', requestId: '' }
}

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
 * Sequential creation with 250ms delay to respect Stripe test mode rate limits.
 */
export async function provisionAccountPool(
  eventId: string,
  count: number,
): Promise<{ created: number; failed: number }> {
  let created = 0
  let failed = 0

  for (let i = 0; i < count; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, PROVISION_DELAY_MS))

    const businessName = businessNameForSlot(i + 1)
    const idemKey = idempotencyKey(eventId, 'pool', String(i))

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
      const stripeErr = extractStripeError(err)
      console.error('[provision] Failed pool account:', {
        accountIndex: i,
        eventId,
        error: stripeErr.message,
        errorCode: stripeErr.code,
        errorType: stripeErr.type,
        stripeRequestId: stripeErr.requestId,
      })

      // On rate limit, wait and retry this index once
      if (err instanceof Stripe.errors.StripeRateLimitError) {
        const retryAfter = 2000
        console.warn(`[provision] Rate limited on account ${i} of ${count} — waiting ${retryAfter}ms`)
        await new Promise((r) => setTimeout(r, retryAfter))
        // Retry once
        try {
          const retryKey = idempotencyKey(eventId, 'pool-retry', String(i))
          const stripeAccountId = await createOneAccount(businessName, retryKey)
          await db.insert(accountPool).values({
            id: newId('ap'),
            eventId,
            stripeAccountId,
            status: 'available',
          })
          created++
          continue
        } catch (retryErr) {
          const retryStripeErr = extractStripeError(retryErr)
          console.error('[provision] Retry also failed:', retryStripeErr.message)
        }
      }

      // Record the failure with actual error details
      await db.insert(accountPool).values({
        id: newId('ap'),
        eventId,
        stripeAccountId: '',
        status: 'failed',
        errorMessage: stripeErr.message,
        errorCode: stripeErr.code,
      })
      failed++
    }
  }

  return { created, failed }
}

/**
 * Retry only failed accounts in the pool for an event.
 */
export async function retryFailedPoolAccounts(
  eventId: string,
): Promise<{ created: number; failed: number }> {
  const failedRows = await db
    .select({ id: accountPool.id })
    .from(accountPool)
    .where(and(eq(accountPool.eventId, eventId), eq(accountPool.status, 'failed')))

  if (failedRows.length === 0) return { created: 0, failed: 0 }

  let created = 0
  let failed = 0

  for (let i = 0; i < failedRows.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, PROVISION_DELAY_MS))

    const row = failedRows[i]
    const businessName = businessNameForSlot(i + 1)
    const idemKey = idempotencyKey(eventId, 'retry', row.id)

    try {
      const stripeAccountId = await createOneAccount(businessName, idemKey)
      await db
        .update(accountPool)
        .set({ stripeAccountId, status: 'available', errorMessage: null, errorCode: null })
        .where(eq(accountPool.id, row.id))
      created++
    } catch (err) {
      const stripeErr = extractStripeError(err)
      console.error('[provision] Retry failed:', {
        poolId: row.id,
        error: stripeErr.message,
        errorCode: stripeErr.code,
      })
      await db
        .update(accountPool)
        .set({ errorMessage: stripeErr.message, errorCode: stripeErr.code })
        .where(eq(accountPool.id, row.id))
      failed++
    }
  }

  return { created, failed }
}

/**
 * Claim the next available account from the pool for a participant.
 * Uses an atomic UPDATE ... RETURNING to prevent race conditions.
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
    const stripeErr = extractStripeError(err)
    console.error('[provision] On-demand failed:', {
      eventId,
      error: stripeErr.message,
      errorCode: stripeErr.code,
    })
    return null
  }
}

/**
 * Get provisioning progress for an event (for SA progress bar).
 */
export async function getProvisioningStatus(eventId: string) {
  const rows = await db
    .select({ status: accountPool.status, errorMessage: accountPool.errorMessage, errorCode: accountPool.errorCode })
    .from(accountPool)
    .where(eq(accountPool.eventId, eventId))

  const available = rows.filter((r) => r.status === 'available').length
  const assigned = rows.filter((r) => r.status === 'assigned').length
  const failedRows = rows.filter((r) => r.status === 'failed')
  return {
    total: rows.length,
    available,
    assigned,
    ready: available + assigned,
    failed: failedRows.length,
    errors: failedRows.map((r) => ({ message: r.errorMessage, code: r.errorCode })),
  }
}

// ---------------------------------------------------------------------------
// Account deletion — clean up connected accounts when event ends
// ---------------------------------------------------------------------------

/**
 * Delete all connected accounts for an event from Stripe and mark them terminated.
 */
export async function deleteEventAccounts(eventId: string): Promise<{ deleted: number; errors: number }> {
  const rows = await db
    .select({ id: accountPool.id, stripeAccountId: accountPool.stripeAccountId })
    .from(accountPool)
    .where(
      and(
        eq(accountPool.eventId, eventId),
        sql`${accountPool.status} != 'terminated'`,
        sql`${accountPool.stripeAccountId} != ''`,
      ),
    )

  let deleted = 0
  let errors = 0

  for (const row of rows) {
    try {
      await stripeWithRetry(
        () => stripe.accounts.del(row.stripeAccountId),
        { context: `delete:${row.stripeAccountId}` },
      )
      await db
        .update(accountPool)
        .set({ status: 'terminated', terminatedAt: new Date() })
        .where(eq(accountPool.id, row.id))
      deleted++
    } catch (err) {
      const stripeErr = extractStripeError(err)
      console.error('[cleanup] Failed to delete account:', {
        accountId: row.stripeAccountId,
        error: stripeErr.message,
      })
      await db
        .update(accountPool)
        .set({ errorMessage: `Deletion failed: ${stripeErr.message}`, errorCode: stripeErr.code })
        .where(eq(accountPool.id, row.id))
      errors++
    }

    await new Promise((r) => setTimeout(r, 100))
  }

  // Also handle legacy connected_accounts table
  const legacyRows = await db
    .select({ id: connectedAccounts.id, stripeAccountId: connectedAccounts.stripeAccountId })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.eventId, eventId),
        eq(connectedAccounts.status, 'active'),
        sql`${connectedAccounts.stripeAccountId} != ''`,
      ),
    )

  for (const row of legacyRows) {
    try {
      await stripeWithRetry(
        () => stripe.accounts.del(row.stripeAccountId),
        { context: `delete-legacy:${row.stripeAccountId}` },
      )
      await db
        .update(connectedAccounts)
        .set({ status: 'terminated' })
        .where(eq(connectedAccounts.id, row.id))
      deleted++
    } catch (err) {
      const stripeErr = extractStripeError(err)
      console.error('[cleanup] Failed to delete legacy account:', {
        accountId: row.stripeAccountId,
        error: stripeErr.message,
      })
      errors++
    }
    await new Promise((r) => setTimeout(r, 100))
  }

  return { deleted, errors }
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

  for (let i = 0; i < slots.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, PROVISION_DELAY_MS))

    const slot = slots[i]
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
      const stripeErr = extractStripeError(err)
      console.error('[provision] Failed slot:', {
        slot,
        eventId,
        error: stripeErr.message,
        errorCode: stripeErr.code,
        errorType: stripeErr.type,
        stripeRequestId: stripeErr.requestId,
      })

      // On rate limit, wait and retry once
      if (err instanceof Stripe.errors.StripeRateLimitError) {
        await new Promise((r) => setTimeout(r, 2000))
        try {
          const retryKey = idempotencyKey(eventId, 'slot-retry', String(slot))
          const stripeAccountId = await createOneAccount(businessName, retryKey)
          await db.insert(connectedAccounts).values({
            id: newId('ca'),
            eventId,
            stripeAccountId,
            businessName,
            slotNumber: slot,
            status: 'active',
          })
          created++
          continue
        } catch {
          // Fall through to failure recording
        }
      }

      await db.insert(connectedAccounts).values({
        id: newId('ca'),
        eventId,
        stripeAccountId: '',
        businessName,
        slotNumber: slot,
        status: 'failed',
        errorMessage: stripeErr.message,
        errorCode: stripeErr.code,
      })
      failed++
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
