import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventDetail } from '@/app/actions/events'
import { EventConsole } from '@/components/sa/event-console'
import { ArrowLeft } from 'lucide-react'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getEventDetail(id)
  if (!detail) notFound()

  // Serialize Date objects to ISO strings for the client console.
  const initialData = {
    event: {
      id: detail.event.id,
      name: detail.event.name,
      description: detail.event.description,
      accessCode: detail.event.accessCode,
      status: detail.event.status,
      eventType: detail.event.eventType,
      customerName: detail.event.customerName,
      customerEmail: detail.event.customerEmail,
      facilitatorNotes: detail.event.facilitatorNotes,
    },
    roster: detail.roster.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      score: p.score,
      currentModule: p.currentModule,
      joinedAt: p.joinedAt.toISOString(),
    })),
    waves: detail.waves.map((w) => ({
      id: w.id,
      waveType: w.waveType,
      label: w.label,
      firedAt: w.firedAt.toISOString(),
      active: w.active,
    })),
    accounts: detail.accounts,
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
