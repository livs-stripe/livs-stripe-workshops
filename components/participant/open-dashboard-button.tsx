'use client'

import { ExternalLink } from 'lucide-react'
import { StripeAuthGate } from '@/components/participant/stripe-auth-gate'
import { vdaUrl } from '@/lib/vda-links'
import { getWorkshopAccount } from '@/config/workshop-accounts'

/**
 * Opens the full Stripe Dashboard scoped to the workshop's connected account
 * via View-Dashboard-As. Wraps StripeAuthGate so participants are guided
 * through logging in as the platform account on first use.
 */
export function OpenDashboardButton({
  themeId,
  page,
  label = 'Open Stripe Dashboard',
}: {
  themeId: string
  /** Override the theme's default Dashboard page (VDA path segment). */
  page?: string
  label?: string
}) {
  const account = getWorkshopAccount(themeId)

  if (!account) {
    return (
      <button
        type="button"
        disabled
        title="Set NEXT_PUBLIC_WORKSHOP_ACCOUNT_* and NEXT_PUBLIC_STRIPE_PLATFORM_ACCOUNT_ID to enable this."
        className="flex h-10 w-full cursor-not-allowed items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-border bg-secondary/40 px-3 text-[13px] font-medium text-muted-foreground"
      >
        <ExternalLink className="size-4 shrink-0 opacity-60" />
        Dashboard not configured
      </button>
    )
  }

  const targetUrl = vdaUrl(account.connectedAccountId, page ?? account.defaultPage)

  return (
    <StripeAuthGate targetUrl={targetUrl} targetLabel={`the ${account.label} Dashboard`}>
      {({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg border-[1.5px] border-primary bg-white px-3 text-[13px] font-semibold text-primary transition-colors hover:border-primary-hover hover:bg-primary/5"
        >
          <svg viewBox="0 0 28 28" className="size-4 shrink-0" fill="none">
            <path
              d="M13.976 3.5C8.184 3.5 3.5 8.184 3.5 13.976c0 5.793 4.684 10.476 10.476 10.476 5.793 0 10.477-4.683 10.477-10.476C24.453 8.184 19.769 3.5 13.976 3.5zm0 4.19c.903 0 1.528.27 2.024.753l-1.003 1.003c-.366-.349-.74-.496-1.021-.496-.904 0-1.554.734-1.554 1.658 0 .924.65 1.658 1.554 1.658.28 0 .655-.148 1.021-.496l1.003 1.003c-.496.483-1.121.753-2.024.753-1.862 0-3.362-1.484-3.362-2.918 0-1.434 1.5-2.918 3.362-2.918z"
              fill="currentColor"
            />
          </svg>
          <span className="flex-1 text-left">{label}</span>
          <ExternalLink className="size-3.5 shrink-0 opacity-70" />
        </button>
      )}
    </StripeAuthGate>
  )
}
