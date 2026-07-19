'use client'

import { useEffect, useState, useTransition } from 'react'
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
  Plus,
} from 'lucide-react'
import { addEventCapacity } from '@/app/actions/events'

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

  // Provisioning progress (separate poll, 3s until complete then stop)
  const [provisionDone, setProvisionDone] = useState(false)
  const { data: provision } = useSWR<ProvisionStatus>(
    `/api/events/${eventId}/provision-status`,
    fetcher,
    { refreshInterval: provisionDone ? 0 : 3000 },
  )
  useEffect(() => {
    if (provision && provision.ready >= maxParticipants) {
      setProvisionDone(true)
    }
  }, [provision, maxParticipants])

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

  // Capacity tracking
  const assigned = provision?.assigned ?? 0
  const remaining = maxParticipants - assigned

  // Add capacity state
  const [showAddCapacity, setShowAddCapacity] = useState(false)
  const [additionalCount, setAdditionalCount] = useState(10)
  const [isPending, startTransition] = useTransition()
  const [addResult, setAddResult] = useState<string | null>(null)

  function handleAddCapacity() {
    setAddResult(null)
    startTransition(async () => {
      try {
        const result = await addEventCapacity(eventId, additionalCount)
        setAddResult(`Added ${additionalCount} accounts. New capacity: ${result.newMax}`)
        setShowAddCapacity(false)
        setProvisionDone(false)
      } catch (err) {
        setAddResult(err instanceof Error ? err.message : 'Failed to add capacity')
      }
    })
  }

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

      {/* Capacity warning + add capacity */}
      {assigned > 0 && remaining <= 5 && remaining > 0 && (
        <div className="mb-4 rounded-md border border-amber-300/50 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {assigned}/{maxParticipants} accounts assigned, {remaining} remaining.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1 text-xs"
              onClick={() => setShowAddCapacity(true)}
            >
              <Plus className="size-3" /> Add accounts
            </Button>
          </div>
        </div>
      )}
      {assigned >= maxParticipants && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-destructive">
              Capacity reached ({maxParticipants}/{maxParticipants} accounts assigned).
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => setShowAddCapacity(true)}
            >
              <Plus className="size-3" /> Add accounts
            </Button>
          </div>
        </div>
      )}

      {/* Add capacity dialog */}
      {showAddCapacity && (
        <div className="mb-4 rounded-lg border bg-card p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold">Add participant accounts</h4>
          <p className="mb-3 text-xs text-muted-foreground">
            New Stripe accounts will be provisioned and added to the pool. This takes about 1 second per account.
          </p>
          <div className="mb-3 flex items-center gap-3">
            <label htmlFor="addCount" className="text-sm text-muted-foreground whitespace-nowrap">
              Accounts to add
            </label>
            <select
              id="addCount"
              value={additionalCount}
              onChange={(e) => setAdditionalCount(Number(e.target.value))}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n} accounts
                </option>
              ))}
            </select>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Current capacity: {maxParticipants} &rarr; New capacity: {maxParticipants + additionalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddCapacity}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <><Loader2 className="size-3 animate-spin" /> Provisioning...</>
              ) : (
                <><Plus className="size-3" /> Add {additionalCount} accounts</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddCapacity(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add capacity result */}
      {addResult && (
        <div className={`mb-4 rounded-md p-3 text-xs ${
          addResult.startsWith('Added')
            ? 'border border-emerald-300/50 bg-emerald-50 text-emerald-800'
            : 'border border-destructive/30 bg-destructive/5 text-destructive'
        }`}>
          {addResult}
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
