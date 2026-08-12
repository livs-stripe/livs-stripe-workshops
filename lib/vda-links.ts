// Stripe "View Dashboard As" (VDA) link construction.
//
// VDA drops a viewer who is authenticated as the PLATFORM Stripe account
// directly into a connected account's full Dashboard context (Radar,
// Developers, Billing, etc.). The URL shape is:
//
//   https://dashboard.stripe.com/{PLATFORM_ID}/connect/view-as/{CONNECTED_ID}/{page}
//
// Requirements / gotchas:
//   - The viewer's browser must be logged into the platform account. If they
//     are logged into a different account, Stripe shows the wrong dashboard or
//     "Could not load the connected account".
//   - NEXT_PUBLIC_STRIPE_PLATFORM_ACCOUNT_ID is inlined into the client bundle
//     at build time (it is a public account ID, not a secret). Set it in Vercel.

const PLATFORM_ID = process.env.NEXT_PUBLIC_STRIPE_PLATFORM_ACCOUNT_ID ?? ''

/** True when the platform account ID is configured. */
export function isVdaConfigured(): boolean {
  return PLATFORM_ID.startsWith('acct_')
}

/**
 * Construct a Stripe View-Dashboard-As URL for a connected account.
 * Returns the plain Dashboard home if the platform ID is not configured, so
 * links degrade gracefully rather than producing a broken URL.
 */
export function vdaUrl(connectedAccountId: string, path = 'dashboard'): string {
  if (!isVdaConfigured() || !connectedAccountId.startsWith('acct_')) {
    return 'https://dashboard.stripe.com'
  }
  const clean = path.replace(/^\/+/, '')
  return `https://dashboard.stripe.com/${PLATFORM_ID}/connect/view-as/${connectedAccountId}/${clean}`
}

/**
 * Normalise a stored dashboard reference into a VDA path segment.
 * Accepts either a bare path ("radar/rules", "/apikeys") or a full
 * dashboard.stripe.com URL, and strips host + leading "test/" so it can be
 * appended to a VDA URL.
 */
export function toVdaPath(ref: string): string {
  let path = ref.trim()
  path = path.replace(/^https?:\/\/dashboard\.stripe\.com\//i, '')
  path = path.replace(/^\/+/, '')
  path = path.replace(/^test\//, '')
  return path || 'dashboard'
}

/**
 * The full set of contextual VDA deep links for a connected account. Used to
 * wire "open in Dashboard" links to the exact relevant page per step.
 */
export function vdaLinks(connectedAccountId: string) {
  const url = (path: string) => vdaUrl(connectedAccountId, path)
  return {
    home: url('dashboard'),
    payments: url('payments'),
    paymentDetail: (id: string) => url(`payments/${id}`),
    customers: url('customers'),
    radar: url('radar/rules'),
    radarLists: url('radar/lists'),
    radarReviews: url('radar/reviews'),
    disputes: url('payments/disputes'),
    webhooks: url('workbench/webhooks'),
    apiKeys: url('apikeys'),
    logs: url('workbench/logs'),
    events: url('workbench/events'),
    billing: url('subscriptions'),
    invoices: url('invoices'),
    reporting: url('reports'),
    balance: url('balance/overview'),
    payouts: url('payouts'),
    connect: url('connect/accounts'),
    settings: url('settings'),
  } as const
}

export type VdaLinkKey = keyof ReturnType<typeof vdaLinks>

/**
 * Stripe Dashboard login page. Send participants here first when they are not
 * yet authenticated as the workshop platform account.
 */
export const STRIPE_LOGIN_URL = 'https://dashboard.stripe.com/login'
