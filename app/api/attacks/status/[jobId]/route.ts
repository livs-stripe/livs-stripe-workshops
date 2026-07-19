import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isInstructor } from '@/lib/instructor-auth'
import { db } from '@/lib/db'
import { attackJobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  const jar = await cookies()
  const callerId = jar.get('participant_id')?.value
  if (!callerId && !(await isInstructor())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
