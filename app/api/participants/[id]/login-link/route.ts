import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { participants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createLoginLink } from '@/lib/stripe-accounts'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const jar = await cookies()
  const callerId = jar.get('participant_id')?.value

  if (!callerId || callerId !== id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [p] = await db
    .select({ stripeAccountId: participants.stripeAccountId })
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1)

  if (!p?.stripeAccountId) {
    return NextResponse.json(
      { error: 'No Stripe account assigned' },
      { status: 404 },
    )
  }

  try {
    const url = await createLoginLink(p.stripeAccountId)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[login-link]', err)
    return NextResponse.json(
      { error: 'Failed to generate login link' },
      { status: 502 },
    )
  }
}
