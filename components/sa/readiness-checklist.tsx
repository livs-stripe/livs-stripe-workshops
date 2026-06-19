'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'

type ReadinessCheck = {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

type ProvisionStatus = {
  total: number
  available: number
  assigned: number
  ready: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function StatusIcon({ status }: { status: 'pass' | 'fail' | 'warn' }) {
  if (status === 'pass')
    return <CheckCircle2 className="size-4 text-emerald-600" />
  if (status === 'fail') return <XCircle className="size-4 text-destructive" />
  return <AlertTriangle className="size-4 text-amber-500" />
}

export function ReadinessChecklist({
  eventId,
  accessCode,
  maxParticipants,
}: {
  eventId: string
  accessCode: string
  maxParticipants: number
}) {
  const [copied, setCopied] = useState(false)

  // Readiness checks
  const {
    data: readiness,
    isLoading,
    mutate,
  } = useSWR<{ checks: ReadinessCheck[]; allPassed: boolean }>(
    `/api/events/${eventId}/readiness`,
    fetcher,
    { refreshInterval: 10_000 },
  )

  // Provisioning progress (separate poll, 3s until complete)
  const { data: provision } = useSWR<ProvisionStatus>(
    `/api/events/${eventId}/provision-status`,
    fetcher,
    {
      refreshInterval: provision?.ready >= maxParticipants ? 0 : 3000,
    },
  )

  const provisionPct = provision
    ? Math.round((provision.ready / maxParticipants) * 100)
    : 0
  const isProvisioning = provision ? provision.ready < maxParticipants : true
  const allPassed = readiness?.allPassed ?? false

  async function handleCopy() {
    await navigator.clipboard.writeText(accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Capacity warning
  const assigned = provision?.assigned ?? 0
  const remaining = maxParticipants - assigned

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-semibold">Pre-flight Readiness</h3>

      {/* Provisioning progress */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Account provisioning
          </span>
          <span className="font-mono text-xs tabular-nums">
            {provision?.ready ?? 0} / {maxParticipants}
          </span>
        </div>
        <Progress value={provisionPct} className="h-2" />
        {isProvisioning && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Preparing participant Stripe accounts...
          </p>
        )}
      </div>

      {/* Checklist */}
      <ul className="mb-5 space-y-2.5">
        {isLoading ? (
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Running checks...
          </li>
        ) : (
          readiness?.checks.map((check) => (
            <li key={check.id} className="flex items-start gap-2.5">
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.detail}</p>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Capacity warning */}
      {assigned > 0 && remaining <= 5 && remaining > 0 && (
        <div className="mb-4 rounded-md border border-amber-300/50 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-950/20">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            {assigned}/{maxParticipants} accounts assigned — {remaining}{' '}
            remaining. New participants may experience a short wait.
          </p>
        </div>
      )}
      {assigned >= maxParticipants && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">
            Capacity reached. New join attempts will be queued.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          disabled={!allPassed}
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? 'Copied!' : `Copy Access Code: ${accessCode}`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          className="gap-1.5"
        >
          <RefreshCw className="size-3.5" /> Recheck
        </Button>
      </div>

      {!allPassed && (
        <p className="mt-2 text-xs text-muted-foreground">
          Access code sharing is disabled until all critical checks pass.
        </p>
      )}
    </Card>
  )
}
