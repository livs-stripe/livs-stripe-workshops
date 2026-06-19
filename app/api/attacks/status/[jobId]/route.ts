import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attackJobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  const [job] = await db
    .select({
      status: attackJobs.status,
      chargesFired: attackJobs.chargesFired,
      chargesTotal: attackJobs.chargesTotal,
      chargesBlocked: attackJobs.chargesBlocked,
      chargesSucceeded: attackJobs.chargesSucceeded,
      errorMessage: attackJobs.errorMessage,
    })
    .from(attackJobs)
    .where(eq(attackJobs.id, jobId))
    .limit(1)

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(job)
}
