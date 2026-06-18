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

const COOKIE = 'participant_id'

export async function findEventByCode(code: string) {
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
    })
    .from(events)
    .where(eq(events.accessCode, normalized))
    .limit(1)
  return event ?? null
}

export async function joinEvent(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()

  if (!name) return { error: 'Please enter your name.' }

  const event = await findEventByCode(code)
  if (!event) return { error: 'No workshop found for that access code.' }
  if (event.status === 'ended')
    return { error: 'This workshop has already ended.' }

  // Enforce the workshop capacity set by the instructor.
  const [capacityRow] = await db
    .select({ maxParticipants: events.maxParticipants })
    .from(events)
    .where(eq(events.id, event.id))
    .limit(1)
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participants)
    .where(eq(participants.eventId, event.id))
  if (capacityRow && count >= capacityRow.maxParticipants) {
    return { error: 'This workshop is full. Ask your instructor for help.' }
  }

  const id = newId('pt')
  await db.insert(participants).values({
    id,
    eventId: event.id,
    name,
    email: email || null,
    company: company || null,
  })

  const jar = await cookies()
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { ok: true, participantId: id }
}

export async function getCurrentParticipant() {
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

  return { participant, event, progress, waves, wsProgress }
}

// Persist a participant's progress through a single Workshop module. Stores the
// set of completed step indices and whether the whole module is done, then
// advances the participant's currentModule pointer to the count of done modules
// so the SA console's progress metrics stay accurate.
export async function saveWorkshopProgress(input: {
  moduleId: string
  completedSteps: number[]
  moduleDone: boolean
}) {
  const jar = await cookies()
  const participantId = jar.get(COOKIE)?.value
  if (!participantId) return { error: 'Session expired. Please rejoin.' }

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)
  if (!participant) return { error: 'Session expired. Please rejoin.' }

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

  // Count completed modules to drive the SA progress view.
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
  const jar = await cookies()
  const participantId = jar.get(COOKIE)?.value
  if (!participantId) return { error: 'Session expired. Please rejoin.' }

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1)
  if (!participant) return { error: 'Session expired. Please rejoin.' }

  const mod = getModule(moduleId)
  if (!mod) return { error: 'Unknown module.' }

  // Grade the quiz.
  let correct = 0
  const results: Record<string, boolean> = {}
  for (const q of mod.questions) {
    const isCorrect = answers[q.id] === q.correctOptionId
    results[q.id] = isCorrect
    if (isCorrect) correct++
  }
  const earned = Math.round((correct / mod.questions.length) * mod.points)

  // Upsert progress: only keep the best score per module.
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

  // Recompute participant total from best-per-module scores.
  const allProgress = await db
    .select({ score: moduleProgress.score })
    .from(moduleProgress)
    .where(eq(moduleProgress.participantId, participantId))
  const total = allProgress.reduce((s, r) => s + r.score, 0)

  // Advance the current module pointer.
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
