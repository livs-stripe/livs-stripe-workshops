'use server'

import { db } from '@/lib/db'
import { events, participants, attackWaves, moduleProgress, accountPool, connectedAccounts } from '@/lib/db/schema'
import { and, desc, eq, gte, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { newId, newAccessCode } from '@/lib/id'
import { getAttackWaveType } from '@/lib/workshop-content'
import { requireInstructor } from '@/lib/instructor-auth'
import { isAvailableTheme } from '@/lib/themes'
import { autoEndExpiredEvents } from '@/lib/event-lifecycle'
import {
  getSessionEndsAt,
  isParticipantDataExpired,
} from '@/lib/event-retention'
import {
  provisionAccountsForEvent,
  provisionSlotsForEvent,
  provisionAccountPool,
  provisionAdditionalAccounts,
  dashboardUrlForAccount,
  deleteEventAccounts,
  retryFailedPoolAccounts,
} from '@/lib/stripe-accounts'

async function getUserId() {
  return requireInstructor()
}

const THIRTY_DAYS_AGO = () =>
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

export async function getEvents() {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  const cutoff = THIRTY_DAYS_AGO()
  try {
    const rows = await db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        accessCode: events.accessCode,
        status: events.status,
        eventType: events.eventType,
        eventTheme: events.eventTheme,
        customerName: events.customerName,
        createdAt: events.createdAt,
        endedAt: events.endedAt,
        sessionEndsAt: events.sessionEndsAt,
        durationMinutes: events.durationMinutes,
        participantCount: sql<number>`count(${participants.id})::int`,
      })
      .from(events)
      .leftJoin(participants, eq(participants.eventId, events.id))
      .where(
        and(
          eq(events.saUserId, userId),
          or(
            eq(events.status, 'active'),
            and(
              eq(events.status, 'ended'),
              gte(sql`COALESCE(${events.endedAt}, ${events.createdAt})`, cutoff),
            ),
          ),
        ),
      )
      .groupBy(events.id)
      .orderBy(desc(events.createdAt))
    return rows
  } catch (err) {
    console.error('[getEvents] Query failed — schema may need migration:', err instanceof Error ? err.message : err)
    return []
  }
}

/** Active sessions and lifetime event count for the SA dashboard header. */
export async function getDashboardCounts() {
  await autoEndExpiredEvents()
  try {
    const userId = await getUserId()
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(events)
      .where(eq(events.saUserId, userId))
    const [{ active }] = await db
      .select({ active: sql<number>`count(*)::int` })
      .from(events)
      .where(and(eq(events.saUserId, userId), eq(events.status, 'active')))
    return { totalEvents: total, activeEvents: active }
  } catch (err) {
    console.error('[getDashboardCounts] Query failed:', err instanceof Error ? err.message : err)
    return { totalEvents: 0, activeEvents: 0 }
  }
}

// Count events per theme for the current SA — powers the Themes reference page.
export async function getThemeCounts() {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  const rows = await db
    .select({
      eventTheme: events.eventTheme,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(eq(events.saUserId, userId))
    .groupBy(events.eventTheme)
  const map: Record<string, number> = {}
  for (const r of rows) map[r.eventTheme] = r.count
  return map
}

export async function createEvent(formData: FormData) {
  const userId = await getUserId()
  const eventType =
    String(formData.get('eventType') ?? '').trim() === 'workshop'
      ? 'workshop'
      : 'challenge'
  const eventTheme = String(formData.get('eventTheme') ?? '').trim()
  if (!isAvailableTheme(eventTheme)) {
    throw new Error('Please choose an available theme.')
  }
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const customerName = String(formData.get('customerName') ?? '').trim()
  const sfOpportunityId = String(formData.get('sfOpportunityId') ?? '').trim()
  const facilitatorNotes = String(formData.get('facilitatorNotes') ?? '').trim()
  const maxParticipants = Number(formData.get('maxParticipants'))
  const durationMinutes = Number(formData.get('durationMinutes'))
  if (!name) throw new Error('Name is required')
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 100) {
    throw new Error('Max participants must be a whole number between 1 and 100')
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 43200) {
    throw new Error('Duration must be between 5 minutes and 30 days')
  }

  // Challenge-only config. Falls back to sensible defaults for workshops.
  const balanceCurrency =
    String(formData.get('balanceCurrency') ?? 'AUD').trim() || 'AUD'
  const startingBalance = Number(formData.get('startingBalance'))
  const startingBalanceCents = Number.isFinite(startingBalance)
    ? Math.round(startingBalance * 100)
    : 100000
  const scoreIntervalSeconds = Number(formData.get('scoreIntervalSeconds')) || 20
  const leaderboardEnabled = formData.get('leaderboardEnabled') !== 'off'
  const projectorEnabled = formData.get('projectorEnabled') !== 'off'

  // Generate a unique access code (retry on the rare collision).
  let accessCode = newAccessCode()
  for (let i = 0; i < 5; i++) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.accessCode, accessCode))
      .limit(1)
    if (existing.length === 0) break
    accessCode = newAccessCode()
  }

  const id = newId('evt')
  const sessionEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000)
  await db.insert(events).values({
    id,
    name,
    description: description || null,
    accessCode,
    saUserId: userId,
    eventType,
    eventTheme,
    maxParticipants,
    durationMinutes,
    sessionEndsAt,
    customerName: customerName || null,
    customerEmail: sfOpportunityId || null,
    facilitatorNotes: facilitatorNotes || null,
    balanceCurrency,
    startingBalanceCents,
    scoreIntervalSeconds,
    leaderboardEnabled,
    projectorEnabled,
  })

  // Pre-provision Stripe Connect accounts:
  // 1. Legacy connected_accounts table (for SA dashboard panel)
  // 2. Account pool (for participant claiming on join)
  // Both run async — don't block event creation. Pool uses batches of 5
  // with 200ms delays to stay under Stripe rate limits for 50 accounts.
  provisionAccountsForEvent(id, maxParticipants).catch((err) =>
    console.error('[createEvent] connected_accounts provisioning error:', err),
  )
  provisionAccountPool(id, maxParticipants).catch((err) =>
    console.error('[createEvent] account pool provisioning error:', err),
  )

  revalidatePath('/sa')
  return { id, accessCode, eventType }
}

export async function getEventDetail(eventId: string) {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!event) return null

  const roster = await db
    .select()
    .from(participants)
    .where(eq(participants.eventId, eventId))
    .orderBy(desc(participants.score), participants.joinedAt)

  const waves = await db
    .select()
    .from(attackWaves)
    .where(eq(attackWaves.eventId, eventId))
    .orderBy(desc(attackWaves.firedAt))

  let accounts: {
    id: string
    stripeAccountId: string
    businessName: string
    slotNumber: number
    participantId: string | null
    status: string
    errorMessage: string | null
    errorCode: string | null
    dashboardUrl: string | null
  }[] = []

  try {
    const accountRows = await db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.eventId, eventId))
      .orderBy(connectedAccounts.slotNumber)

    accounts = accountRows.map((a) => ({
      id: a.id,
      stripeAccountId: a.stripeAccountId,
      businessName: a.businessName,
      slotNumber: a.slotNumber,
      participantId: a.participantId,
      status: a.status,
      errorMessage: a.errorMessage ?? null,
      errorCode: a.errorCode ?? null,
      dashboardUrl:
        a.status === 'active' && a.stripeAccountId
          ? dashboardUrlForAccount(a.stripeAccountId)
          : null,
    }))
  } catch (err) {
    console.error('[getEventDetail] Failed to fetch connected accounts:', err instanceof Error ? err.message : err)
  }

  const participantDataExpired = isParticipantDataExpired(event.endedAt)

  return { event, roster, waves, accounts, participantDataExpired }
}

export async function fireAttackWave(eventId: string, waveType: string) {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  // Verify ownership.
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!event) throw new Error('Event not found')

  const type = getAttackWaveType(waveType)
  if (!type) throw new Error('Unknown attack wave type')

  await db.insert(attackWaves).values({
    id: newId('wave'),
    eventId,
    waveType: type.id,
    intensity: 1,
    label: type.label,
    firedBy: userId,
  })
  revalidatePath(`/sa/events/${eventId}`)
}

export async function setEventStatus(eventId: string, status: 'active' | 'ended') {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  if (status === 'ended') {
    await db
      .update(events)
      .set({
        status: 'ended',
        endedAt: sql`COALESCE(${events.endedAt}, NOW())`,
      })
      .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))

    deleteEventAccounts(eventId).catch((err) =>
      console.error('[setEventStatus] Account cleanup error:', err),
    )
  } else {
    const [ev] = await db
      .select({ durationMinutes: events.durationMinutes })
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
      .limit(1)
    const mins = ev?.durationMinutes ?? 120
    const sessionEndsAt = new Date(Date.now() + mins * 60 * 1000)
    await db
      .update(events)
      .set({
        status: 'active',
        endedAt: null,
        sessionEndsAt,
      })
      .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
  }
  revalidatePath(`/sa/events/${eventId}`)
  revalidatePath('/sa')
}

export async function extendEventSession(eventId: string, extraMinutes = 30) {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  const [ev] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!ev || ev.status !== 'active') throw new Error('Session is not active')
  const base = getSessionEndsAt(ev)
  const next = new Date(
    Math.max(Date.now(), base.getTime()) + extraMinutes * 60 * 1000,
  )
  await db
    .update(events)
    .set({ sessionEndsAt: next })
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
  revalidatePath(`/sa/events/${eventId}`)
  revalidatePath('/sa')
}

export async function endEventNow(eventId: string) {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  await db
    .update(events)
    .set({
      status: 'ended',
      endedAt: sql`COALESCE(${events.endedAt}, NOW())`,
    })
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))

  // Clean up connected accounts asynchronously
  deleteEventAccounts(eventId).catch((err) =>
    console.error('[endEventNow] Account cleanup error:', err),
  )

  revalidatePath(`/sa/events/${eventId}`)
  revalidatePath('/sa')
}

export async function exportParticipantsCsv(eventId: string): Promise<string> {
  await autoEndExpiredEvents()
  const userId = await getUserId()
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!event) throw new Error('Event not found')
  if (isParticipantDataExpired(event.endedAt)) {
    throw new Error('Participant data has been deleted for this event.')
  }
  const roster = await db
    .select({
      email: participants.email,
      name: participants.name,
      joinedAt: participants.joinedAt,
      score: participants.score,
      currentModule: participants.currentModule,
    })
    .from(participants)
    .where(eq(participants.eventId, eventId))
    .orderBy(participants.joinedAt)

  const headers = [
    'email',
    'display_name',
    'joined_at',
    'score',
    'modules_complete',
    'event_type',
  ]
  const lines = roster.map((p) => {
    const joined = p.joinedAt.toISOString()
    const email = (p.email ?? '').replaceAll('"', '""')
    const name = (p.name ?? '').replaceAll('"', '""')
    return `"${email}","${name}","${joined}",${p.score},${p.currentModule},"${event.eventType}"`
  })
  return `${headers.join(',')}\n${lines.join('\n')}\n`
}

// Retry provisioning any accounts that previously failed (e.g. before Connect
// was enabled). Deletes the failed rows and re-creates them.
export async function retryFailedAccounts(eventId: string) {
  const userId = await getUserId()
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!event) throw new Error('Event not found')

  // Retry failed accounts in the pool (new system)
  const poolResult = await retryFailedPoolAccounts(eventId)

  // Also retry failed legacy connected_accounts
  const failedLegacy = await db
    .select({ slotNumber: connectedAccounts.slotNumber })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.eventId, eventId),
        eq(connectedAccounts.status, 'failed'),
      ),
    )

  let legacyResult = { created: 0, failed: 0 }
  if (failedLegacy.length > 0) {
    await db
      .delete(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.eventId, eventId),
          eq(connectedAccounts.status, 'failed'),
        ),
      )
    const slots = failedLegacy.map((f) => f.slotNumber)
    legacyResult = await provisionSlotsForEvent(eventId, slots)
  }

  revalidatePath(`/sa/events/${eventId}`)
  return {
    created: poolResult.created + legacyResult.created,
    failed: poolResult.failed + legacyResult.failed,
  }
}

export async function addEventCapacity(
  eventId: string,
  additionalAccounts: number,
): Promise<{ newMax: number; created: number; failed: number }> {
  const userId = await getUserId()

  if (!Number.isInteger(additionalAccounts) || additionalAccounts < 1 || additionalAccounts > 50) {
    throw new Error('You can add between 1 and 50 accounts at a time')
  }

  const [event] = await db
    .select({
      id: events.id,
      maxParticipants: events.maxParticipants,
      status: events.status,
    })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)

  if (!event) throw new Error('Event not found')
  if (event.status !== 'active') throw new Error('Can only add capacity to active sessions')

  const currentMax = event.maxParticipants
  const newMax = currentMax + additionalAccounts

  if (newMax > 200) {
    throw new Error(`Adding ${additionalAccounts} would exceed the 200-account limit (currently at ${currentMax})`)
  }

  const [{ existingPoolCount }] = await db
    .select({ existingPoolCount: sql<number>`count(*)::int` })
    .from(accountPool)
    .where(eq(accountPool.eventId, eventId))

  await db
    .update(events)
    .set({ maxParticipants: newMax })
    .where(eq(events.id, eventId))

  provisionAdditionalAccounts(eventId, additionalAccounts, existingPoolCount).catch((err) =>
    console.error('[addCapacity] provisioning error:', err),
  )

  revalidatePath(`/sa/events/${eventId}`)
  return { newMax, created: additionalAccounts, failed: 0 }
}

export async function getEventStats(eventId: string) {
  const userId = await getUserId()
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
    .limit(1)
  if (!event) throw new Error('Event not found')

  const [{ count: completedModules }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(moduleProgress)
    .where(
      and(
        eq(moduleProgress.eventId, eventId),
        eq(moduleProgress.status, 'completed'),
      ),
    )
  return { completedModules }
}
