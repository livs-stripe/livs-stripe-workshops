'use server'

import { db } from '@/lib/db'
import {
  events,
  participants,
  moduleProgress,
  attackWaves,
  workshopProgress,
} from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { newId } from '@/lib/id'
import { getModule, MODULES } from '@/lib/workshop-content'
import { WORKSHOP_MODULES } from '@/lib/workshop-modules'
import { autoEndExpiredEvents } from '@/lib/event-lifecycle'
import { getSessionEndsAt } from '@/lib/event-retention'
import { claimPoolAccount, provisionOnDemand } from '@/lib/stripe-accounts'

const COOKIE = 'participant_id'

function cookieMaxAgeSeconds(sessionEndsAt: Date) {
  const sec = Math.ceil((sessionEndsAt.getTime() - Date.now()) / 1000)
  return Math.min(Math.max(sec, 60), 60 * 60 * 24 * 7)
}

export async function findEventByCode(code: string) {
  await autoEndExpiredEvents()
  const normalized = code.trim().toUpperCase()
  if (normalized.length !== 6) return null
  const [event] = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      status: events.status,
      eventType: events.eventType,
      eventTheme: events.eventTheme,
      sessionEndsAt: events.sessionEndsAt,
      durationMinutes: events.durationMinutes,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.accessCode, normalized))
    .limit(1)
  return event ?? null
}

export async function joinEvent(formData: FormData) {
  await autoEndExpiredEvents()
  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const nameRaw = String(formData.get('name') ?? '').trim()
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!emailRaw || !emailRaw.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const event = await findEventByCode(code)
  if (!event) return { error: 'No session found for that access code.' }
  if (event.status === 'ended')
    return { error: 'This session has already ended.' }

  const fullEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, event.id))
    .limit(1)
    .then((r) => r[0])
  if (!fullEvent) return { error: 'No session found for that access code.' }

  const sessionEndsAt = getSessionEndsAt(fullEvent)
  if (sessionEndsAt.getTime() <= Date.now()) {
    return { error: 'This session has already ended.' }
  }

  const displayName =
    nameRaw ||
    emailRaw.split('@')[0]?.slice(0, 80) ||
    'Participant'

  const [existing] = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.eventId, event.id),
        sql`LOWER(TRIM(${participants.email})) = ${emailRaw}`,
      ),
    )
    .limit(1)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participants)
    .where(eq(participants.eventId, event.id))

  const [capacityRow] = await db
    .select({ maxParticipants: events.maxParticipants })
    .from(events)
    .where(eq(events.id, event.id))
    .limit(1)

  if (!existing && capacityRow && count >= capacityRow.maxParticipants) {
    return { error: 'This session is full. Ask your facilitator for help.' }
  }

  const id = existing?.id ?? newId('pt')
  if (!existing) {
    // Claim a pre-provisioned Stripe account from the pool
    let stripeAccountId = await claimPoolAccount(event.id, id)
    if (!stripeAccountId) {
      // Pool exhausted — provision on demand with retry
      stripeAccountId = await provisionOnDemand(event.id, emailRaw)
    }

    await db.insert(participants).values({
      id,
      eventId: event.id,
      name: displayName,
      email: emailRaw,
      company: null,
      stripeAccountId,
      assignedAt: stripeAccountId ? new Date() : null,
      provisioningStatus: stripeAccountId ? 'ready' : 'pending',
    })
  } else {
    await db
      .update(participants)
      .set({ name: displayName, lastActiveAt: new Date() })
      .where(eq(participants.id, id))
  }

  const jar = await cookies()
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: cookieMaxAgeSeconds(sessionEndsAt),
  })

  return { ok: true, participantId: id }
}

export async function getCurrentParticipant() {
  await autoEndExpiredEvents()
  const jar = await cookies()
  const id = jar.get(COOKIE)?.value
  if (!id) return null

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1)
  if (!participant) return null

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, participant.eventId))
    .limit(1)
  if (!event) return null

  const progress = await db
    .select()
    .from(moduleProgress)
    .where(eq(moduleProgress.participantId, id))

  const waves = await db
    .select()
    .from(attackWaves)
    .where(and(eq(attackWaves.eventId, participant.eventId), eq(attackWaves.active, true)))
    .orderBy(desc(attackWaves.firedAt))
    .limit(5)

  const wsProgress = await db
    .select()
    .from(workshopProgress)
    .where(eq(workshopProgress.participantId, id))

  let finalRoster:
    | { id: string; name: string; score: number; currentModule: number }[]
    | undefined
  if (event.status === 'ended' && event.eventType === 'challenge') {
    finalRoster = await db
      .select({
        id: participants.id,
        name: participants.name,
        score: participants.score,
        currentModule: participants.currentModule,
      })
      .from(participants)
      .where(eq(participants.eventId, event.id))
      .orderBy(desc(participants.score), participants.joinedAt)
  }

  return { participant, event, progress, waves, wsProgress, finalRoster }
}

export async function saveWorkshopProgress(input: {
  moduleId: string
  completedSteps: number[]
  moduleDone: boolean
}) {
  await autoEndExpiredEvents()
  const jar = await cookies()
  const participantId = jar.get(COOKIE)?.value
  if (!participantId) return { error: 'Session expired. Please rejoin.' }

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)
  if (!participant) return { error: 'Session expired. Please rejoin.' }

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.id, participant.eventId))
    .limit(1)
  if (!ev || ev.status === 'ended') {
    return { error: 'This session has ended.' }
  }

  const known = WORKSHOP_MODULES.find((m) => m.id === input.moduleId)
  if (!known) return { error: 'Unknown module.' }

  const stepsJson = JSON.stringify(
    Array.from(new Set(input.completedSteps)).sort((a, b) => a - b),
  )

  const [existing] = await db
    .select()
    .from(workshopProgress)
    .where(
      and(
        eq(workshopProgress.participantId, participantId),
        eq(workshopProgress.moduleId, input.moduleId),
      ),
    )
    .limit(1)

  if (existing) {
    await db
      .update(workshopProgress)
      .set({
        completedSteps: stepsJson,
        moduleDone: input.moduleDone,
        updatedAt: new Date(),
      })
      .where(eq(workshopProgress.id, existing.id))
  } else {
    await db.insert(workshopProgress).values({
      id: newId('wp'),
      participantId,
      eventId: participant.eventId,
      moduleId: input.moduleId,
      completedSteps: stepsJson,
      moduleDone: input.moduleDone,
    })
  }

  const all = await db
    .select({ moduleDone: workshopProgress.moduleDone })
    .from(workshopProgress)
    .where(eq(workshopProgress.participantId, participantId))
  const doneCount = all.filter((r) => r.moduleDone).length

  await db
    .update(participants)
    .set({ currentModule: doneCount, lastActiveAt: new Date() })
    .where(eq(participants.id, participantId))

  revalidatePath('/workshop')
  return { ok: true, doneCount }
}

export async function leaveWorkshop() {
  const jar = await cookies()
  jar.delete(COOKIE)
  revalidatePath('/')
}

export async function submitModule(
  moduleId: string,
  answers: Record<string, string>,
) {
  await autoEndExpiredEvents()
  const jar = await cookies()
  const participantId = jar.get(COOKIE)?.value
  if (!participantId) return { error: 'Session expired. Please rejoin.' }

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)
  if (!participant) return { error: 'Session expired. Please rejoin.' }

  const [ev] = await db
    .select()
    .from(events)
    .where(eq(events.id, participant.eventId))
    .limit(1)
  if (!ev || ev.status === 'ended') {
    return { error: 'This session has ended.' }
  }

  const mod = getModule(moduleId)
  if (!mod) return { error: 'Unknown module.' }

  let correct = 0
  const results: Record<string, boolean> = {}
  for (const q of mod.questions) {
    const isCorrect = answers[q.id] === q.correctOptionId
    results[q.id] = isCorrect
    if (isCorrect) correct++
  }
  const earned = Math.round((correct / mod.questions.length) * mod.points)

  const [existing] = await db
    .select()
    .from(moduleProgress)
    .where(
      and(
        eq(moduleProgress.participantId, participantId),
        eq(moduleProgress.moduleId, moduleId),
      ),
    )
    .limit(1)

  const prevEarned = existing?.score ?? 0

  if (existing) {
    await db
      .update(moduleProgress)
      .set({
        status: 'completed',
        score: Math.max(prevEarned, earned),
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(moduleProgress.id, existing.id))
  } else {
    await db.insert(moduleProgress).values({
      id: newId('mp'),
      participantId,
      eventId: participant.eventId,
      moduleId,
      status: 'completed',
      score: earned,
      completedAt: new Date(),
    })
  }

  const allProgress = await db
    .select({ score: moduleProgress.score })
    .from(moduleProgress)
    .where(eq(moduleProgress.participantId, participantId))
  const total = allProgress.reduce((s, r) => s + r.score, 0)

  const nextModule = Math.min(
    MODULES.length,
    Math.max(participant.currentModule, mod.order),
  )

  await db
    .update(participants)
    .set({
      score: total,
      currentModule: nextModule,
      lastActiveAt: new Date(),
    })
    .where(eq(participants.id, participantId))

  revalidatePath('/workshop')
  return {
    ok: true,
    correct,
    totalQuestions: mod.questions.length,
    earned,
    results,
  }
}
