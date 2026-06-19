import 'server-only'

import Stripe from 'stripe'

// Lazy singleton — avoids "Neither apiKey nor config.authenticator provided"
// during Next.js static page collection when env vars aren't set.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      maxNetworkRetries: 2,
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() for lazy initialization. Kept for backward compat. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Wraps a Stripe API call with rate-limit-aware retry logic.
 * On 429: reads Retry-After header, sleeps, then retries (up to maxRetries).
 * All other errors are thrown immediately.
 */
export async function stripeWithRetry<T>(
  fn: () => Promise<T>,
  opts?: { maxRetries?: number; context?: string },
): Promise<T> {
  const maxRetries = opts?.maxRetries ?? 3
  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      if (
        err instanceof Stripe.errors.StripeRateLimitError &&
        attempt < maxRetries
      ) {
        const retryAfter = parseRetryAfter(err)
        console.warn(
          `[stripe-retry] Rate limited (attempt ${attempt}/${maxRetries})${opts?.context ? ` ctx=${opts.context}` : ''}. Waiting ${retryAfter}ms`,
        )
        await sleep(retryAfter)
        continue
      }
      throw err
    }
  }
}

function parseRetryAfter(err: Stripe.errors.StripeRateLimitError): number {
  const header = (err.headers as Record<string, string>)?.['retry-after']
  if (header) {
    const seconds = Number(header)
    if (!isNaN(seconds) && seconds > 0) return seconds * 1000
  }
  return 1000 + Math.random() * 500
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Generates a deterministic idempotency key for Stripe calls.
 * Prevents duplicate operations from retries or double-clicks.
 */
export function idempotencyKey(...parts: string[]): string {
  return parts.filter(Boolean).join('-')
}
