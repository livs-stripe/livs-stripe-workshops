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
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-medium transition-colors"
      style={{
        borderColor: '#E3E8EF',
        color: '#425466',
        backgroundColor: '#F8F9FA',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#635BFF'
        e.currentTarget.style.color = '#635BFF'
        e.currentTarget.style.backgroundColor = '#F4F3FF'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E3E8EF'
        e.currentTarget.style.color = '#425466'
        e.currentTarget.style.backgroundColor = '#F8F9FA'
      }}
    >
      {text}
      <ArrowUpRight className="size-3" />
    </a>
  )
}
