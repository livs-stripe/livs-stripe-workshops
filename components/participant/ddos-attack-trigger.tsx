'use client'

import { useState } from 'react'
import { Zap, Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

type Intensity = 'low' | 'medium' | 'high'

type DdosResult = {
  total_fired: number
  total_blocked: number
  total_succeeded: number
  total_amount_lost: number
  duration_ms: number
  block_rate: number
}

const INTENSITY_CONFIG = {
  low: { label: 'Low', charges: 20, desc: '20 charges, 300ms apart' },
  medium: { label: 'Medium', charges: 50, desc: '50 charges, 150ms apart' },
  high: { label: 'High', charges: 100, desc: '100 charges, 80ms apart' },
} as const

export function DdosAttackTrigger({
  participantId,
  eventId,
  title = 'Payment DDoS Simulation',
  description = '50 charges, 150ms apart, rotating IPs and cards. Your rules are live.',
  defaultIntensity = 'medium',
  showIntensitySelector = true,
  previewMode = false,
}: {
  participantId: string
  eventId: string
  title?: string
  description?: string
  defaultIntensity?: Intensity
  showIntensitySelector?: boolean
  previewMode?: boolean
}) {
  const [intensity, setIntensity] = useState<Intensity>(defaultIntensity)
  const [firing, setFiring] = useState(false)
  const [result, setResult] = useState<DdosResult | null>(null)

  async function handleFire() {
    setFiring(true)
    setResult(null)
    try {
      const res = await fetch('/api/attacks/ddos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, eventId, intensity }),
      })
      const data = await res.json()
      if (data.total_fired) {
        setResult(data)
      }
    } catch {
      // Network error
    } finally {
      setFiring(false)
    }
  }

  const config = INTENSITY_CONFIG[intensity]
  const blockRate = result?.block_rate ?? 0

  return (
    <Card className={`p-5 ${previewMode ? 'border-border' : 'border-destructive/30'}`}>
      <div className="mb-3 flex items-center gap-2">
        <Zap className={`size-4 ${previewMode ? 'text-primary' : 'text-destructive'}`} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>

      {showIntensitySelector && (
        <div className="mb-4 flex gap-2">
          {(Object.entries(INTENSITY_CONFIG) as [Intensity, typeof INTENSITY_CONFIG.low][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIntensity(key)}
                disabled={firing}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  intensity === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {cfg.label} ({cfg.charges})
              </button>
            ),
          )}
        </div>
      )}

      {firing && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin text-destructive" />
            <span className="text-muted-foreground">
              Firing {config.charges} charges at {config.desc.split(', ')[1]}...
            </span>
          </div>
          <Progress value={50} className="h-2 animate-pulse" />
        </div>
      )}

      {!firing && !result && (
        <button
          type="button"
          onClick={handleFire}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all ${
            previewMode
              ? 'border border-primary bg-white !text-primary hover:bg-primary/5'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Zap className="size-4" />
          {previewMode
            ? `Run low-intensity preview (${config.charges} charges)`
            : 'Fire DDoS Simulation'}
        </button>
      )}

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{result.total_fired}</p>
              <p className="text-[11px] text-muted-foreground">Fired</p>
            </div>
            <div className="rounded-md border border-success/30 bg-success/5 p-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-success">
                {result.total_blocked}
              </p>
              <p className="text-[11px] text-muted-foreground">Blocked</p>
            </div>
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-destructive">
                {result.total_succeeded}
              </p>
              <p className="text-[11px] text-muted-foreground">Got through</p>
            </div>
          </div>

          <div className="rounded-md border border-border p-3">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Block rate</span>
              <span className="font-mono font-semibold">{blockRate}%</span>
            </div>
            <Progress value={blockRate} className="h-2" />
          </div>

          {blockRate >= 80 && (
            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3">
              <Shield className="mt-0.5 size-4 text-success" />
              <div>
                <p className="text-sm font-medium text-success">Excellent defence.</p>
                <p className="text-xs text-muted-foreground">
                  The attacker gave up. +100 bonus points.
                </p>
              </div>
            </div>
          )}
          {blockRate < 40 && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="mt-0.5 size-4 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  The attacker found your gaps.
                </p>
                <p className="text-xs text-muted-foreground">
                  Review your rules and try again. -50 points.
                </p>
              </div>
            </div>
          )}

          {result.total_amount_lost > 0 && (
            <p className="text-xs text-muted-foreground">
              Amount lost: ${(result.total_amount_lost / 100).toFixed(2)} AUD across{' '}
              {result.total_succeeded} charges ({result.duration_ms}ms total)
            </p>
          )}

          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-2 w-full rounded-md border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Reset and try again
          </button>
        </div>
      )}
    </Card>
  )
}
