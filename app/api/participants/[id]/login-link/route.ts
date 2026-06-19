import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { participants, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createLoginLink } from '@/lib/stripe-accounts'
import Stripe from 'stripe'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const jar = await cookies()
    const callerId = jar.get('participant_id')?.value

    if (!callerId || callerId !== id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 },
      )
    }

    const [p] = await db
      .select({
        stripeAccountId: participants.stripeAccountId,
        eventId: participants.eventId,
      })
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1)

    if (!p) {
      return NextResponse.json(
        { error: 'Participant not found', code: 'PARTICIPANT_NOT_FOUND' },
        { status: 404 },
      )
    }

    // Check event is still active
    if (p.eventId) {
      const [ev] = await db
        .select({ status: events.status })
        .from(events)
        .where(eq(events.id, p.eventId))
        .limit(1)

      if (ev?.status === 'ended') {
        return NextResponse.json(
          { error: 'This session has ended. The Stripe Dashboard is no longer available.', code: 'EVENT_TERMINATED' },
          { status: 410 },
        )
      }
    }

    if (!p.stripeAccountId) {
      return NextResponse.json(
        { error: 'Your Stripe account is still being set up. Wait a moment and try again.', code: 'ACCOUNT_NOT_PROVISIONED' },
        { status: 503 },
      )
    }

    // Check platform key
    const platformKey = process.env.STRIPE_SECRET_KEY
    if (!platformKey || !platformKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Platform configuration error. Contact your facilitator.', code: 'INVALID_PLATFORM_KEY' },
        { status: 500 },
      )
    }

    const url = await createLoginLink(p.stripeAccountId)
    return NextResponse.json({ url })
  } catch (err) {
    // Handle specific Stripe errors
    if (err instanceof Stripe.errors.StripeError) {
      if (err.code === 'account_invalid') {
        return NextResponse.json(
          { error: 'Your Stripe account could not be found. Contact your facilitator.', code: 'ACCOUNT_INVALID' },
          { status: 404 },
        )
      }
      if (err.statusCode === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Wait a few seconds and try again.', code: 'RATE_LIMITED' },
          { status: 429 },
        )
      }
      if (err.type === 'StripeAuthenticationError') {
        return NextResponse.json(
          { error: 'Platform authentication failed. Contact your facilitator.', code: 'AUTH_ERROR' },
          { status: 401 },
        )
      }
    }

    console.error('[login-link] Unhandled error:', {
      participantId: id,
      error: err instanceof Error ? err.message : String(err),
      code: (err as { code?: string }).code,
      type: (err as { type?: string }).type,
    })

    return NextResponse.json(
      { error: 'Unable to open the Dashboard right now. Try again in a moment.', code: 'UNKNOWN_ERROR' },
      { status: 500 },
    )
  }
}
