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
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  KeyRound,
  Timer,
} from 'lucide-react'

export type ConnectedAccount = {
  id: string
  stripeAccountId: string
  businessName: string
  slotNumber: number
  participantId: string | null
  status: string
  dashboardUrl: string | null
  errorMessage?: string | null
  errorCode?: string | null
}

function ErrorHelpText({ errorMessage, errorCode }: { errorMessage?: string | null; errorCode?: string | null }) {
  if (!errorMessage && !errorCode) return null

  const code = errorCode ?? ''
  const msg = (errorMessage ?? '').toLowerCase()

  if (code === 'rate_limit' || msg.includes('rate limit') || msg.includes('too many requests')) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
        <Timer className="mt-0.5 size-3 shrink-0" />
        <span>Stripe rate limit reached. Click retry — the system will pause between requests this time.</span>
      </div>
    )
  }

  if (code === 'invalid_api_key' || code === 'authentication_error' || msg.includes('authentication') || msg.includes('api key')) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-400">
        <KeyRound className="mt-0.5 size-3 shrink-0" />
        <span>Platform API key is invalid or does not have Connect permissions. Check your STRIPE_PLATFORM_API_KEY environment variable.</span>
      </div>
    )
  }

  if (msg.includes('connect') && (msg.includes('enable') || msg.includes('not enabled'))) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-400">
        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
        <span>
          Connect is not enabled.{' '}
          <a
            href="https://dashboard.stripe.com/settings/connect"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Enable it in Stripe settings
          </a>
        </span>
      </div>
    )
  }

  return null
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
  const [failedExpanded, setFailedExpanded] = useState(false)

  const activeAccounts = accounts.filter((a) => a.status === 'active' || a.status === 'assigned')
  const failedAccounts = accounts.filter((a) => a.status === 'failed')
  const activeCount = activeAccounts.length
  const failedCount = failedAccounts.length

  function handleRetry() {
    startRetry(async () => {
      try {
        const res = await retryFailedAccounts(eventId)
        if (res.failed > 0) {
          toast.error(`${res.created} provisioned, ${res.failed} still failing.`)
        } else {
          toast.success(`Provisioned ${res.created} accounts successfully.`)
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
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CircleAlert className="size-4 shrink-0 text-destructive" />
                {activeCount} of {accounts.length} accounts provisioned successfully
              </p>
              <p className="ml-6 mt-0.5 text-xs text-muted-foreground">
                {failedCount} account{failedCount === 1 ? '' : 's'} failed. Expand below for details.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
            >
              <RefreshCw
                className={`size-3.5 ${retrying ? 'animate-spin' : ''}`}
              />
              {retrying ? 'Retrying…' : `Retry ${failedCount} failed`}
            </Button>
          </div>

          {/* Collapsible failed account list */}
          <button
            onClick={() => setFailedExpanded(!failedExpanded)}
            className="mt-3 flex w-full items-center gap-1.5 border-t border-destructive/20 pt-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {failedExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            {failedExpanded ? 'Hide' : 'Show'} failed account details
          </button>

          {failedExpanded && (
            <ul className="mt-2 flex flex-col gap-2">
              {failedAccounts.map((a) => (
                <li
                  key={a.id}
                  className="rounded border border-destructive/20 bg-background px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{a.businessName}</span>
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] text-destructive">
                      {a.errorCode || 'unknown'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {a.errorMessage || 'No error details available'}
                  </p>
                  <ErrorHelpText errorMessage={a.errorMessage} errorCode={a.errorCode} />
                </li>
              ))}
            </ul>
          )}
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
                  {a.stripeAccountId ? (
                    <button
                      onClick={() => copyId(a.stripeAccountId)}
                      className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {a.stripeAccountId}
                      {copied === a.stripeAccountId ? (
                        <Check className="size-3 text-success" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  ) : (
                    <p className="text-xs text-destructive">
                      {a.errorMessage || 'provisioning failed'}
                    </p>
                  )}
                </div>
                {a.status === 'active' || a.status === 'assigned' ? (
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
                    View account <ExternalLink className="size-3.5" />
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
                No accounts match "{query}".
              </li>
            )}
          </ul>
        </>
      )}
    </Card>
  )
}
