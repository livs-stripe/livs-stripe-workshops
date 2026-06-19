import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { deleteEventAccounts } from '@/lib/stripe-accounts'

export const maxDuration = 60

export async function GET() {
  try {
    // Find active events that have expired (timer ran out without manual end)
    const expired = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.status, 'active'),
          sql`(
            (${events.sessionEndsAt} IS NOT NULL AND ${events.sessionEndsAt} < NOW())
            OR
            (${events.sessionEndsAt} IS NULL AND ${events.createdAt} + (${events.durationMinutes} * interval '1 minute') < NOW())
          )`,
        ),
      )

    let cleaned = 0
    for (const ev of expired) {
      // End the event
      await db
        .update(events)
        .set({
          status: 'ended',
          endedAt: sql`COALESCE(${events.endedAt}, NOW())`,
        })
        .where(eq(events.id, ev.id))

      // Delete connected accounts
      const result = await deleteEventAccounts(ev.id)
      console.log(`[cleanup-cron] Event ${ev.id}: deleted ${result.deleted} accounts, ${result.errors} errors`)
      cleaned++
    }

    return NextResponse.json({ cleaned, events: expired.map((e) => e.id) })
  } catch (err) {
    console.error('[cleanup-cron] Error:', err)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
