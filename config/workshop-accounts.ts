// Pre-created test connected accounts for each workshop theme.
//
// The "Open Dashboard" flow uses Stripe View-Dashboard-As (see lib/vda-links),
// which needs the connected account ID for the theme the participant is running.
// These are public account IDs (acct_...), safe to expose to the browser, but
// they are read from NEXT_PUBLIC_* env vars so they can differ per environment
// and are never committed. Set them in Vercel → Project → Environment Variables.
//
// IMPORTANT: theme IDs here must match lib/themes.ts (ThemeId).

export interface WorkshopAccount {
  /** The Stripe connected account ID for this workshop (acct_xxx). */
  connectedAccountId: string
  /** Human label shown in the auth pre-flight UI. */
  label: string
  /** Default Dashboard page to open for this workshop (VDA path segment). */
  defaultPage: string
}

export const workshopAccounts: Record<string, WorkshopAccount> = {
  fraud_radar: {
    connectedAccountId: process.env.NEXT_PUBLIC_WORKSHOP_ACCOUNT_FRAUD ?? '',
    label: 'Fraud & Radar',
    defaultPage: 'radar/rules',
  },
  online_payments: {
    connectedAccountId: process.env.NEXT_PUBLIC_WORKSHOP_ACCOUNT_PAYMENTS ?? '',
    label: 'Online Payments 101',
    defaultPage: 'payments',
  },
  billing: {
    connectedAccountId: process.env.NEXT_PUBLIC_WORKSHOP_ACCOUNT_BILLING ?? '',
    label: 'Billing & Subscriptions',
    defaultPage: 'subscriptions',
  },
  connect: {
    connectedAccountId: process.env.NEXT_PUBLIC_WORKSHOP_ACCOUNT_CONNECT ?? '',
    label: 'Stripe Connect',
    defaultPage: 'connect/accounts',
  },
  disputes: {
    connectedAccountId: process.env.NEXT_PUBLIC_WORKSHOP_ACCOUNT_DISPUTES ?? '',
    label: 'Disputes & Chargebacks',
    defaultPage: 'payments/disputes',
  },
}

/**
 * Returns the configured workshop account for a theme, or null when the
 * connected account ID has not been set (so callers can render a clear
 * "not configured" state instead of a broken link).
 */
export function getWorkshopAccount(themeId: string): WorkshopAccount | null {
  const account = workshopAccounts[themeId]
  if (!account?.connectedAccountId) return null
  return account
}
