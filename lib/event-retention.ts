/** Client-safe helpers for session end time and 30-day participant data retention. */

export const PARTICIPANT_DATA_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export type EventTimingFields = {
  createdAt: Date | string
  durationMinutes: number
  sessionEndsAt: Date | string | null
  endedAt?: Date | string | null
}

function asDate(v: Date | string | null | undefined): Date | null {
  if (v == null) return null
  return v instanceof Date ? v : new Date(v)
}

export function getSessionEndsAt(e: EventTimingFields): Date {
  const explicit = asDate(e.sessionEndsAt)
  if (explicit) return explicit
  const created = asDate(e.createdAt)!
  return new Date(created.getTime() + e.durationMinutes * 60 * 1000)
}

export function participantDataExpiresAt(
  endedAt: Date | string | null | undefined,
): Date | null {
  const end = asDate(endedAt)
  if (!end) return null
  return new Date(end.getTime() + PARTICIPANT_DATA_RETENTION_MS)
}

export function isParticipantDataExpired(
  endedAt: Date | string | null | undefined,
): boolean {
  const exp = participantDataExpiresAt(endedAt)
  if (!exp) return false
  return Date.now() > exp.getTime()
}

export function msUntilParticipantDataDeletion(
  endedAt: Date | string | null | undefined,
): number {
  const exp = participantDataExpiresAt(endedAt)
  if (!exp) return Number.POSITIVE_INFINITY
  return Math.max(0, exp.getTime() - Date.now())
}
