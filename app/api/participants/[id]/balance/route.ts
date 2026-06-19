import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { participants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const jar = await cookies()
    const callerId = jar.get('participant_id')?.value
    if (!callerId || callerId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [p] = await db
      .select({
        currentBalance: participants.currentBalance,
        totalBlockedAmount: participants.totalBlockedAmount,
        totalLostAmount: participants.totalLostAmount,
        currentModule: participants.currentModule,
      })
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1)

    if (!p) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(p)
  } catch (err) {
    console.error('[balance] Error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
