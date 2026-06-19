import { NextResponse } from 'next/server'
import { processAttackQueue } from '@/lib/attack-processor'

/**
 * Vercel Cron endpoint — runs every 30 seconds to process queued attack jobs.
 * Protected by CRON_SECRET to prevent unauthorized invocations.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await processAttackQueue()
  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
export const maxDuration = 60
