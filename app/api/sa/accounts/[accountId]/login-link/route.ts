import { NextResponse } from 'next/server'
import { isInstructor } from '@/lib/instructor-auth'
import { createSaLoginLink, dashboardUrlForAccount } from '@/lib/stripe-accounts'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accountId } = await params

  if (!accountId || !accountId.startsWith('acct_')) {
    return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 })
  }

  const loginUrl = await createSaLoginLink(accountId)

  if (loginUrl) {
    return NextResponse.json({ url: loginUrl })
  }

  return NextResponse.json({
    url: dashboardUrlForAccount(accountId),
    fallback: true,
  })
}
