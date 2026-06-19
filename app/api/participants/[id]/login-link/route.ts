import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    // Check platform key before any DB or Stripe calls
    const platformKey = process.env.STRIPE_SECRET_KEY
    if (!platformKey || !platformKey.startsWith('sk_')) {
      console.error('[login-link] STRIPE_SECRET_KEY missing or invalid')
      return NextResponse.json(
        { error: 'Platform configuration error. Contact your facilitator.', code: 'INVALID_PLATFORM_KEY' },
        { status: 500 },
      )
    }

    // Dynamically import heavy dependencies to avoid module-level crashes
    const { db } = await import('@/lib/db')
    const { participants, events } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')

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

    // Create login link using the Stripe API directly (avoid import chain issues)
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(platformKey, { maxNetworkRetries: 2 })

    const loginLink = await stripe.accounts.createLoginLink(p.stripeAccountId)
    return NextResponse.json({ url: loginLink.url })
  } catch (err: unknown) {
    // Handle Stripe errors
    const stripeErr = err as { code?: string; statusCode?: number; type?: string; message?: string }

    if (stripeErr.code === 'account_invalid') {
      return NextResponse.json(
        { error: 'Your Stripe account could not be found. Contact your facilitator.', code: 'ACCOUNT_INVALID' },
        { status: 404 },
      )
    }
    if (stripeErr.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Wait a few seconds and try again.', code: 'RATE_LIMITED' },
        { status: 429 },
      )
    }
    if (stripeErr.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Platform authentication failed. Contact your facilitator.', code: 'AUTH_ERROR' },
        { status: 401 },
      )
    }

    console.error('[login-link] Unhandled error:', {
      participantId: id,
      error: err instanceof Error ? err.message : String(err),
      code: stripeErr.code,
      type: stripeErr.type,
      statusCode: stripeErr.statusCode,
    })

    return NextResponse.json(
      { error: 'Unable to open the Dashboard right now. Try again in a moment.', code: 'UNKNOWN_ERROR' },
      { status: 500 },
    )
  }
}

// Support both GET and POST in case frontend uses either method
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  return GET(req, context)
}
