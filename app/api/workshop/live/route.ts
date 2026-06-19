import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { participants, attackWaves, events } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { autoEndExpiredEvents } from '@/lib/event-lifecycle'
import { getSessionEndsAt } from '@/lib/event-retention'

// Live roster, waves, and session clock for the participant's current event.
export async function GET() {
  await autoEndExpiredEvents()
  const jar = await cookies()
  const id = jar.get('participant_id')?.value
  if (!id) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const [me] = await db
    .select({ eventId: participants.eventId })
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1)
  if (!me) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const [evt] = await db
    .select()
    .from(events)
    .where(eq(events.id, me.eventId))
    .limit(1)
  if (!evt) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const roster = await db
    .select({
      id: participants.id,
      name: participants.name,
      company: participants.company,
      score: participants.score,
      currentModule: participants.currentModule,
    })
    .from(participants)
    .where(eq(participants.eventId, me.eventId))
    .orderBy(desc(participants.score), participants.joinedAt)

  const waves = await db
    .select()
    .from(attackWaves)
    .where(and(eq(attackWaves.eventId, me.eventId), eq(attackWaves.active, true)))
    .orderBy(desc(attackWaves.firedAt))
    .limit(5)

  const sessionEndsAt = getSessionEndsAt(evt)

  return NextResponse.json({
    roster,
    waves,
    meId: id,
    event: {
      id: evt.id,
      name: evt.name,
      status: evt.status,
      eventType: evt.eventType,
      sessionEndsAt: sessionEndsAt.toISOString(),
      createdAt: evt.createdAt.toISOString(),
      durationMinutes: evt.durationMinutes,
    },
  })
}
