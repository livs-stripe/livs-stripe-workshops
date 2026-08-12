'use client'

import { ArrowUpRight } from 'lucide-react'
import { StripeAuthGate } from '@/components/participant/stripe-auth-gate'
import { vdaUrl, toVdaPath } from '@/lib/vda-links'
import { getWorkshopAccount } from '@/config/workshop-accounts'

/**
 * Inline contextual "open in Dashboard" link for a workshop step. Builds a
 * View-Dashboard-As URL to a specific page of the theme's connected account.
 * `page` may be a VDA path ("radar/rules") or a full dashboard.stripe.com URL
 * (as stored on existing steps) — it is normalised either way.
 */
export function DashboardDeepLink({
  themeId,
  page,
  children,
}: {
  themeId: string
  page: string
  children: React.ReactNode
}) {
  const account = getWorkshopAccount(themeId)

  // Not configured yet — render a non-interactive pill so the step still reads
  // cleanly (matches the DashboardLink styling).
  if (!account) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
        {children}
        <ArrowUpRight className="size-3 opacity-60" />
      </span>
    )
  }

  const targetUrl = vdaUrl(account.connectedAccountId, toVdaPath(page))

  return (
    <StripeAuthGate targetUrl={targetUrl} targetLabel={`the ${account.label} Dashboard`}>
      {({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[13px] font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          {children}
          <ArrowUpRight className="size-3" />
        </button>
      )}
    </StripeAuthGate>
  )
}
