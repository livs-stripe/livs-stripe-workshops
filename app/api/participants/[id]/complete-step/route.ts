import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { participants, stepCompletions, moduleAttackQueue } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { newId } from '@/lib/id'
import { CHALLENGE_MODULES } from '@/lib/challenge-modules'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: participantId } = await params

  try {
    const jar = await cookies()
    const callerId = jar.get('participant_id')?.value
    if (!callerId || callerId !== participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { moduleNumber, stepNumber, eventId } = body as {
      moduleNumber: number
      stepNumber: number
      eventId: string
    }

    if (!moduleNumber || !stepNumber || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate module and step exist
    const mod = CHALLENGE_MODULES.find((m) => m.number === moduleNumber)
    if (!mod) {
      return NextResponse.json({ error: 'Invalid module' }, { status: 400 })
    }
    const step = mod.steps.find((s) => s.stepNumber === stepNumber)
    if (!step) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    // Verify participant exists
    const [p] = await db
      .select({ id: participants.id, eventId: participants.eventId })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1)

    if (!p || p.eventId !== eventId) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Check that previous steps are completed (enforce sequential order)
    if (stepNumber > 1) {
      const completedSteps = await db
        .select({ stepNumber: stepCompletions.stepNumber })
        .from(stepCompletions)
        .where(
          and(
            eq(stepCompletions.participantId, participantId),
            eq(stepCompletions.moduleNumber, moduleNumber),
          ),
        )
      const completedSet = new Set(completedSteps.map((s) => s.stepNumber))
      for (let i = 1; i < stepNumber; i++) {
        if (!completedSet.has(i)) {
          return NextResponse.json(
            { error: 'Complete previous steps first' },
            { status: 409 },
          )
        }
      }
    }

    // Upsert step completion
    const existing = await db
      .select({ id: stepCompletions.id })
      .from(stepCompletions)
      .where(
        and(
          eq(stepCompletions.participantId, participantId),
          eq(stepCompletions.moduleNumber, moduleNumber),
          eq(stepCompletions.stepNumber, stepNumber),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      await db.insert(stepCompletions).values({
        id: newId('sc'),
        participantId,
        eventId,
        moduleNumber,
        stepNumber,
      })
    }

    // Determine if this is the fire step — queue the attack
    const isFire = step.type === 'fire'
    let attackQueued = false

    if (isFire) {
      // Check if attack already queued for this module
      const existingAttack = await db
        .select({ id: moduleAttackQueue.id })
        .from(moduleAttackQueue)
        .where(
          and(
            eq(moduleAttackQueue.participantId, participantId),
            eq(moduleAttackQueue.moduleNumber, moduleNumber),
          ),
        )
        .limit(1)

      if (existingAttack.length === 0) {
        await db.insert(moduleAttackQueue).values({
          id: newId('maq'),
          participantId,
          eventId,
          moduleNumber,
          status: 'pending',
        })
        attackQueued = true
      }
    }

    // Check if all steps in this module are now complete
    const allCompleted = await db
      .select({ stepNumber: stepCompletions.stepNumber })
      .from(stepCompletions)
      .where(
        and(
          eq(stepCompletions.participantId, participantId),
          eq(stepCompletions.moduleNumber, moduleNumber),
        ),
      )
    const moduleComplete = allCompleted.length >= mod.steps.length

    // Update participant's currentModule if this module is complete
    if (moduleComplete) {
      await db
        .update(participants)
        .set({ currentModule: moduleNumber })
        .where(eq(participants.id, participantId))
    }

    const nextStep = stepNumber < mod.steps.length ? stepNumber + 1 : null

    return NextResponse.json({
      success: true,
      nextStepUnlocked: nextStep,
      moduleComplete,
      attackQueued,
    })
  } catch (err) {
    console.error('[complete-step] Error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
