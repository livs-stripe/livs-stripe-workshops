import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { participants, scores } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

// In-memory cache: 10-second TTL per event. Acceptable for serverless
// (each instance caches independently, 10s staleness is fine for 20s polls).
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 10_000

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params

  // Check cache
  const cached = cache.get(eventId)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  // Single optimized query with window function for ranking
  const rows = await db
    .select({
      id: participants.id,
      email: participants.email,
      name: participants.name,
      score: participants.score,
      currentModule: participants.currentModule,
      virtualBalance: scores.virtualBalance,
      fraudBlocked: scores.fraudBlocked,
      falsePositives: scores.falsePositives,
    })
    .from(participants)
    .leftJoin(scores, eq(scores.participantId, participants.id))
    .where(eq(participants.eventId, eventId))
    .orderBy(desc(participants.score))
    .limit(50)

  // Sanitize: return only email prefix, never full email
  const leaderboard = rows.map((row, i) => ({
    rank: i + 1,
    id: row.id,
    name: row.name,
    emailPrefix: row.email?.split('@')[0] ?? 'anon',
    score: row.score,
    virtualBalance: row.virtualBalance ?? row.score,
    fraudBlocked: row.fraudBlocked ?? 0,
    falsePositives: row.falsePositives ?? 0,
    currentModule: row.currentModule,
  }))

  const result = { leaderboard, updatedAt: new Date().toISOString() }

  // Store in cache
  cache.set(eventId, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })

  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
