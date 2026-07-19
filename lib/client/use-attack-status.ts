'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type AttackJobStatus = {
  status: 'queued' | 'processing' | 'complete' | 'failed'
  chargesFired: number
  chargesTotal: number
  chargesBlocked: number
  chargesSucceeded: number
  errorMessage: string | null
}

/**
 * Polls /api/attacks/status/[jobId] every 2s until the job completes or fails.
 * Returns live progress for the attack animation UI.
 */
export function useAttackStatus(jobId: string | null) {
  const [data, setData] = useState<AttackJobStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const startPolling = useCallback((id: string) => {
    setIsPolling(true)
    const poll = async () => {
      try {
        const res = await fetch(`/api/attacks/status/${id}`)
        if (!res.ok) return
        const status: AttackJobStatus = await res.json()
        setData(status)
        if (status.status === 'complete' || status.status === 'failed') {
          clearInterval(intervalRef.current)
          setIsPolling(false)
        }
      } catch {
        // Silent — will retry on next interval
      }
    }
    poll()
    intervalRef.current = setInterval(poll, 2000)
  }, [])

  useEffect(() => {
    if (jobId) startPolling(jobId)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [jobId, startPolling])

  return { data, isPolling }
}
