import { NextResponse } from 'next/server'
import { isInstructor } from '@/lib/instructor-auth'
import { getProvisioningStatus } from '@/lib/stripe-accounts'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!(await isInstructor())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getProvisioningStatus(id)
  return NextResponse.json(status)
}
