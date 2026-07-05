'use client'

import { ArrowUpRight } from 'lucide-react'

const DASHBOARD_ROUTES: Record<string, string> = {
  'Radar': 'https://dashboard.stripe.com/radar',
  'Radar Rules': 'https://dashboard.stripe.com/radar/rules',
  'Radar Lists': 'https://dashboard.stripe.com/radar/lists',
  'Payments': 'https://dashboard.stripe.com/payments',
  'Disputes': 'https://dashboard.stripe.com/disputes',
  'Webhooks': 'https://dashboard.stripe.com/webhooks',
  'Test Payments': 'https://dashboard.stripe.com/test/payments',
}

export function DashboardLink({
  to,
  label,
}: {
  to: keyof typeof DASHBOARD_ROUTES | string
  label?: string
}) {
  const url = DASHBOARD_ROUTES[to] ?? to
  const text = label ?? to

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[13px] font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      {text}
      <ArrowUpRight className="size-3" />
    </a>
  )
}
