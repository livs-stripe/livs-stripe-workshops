/**
 * Client-side utilities for resilient polling at scale.
 * Handles staggered intervals, visibility-pause, and exponential backoff on errors.
 */

/**
 * Random initial delay (0–5s) to stagger 50 concurrent participants
 * so they don't all hit the API at the same millisecond.
 */
export function staggeredDelay(): number {
  return Math.floor(Math.random() * 5000)
}

/**
 * SWR-compatible fetcher with silent error handling.
 * Returns null on network failures instead of throwing (avoids error screens).
 */
export async function resilientFetcher<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Exponential backoff intervals for failed polls.
 * Sequence: 2s, 4s, 8s, then cap at 30s.
 */
export function backoffInterval(failCount: number): number {
  if (failCount <= 0) return 2000
  if (failCount === 1) return 4000
  if (failCount === 2) return 8000
  return 30000
}

/**
 * Returns true if the document is currently visible.
 * Used with Page Visibility API to pause polling when tab is hidden.
 */
export function isPageVisible(): boolean {
  if (typeof document === 'undefined') return true
  return document.visibilityState === 'visible'
}

/**
 * Session recovery: store/retrieve session data from sessionStorage.
 */
const SESSION_KEY = 'workshop_session'

export type SessionData = {
  eventId: string
  participantEmail: string
  participantId: string
}

export function saveSession(data: SessionData): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function loadSession(): SessionData | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionData
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
