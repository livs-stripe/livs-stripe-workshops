export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventDetail } from '@/app/actions/events'
import { EventConsole } from '@/components/sa/event-console'
import { ArrowLeft } from 'lucide-react'
import { getSessionEndsAt } from '@/lib/event-retention'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let detail
  try {
    detail = await getEventDetail(id)
  } catch (err) {
    console.error('[EventDetailPage] getEventDetail failed:', err instanceof Error ? err.message : err)
    throw err
  }

  if (!detail) notFound()

  const { event, participantDataExpired } = detail
  const sessionEndsAt = getSessionEndsAt(event)

  const initialData = {
    event: {
      id: event.id,
      name: event.name ?? '',
      description: event.description ?? null,
      accessCode: event.accessCode,
      status: event.status,
      eventType: event.eventType,
      customerName: event.customerName ?? null,
      customerEmail: event.customerEmail ?? null,
      facilitatorNotes: event.facilitatorNotes ?? null,
      maxParticipants: event.maxParticipants,
      sessionEndsAt: sessionEndsAt.toISOString(),
      endedAt: event.endedAt?.toISOString() ?? null,
      durationMinutes: event.durationMinutes,
      createdAt: event.createdAt.toISOString(),
    },
    roster: (detail.roster ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      company: p.company ?? null,
      score: p.score ?? 0,
      currentModule: p.currentModule ?? 0,
      joinedAt: p.joinedAt.toISOString(),
    })),
    waves: (detail.waves ?? []).map((w) => ({
      id: w.id,
      waveType: w.waveType,
      label: w.label ?? w.waveType,
      firedAt: w.firedAt.toISOString(),
      active: w.active,
    })),
    accounts: detail.accounts ?? [],
    participantDataExpired,
  }

  return (
    <div>
      <Link
        href="/sa"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All sessions
      </Link>
      <EventConsole initialData={initialData} />
    </div>
  )
}
