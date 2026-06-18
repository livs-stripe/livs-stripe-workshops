'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { retryFailedAccounts } from '@/app/actions/events'
import { toast } from 'sonner'
import {
  Landmark,
  ExternalLink,
  Copy,
  Check,
  Search,
  CircleAlert,
  RefreshCw,
} from 'lucide-react'

export type ConnectedAccount = {
  id: string
  stripeAccountId: string
  businessName: string
  slotNumber: number
  participantId: string | null
  status: string
  dashboardUrl: string | null
}

export function ConnectedAccountsPanel({
  eventId,
  accounts,
}: {
  eventId: string
  accounts: ConnectedAccount[]
}) {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [retrying, startRetry] = useTransition()

  const activeCount = accounts.filter((a) => a.status === 'active').length
  const failedCount = accounts.length - activeCount

  function handleRetry() {
    startRetry(async () => {
      try {
        const res = await retryFailedAccounts(eventId)
        if (res.failed > 0) {
          toast.error(
            `${res.created} created, ${res.failed} still failing. Enable Connect in your Stripe dashboard, then retry.`,
          )
        } else {
          toast.success(`Provisioned ${res.created} accounts.`)
        }
      } catch {
        toast.error('Could not retry provisioning.')
      }
    })
  }

  const filtered = accounts.filter((a) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      a.businessName.toLowerCase().includes(q) ||
      a.stripeAccountId.toLowerCase().includes(q) ||
      String(a.slotNumber).includes(q)
    )
  })

  async function copyId(id: string) {
    await navigator.clipboard.writeText(id)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Card className="p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Landmark className="size-4 text-primary" /> Connected accounts
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activeCount} active</Badge>
          {failedCount > 0 && (
            <Badge variant="destructive">{failedCount} failed</Badge>
          )}
        </div>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        One Stripe account was created in advance for each participant slot. Open
        any account to demo the workshop as a Stripe admin.
      </p>

      {failedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3">
          <p className="flex items-start gap-2 text-xs text-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>
              {failedCount} account{failedCount === 1 ? '' : 's'} failed to
              provision. Enable Connect in your{' '}
              <a
                href="https://dashboard.stripe.com/connect/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Stripe dashboard
              </a>
              , then retry.
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw
              className={`size-3.5 ${retrying ? 'animate-spin' : ''}`}
            />
            {retrying ? 'Retrying…' : 'Retry provisioning'}
          </Button>
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No connected accounts were provisioned for this workshop.
        </p>
      ) : (
        <>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by business name or account ID"
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15"
            />
          </div>

          <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
            {filtered.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded bg-accent font-mono text-xs font-semibold tabular-nums text-accent-foreground">
                  {a.slotNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {a.businessName}
                  </p>
                  <button
                    onClick={() => a.stripeAccountId && copyId(a.stripeAccountId)}
                    disabled={!a.stripeAccountId}
                    className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:hover:text-muted-foreground"
                  >
                    {a.stripeAccountId || 'provisioning failed'}
                    {a.stripeAccountId &&
                      (copied === a.stripeAccountId ? (
                        <Check className="size-3 text-success" />
                      ) : (
                        <Copy className="size-3" />
                      ))}
                  </button>
                </div>
                {a.status === 'active' ? (
                  <Badge variant="success">
                    <span className="size-1.5 rounded-full bg-success" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <CircleAlert className="size-3" /> Failed
                  </Badge>
                )}
                {a.dashboardUrl ? (
                  <a
                    href={a.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary"
                  >
                    Log in as admin <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No accounts match “{query}”.
              </li>
            )}
          </ul>
        </>
      )}
    </Card>
  )
}
