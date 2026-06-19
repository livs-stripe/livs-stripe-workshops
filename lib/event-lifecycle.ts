import 'server-only'

import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'

/**
 * Ends any events whose session window has passed. Idempotent for rows
 * already ended (endedAt preserved once set).
 */
export async function autoEndExpiredEvents() {
  if (!process.env.DATABASE_URL) return
  try {
    await db
      .update(events)
      .set({
        status: 'ended',
        endedAt: sql`COALESCE(${events.endedAt}, NOW())`,
      })
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
  } catch (err) {
    console.error('[autoEndExpiredEvents] DB error:', err instanceof Error ? err.message : err)
  }
}
