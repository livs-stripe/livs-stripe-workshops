import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { stepCompletions, moduleAttackQueue } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; moduleNumber: string }> },
) {
  const { id: participantId, moduleNumber: moduleNumberStr } = await params
  const moduleNumber = parseInt(moduleNumberStr, 10)

  try {
    const jar = await cookies()
    const callerId = jar.get('participant_id')?.value
    if (!callerId || callerId !== participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isNaN(moduleNumber)) {
      return NextResponse.json({ error: 'Invalid module number' }, { status: 400 })
    }

    const completedSteps = await db
      .select({
        stepNumber: stepCompletions.stepNumber,
        completedAt: stepCompletions.completedAt,
      })
      .from(stepCompletions)
      .where(
        and(
          eq(stepCompletions.participantId, participantId),
          eq(stepCompletions.moduleNumber, moduleNumber),
        ),
      )

    const [attack] = await db
      .select({
        id: moduleAttackQueue.id,
        status: moduleAttackQueue.status,
        chargesFired: moduleAttackQueue.chargesFired,
        chargesBlocked: moduleAttackQueue.chargesBlocked,
        chargesSucceeded: moduleAttackQueue.chargesSucceeded,
        amountLostCents: moduleAttackQueue.amountLostCents,
        completedAt: moduleAttackQueue.completedAt,
      })
      .from(moduleAttackQueue)
      .where(
        and(
          eq(moduleAttackQueue.participantId, participantId),
          eq(moduleAttackQueue.moduleNumber, moduleNumber),
        ),
      )
      .limit(1)

    return NextResponse.json({
      completedSteps: completedSteps.map((s) => s.stepNumber),
      attack: attack ?? null,
    })
  } catch (err) {
    console.error('[module-progress] Error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
