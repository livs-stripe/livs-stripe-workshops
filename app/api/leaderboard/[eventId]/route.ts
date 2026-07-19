import { NextResponse } from 'next/server'
import { isInstructor } from '@/lib/instructor-auth'
import { db } from '@/lib/db'
import { participants } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 8_000

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params

  if (!(await isInstructor())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cached = cache.get(eventId)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  const rows = await db
    .select({
      id: participants.id,
      name: participants.name,
      email: participants.email,
      currentBalance: participants.currentBalance,
      startingBalance: participants.startingBalance,
      totalLostAmount: participants.totalLostAmount,
      totalBlockedAmount: participants.totalBlockedAmount,
      currentModule: participants.currentModule,
      score: participants.score,
      lastActiveAt: participants.lastActiveAt,
    })
    .from(participants)
    .where(eq(participants.eventId, eventId))
    .orderBy(desc(participants.currentBalance))
    .limit(50)

  const leaderboard = rows.map((row, i) => ({
    rank: i + 1,
    id: row.id,
    name: row.name,
    emailPrefix: row.email?.split('@')[0] ?? 'anon',
    currentBalance: row.currentBalance,
    startingBalance: row.startingBalance,
    totalLostAmount: row.totalLostAmount,
    totalBlockedAmount: row.totalBlockedAmount,
    currentModule: row.currentModule,
    score: row.score,
    lastActiveAt: row.lastActiveAt?.toISOString() ?? null,
  }))

  const avgBalance = rows.length > 0
    ? Math.round(rows.reduce((sum, r) => sum + r.currentBalance, 0) / rows.length)
    : 0

  const leader = rows[0] ?? null
  const completedAll = rows.filter((r) => r.currentModule >= 8).length

  const result = {
    leaderboard,
    summary: {
      avgBalance,
      leaderName: leader?.name ?? null,
      leaderBalance: leader?.currentBalance ?? 0,
      completedAll,
      totalParticipants: rows.length,
    },
    updatedAt: new Date().toISOString(),
  }

  cache.set(eventId, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })

  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
