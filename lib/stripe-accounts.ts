import 'server-only'

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { connectedAccounts } from '@/lib/db/schema'
import { newId } from '@/lib/id'

// Whimsical demo merchant names for the provisioned accounts.
const PREFIXES = [
  'Northwind',
  'Acme',
  'Lumen',
  'Bluewave',
  'Cobalt',
  'Maple',
  'Summit',
  'Harbor',
  'Vertex',
  'Orbit',
  'Pioneer',
  'Cedar',
  'Granite',
  'Beacon',
  'Tidal',
  'Aurora',
  'Copper',
  'Ironclad',
  'Sterling',
  'Kestrel',
]
const SUFFIXES = [
  'Coffee',
  'Goods',
  'Supply Co.',
  'Studios',
  'Labs',
  'Market',
  'Outfitters',
  'Apparel',
  'Bakery',
  'Hardware',
  'Records',
  'Provisions',
  'Bikes',
  'Botanicals',
  'Ceramics',
]

export function businessNameForSlot(slot: number): string {
  const prefix = PREFIXES[(slot - 1) % PREFIXES.length]
  const suffix = SUFFIXES[(slot - 1) % SUFFIXES.length]
  return `${prefix} ${suffix}`
}

// Build a Stripe Dashboard deep link that opens the connected account.
// When logged into the platform account, this switches into the connected
// account's dashboard ("log in as admin"). Test-mode keys link to /test.
export function dashboardUrlForAccount(stripeAccountId: string): string {
  const isTest = (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test')
  const base = `https://dashboard.stripe.com/${stripeAccountId}`
  return isTest ? `${base}/test` : base
}

// Provision a single Stripe Connect account (Accounts v2 controller model).
async function createOneAccount(businessName: string): Promise<string> {
  // Full dashboard access requires the connected account to pay Stripe fees
  // and Stripe to bear loss liability. This gives each workshop account a
  // standalone Stripe dashboard the instructor can demo against.
  const account = await stripe.accounts.create({
    controller: {
      losses: { payments: 'stripe' },
      fees: { payer: 'account' },
      stripe_dashboard: { type: 'full' },
      requirement_collection: 'stripe',
    },
    country: 'US',
    business_profile: { name: businessName },
    metadata: { source: 'radar-workshop' },
  })
  return account.id
}

// Provision `count` accounts for an event (slots 1..count).
export async function provisionAccountsForEvent(
  eventId: string,
  count: number,
): Promise<{ created: number; failed: number }> {
  const slots = Array.from({ length: count }, (_, i) => i + 1)
  return provisionSlotsForEvent(eventId, slots)
}

// Provision accounts for a specific set of slot numbers, persisting each to
// the database. Runs with limited concurrency and records failures rather than
// throwing, so a partial outage doesn't block event creation.
export async function provisionSlotsForEvent(
  eventId: string,
  slots: number[],
): Promise<{ created: number; failed: number }> {
  const CONCURRENCY = 4
  let created = 0
  let failed = 0

  for (let i = 0; i < slots.length; i += CONCURRENCY) {
    const batch = slots.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (slot) => {
        const businessName = businessNameForSlot(slot)
        try {
          const stripeAccountId = await createOneAccount(businessName)
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
          console.log(
            `[v0] Failed to provision Connect account for slot ${slot}:`,
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
  }

  return { created, failed }
}
