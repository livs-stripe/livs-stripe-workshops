import { NextResponse } from 'next/server'
import { processAttackQueue } from '@/lib/attack-processor'
import { processChallengeAttackQueue } from '@/lib/challenge-attack-processor'

/**
 * Vercel Cron endpoint — runs every minute to process queued attack jobs.
 * Handles both SA-fired attack waves and participant challenge module attacks.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [waveResult, challengeResult] = await Promise.all([
    processAttackQueue(),
    processChallengeAttackQueue(),
  ])

  return NextResponse.json({
    waves: waveResult,
    challenges: challengeResult,
  })
}

export const dynamic = 'force-dynamic'
export const maxDuration = 60
