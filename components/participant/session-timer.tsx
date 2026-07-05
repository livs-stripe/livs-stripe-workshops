'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0m 0s'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m >= 1440) {
    const d = Math.floor(m / 1440)
    const h = Math.floor((m % 1440) / 60)
    return h > 0 ? `${d}d ${h}h` : `${d}d`
  }
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return `${h}h ${mm}m`
  }
  if (m >= 1) return `${m}m ${s}s`
  return `${s}s`
}

export function useSessionCountdown(sessionEndsAtIso: string | undefined) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!sessionEndsAtIso) return { msLeft: 0, label: '—', urgent: false, critical: false }
  const end = new Date(sessionEndsAtIso).getTime()
  const msLeft = end - now
  return {
    msLeft,
    label: formatRemaining(msLeft),
    urgent: msLeft > 0 && msLeft <= 5 * 60 * 1000,
    critical: msLeft > 0 && msLeft <= 2 * 60 * 1000,
  }
}

/** Participant header — subtle session clock. */
export function SessionTimerChip({ sessionEndsAtIso }: { sessionEndsAtIso: string }) {
  const { msLeft, label, urgent } = useSessionCountdown(sessionEndsAtIso)
  if (msLeft <= 0) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
        urgent
          ? 'border-warning/40 bg-warning/10 text-warning'
          : 'border-border bg-muted text-muted-foreground'
      }`}
    >
      <Clock className="size-3 shrink-0" aria-hidden />
      Ends in {label}
    </span>
  )
}

export function SessionEndingBanner({ sessionEndsAtIso }: { sessionEndsAtIso: string }) {
  const { msLeft, label, urgent } = useSessionCountdown(sessionEndsAtIso)
  if (msLeft <= 0 || !urgent) return null
  return (
    <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-sm text-warning">
      <span className="font-medium">Session ending soon</span> — about {label} left in
      this live room. When time is up, this page will close automatically.
    </div>
  )
}
