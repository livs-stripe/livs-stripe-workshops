'use server'

import { db } from '@/lib/db'
import { events, participants, attackWaves, moduleProgress } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { newId, newAccessCode } from '@/lib/id'
import { getAttackWaveType } from '@/lib/workshop-content'
import { requireInstructor } from '@/lib/instructor-auth'
import { isAvailableTheme } from '@/lib/themes'
import {
  provisionAccountsForEvent,
  provisionSlotsForEvent,
  dashboardUrlForAccount,
} from '@/lib/stripe-accounts'
import { connectedAccounts } from '@/lib/db/schema'

async function getUserId() {
  return requireInstructor()
}

export async function getEvents() {
  const userId = await getUserId()
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
      participantCount: sql<number>`count(${participants.id})::int`,
    })
    .from(events)
    .leftJoin(participants, eq(participants.eventId, events.id))
    .where(eq(events.saUserId, userId))
    .groupBy(events.id)
    .orderBy(desc(events.createdAt))
  return rows
}

// Count events per theme for the current SA — powers the Themes reference page.
export async function getThemeCounts() {
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
  const customerEmail = String(formData.get('customerEmail') ?? '').trim()
  const facilitatorNotes = String(formData.get('facilitatorNotes') ?? '').trim()
  const maxParticipants = Number(formData.get('maxParticipants'))
  const durationMinutes = Number(formData.get('durationMinutes'))
  if (!name) throw new Error('Name is required')
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 500) {
    throw new Error('Max participants must be a whole number between 1 and 500')
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 480) {
    throw new Error('Duration must be a whole number of minutes between 5 and 480')
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
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    facilitatorNotes: facilitatorNotes || null,
    balanceCurrency,
    startingBalanceCents,
    scoreIntervalSeconds,
    leaderboardEnabled,
    projectorEnabled,
  })

  // Pre-provision one Stripe Connect account per participant slot so the
  // instructor can demo each account as a Stripe admin during the session.
  await provisionAccountsForEvent(id, maxParticipants)

  revalidatePath('/sa')
  return { id, accessCode, eventType }
}

export async function getEventDetail(eventId: string) {
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

  const accountRows = await db
    .select()
    .from(connectedAccounts)
    .where(eq(connectedAccounts.eventId, eventId))
    .orderBy(connectedAccounts.slotNumber)

  const accounts = accountRows.map((a) => ({
    id: a.id,
    stripeAccountId: a.stripeAccountId,
    businessName: a.businessName,
    slotNumber: a.slotNumber,
    participantId: a.participantId,
    status: a.status,
    dashboardUrl:
      a.status === 'active' && a.stripeAccountId
        ? dashboardUrlForAccount(a.stripeAccountId)
        : null,
  }))

  return { event, roster, waves, accounts }
}

export async function fireAttackWave(eventId: string, waveType: string) {
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
  const userId = await getUserId()
  await db
    .update(events)
    .set({ status })
    .where(and(eq(events.id, eventId), eq(events.saUserId, userId)))
  revalidatePath(`/sa/events/${eventId}`)
  revalidatePath('/sa')
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

  const failed = await db
    .select({ slotNumber: connectedAccounts.slotNumber })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.eventId, eventId),
        eq(connectedAccounts.status, 'failed'),
      ),
    )
  if (failed.length === 0) return { created: 0, failed: 0 }

  await db
    .delete(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.eventId, eventId),
        eq(connectedAccounts.status, 'failed'),
      ),
    )

  const slots = failed.map((f) => f.slotNumber)
  const result = await provisionSlotsForEvent(eventId, slots)
  revalidatePath(`/sa/events/${eventId}`)
  return result
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
