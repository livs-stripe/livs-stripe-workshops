'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateEventDialog } from '@/components/sa/create-event-dialog'
import { getTheme, THEMES } from '@/lib/themes'
import {
  isParticipantDataExpired,
  msUntilParticipantDataDeletion,
} from '@/lib/event-retention'
import {
  Users,
  ArrowRight,
  Inbox,
  BookOpen,
  Trophy,
  Radio,
  CalendarPlus,
} from 'lucide-react'

type EventRow = {
  id: string
  name: string
  description: string | null
  accessCode: string
  status: string
  eventType: string
  eventTheme: string
  customerName: string | null
  createdAt: Date | string
  endedAt: Date | string | null
  sessionEndsAt: Date | string | null
  durationMinutes: number
  participantCount: number
}

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(d))
}

function dataExpiryLabel(endedAt: Date | string | null) {
  if (!endedAt) return null
  if (isParticipantDataExpired(endedAt)) return 'Expired'
  const ms = msUntilParticipantDataDeletion(endedAt)
  const days = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
  return days === 0 ? 'Expires today' : `Data expires in ${days} day${days === 1 ? '' : 's'}`
}

type TypeFilter = 'all' | 'workshop' | 'challenge'

export function SaEventList({
  events,
  counts,
}: {
  events: EventRow[]
  counts: { activeEvents: number; totalEvents: number }
}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [themeFilter, setThemeFilter] = useState<string>('all')

  const themesWithEvents = useMemo(() => {
    const ids = new Set(events.map((e) => e.eventTheme))
    return THEMES.filter((t) => ids.has(t.id))
  }, [events])

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (typeFilter === 'all' || e.eventType === typeFilter) &&
          (themeFilter === 'all' || e.eventTheme === themeFilter),
      ),
    [events, typeFilter, themeFilter],
  )

  const activeList = useMemo(
    () =>
      filtered
        .filter((e) => e.status === 'active')
        .sort((a, b) => {
          const endA = a.sessionEndsAt
            ? new Date(a.sessionEndsAt).getTime()
            : new Date(a.createdAt).getTime() + a.durationMinutes * 60_000
          const endB = b.sessionEndsAt
            ? new Date(b.sessionEndsAt).getTime()
            : new Date(b.createdAt).getTime() + b.durationMinutes * 60_000
          return endA - endB
        }),
    [filtered],
  )

  const completedList = useMemo(
    () =>
      filtered
        .filter((e) => e.status === 'ended')
        .sort(
          (a, b) =>
            new Date(b.endedAt ?? b.createdAt).getTime() -
            new Date(a.endedAt ?? a.createdAt).getTime(),
        ),
    [filtered],
  )

  const statCards = [
    { label: 'Active events right now', value: counts.activeEvents, icon: Radio },
    {
      label: 'Events created (all time)',
      value: counts.totalEvents,
      icon: CalendarPlus,
    },
  ]

  function EventCard({ event }: { event: EventRow }) {
    const theme = getTheme(event.eventTheme)
    const ThemeIcon = theme?.Icon
    const expired = event.status === 'ended' && isParticipantDataExpired(event.endedAt)
    const expiryText = event.status === 'ended' ? dataExpiryLabel(event.endedAt) : null
    const msLeft = event.endedAt ? msUntilParticipantDataDeletion(event.endedAt) : Infinity
    const urgentExpiry =
      event.status === 'ended' &&
      !expired &&
      msLeft < 7 * 24 * 60 * 60 * 1000

    const inner = (
      <Card className="h-full p-5 transition-colors hover:border-primary/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1">
              {event.eventType === 'workshop' ? (
                <BookOpen className="size-3" />
              ) : (
                <Trophy className="size-3" />
              )}
              {event.eventType === 'workshop' ? 'Workshop' : 'Challenge'}
            </Badge>
            {theme && ThemeIcon && (
              <Badge variant="secondary" className="gap-1">
                <ThemeIcon className="size-3 shrink-0" />
                {theme.title}
              </Badge>
            )}
          </div>
          <Badge
            variant={event.status === 'active' ? 'success' : 'secondary'}
            className="gap-1"
          >
            {event.status === 'active' ? (
              <>
                <span className="size-1.5 rounded-full bg-success" />
                Live
              </>
            ) : (
              'Completed'
            )}
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{event.name}</h2>
          <span className="shrink-0 font-mono text-sm tracking-[0.2em] text-foreground">
            {event.accessCode}
          </span>
        </div>
        {event.customerName && (
          <p className="mt-0.5 text-sm text-muted-foreground">{event.customerName}</p>
        )}
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {event.participantCount}{' '}
            {event.participantCount === 1 ? 'in this session' : 'in this session'}
          </span>
          <span className="flex items-center gap-1 text-foreground">
            {expired ? 'View' : 'Open'} <ArrowRight className="size-3.5" />
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {event.status === 'active'
            ? `Created ${formatDate(event.createdAt)}`
            : `Ended ${formatDate(event.endedAt ?? event.createdAt)}`}
        </p>
        {expiryText && (
          <p
            className={`mt-2 text-xs ${
              expired
                ? 'text-muted-foreground line-through'
                : urgentExpiry
                  ? 'font-medium text-warning'
                  : 'text-muted-foreground'
            }`}
          >
            {expiryText}
          </p>
        )}
      </Card>
    )

    if (expired) {
      return (
        <div
          key={event.id}
          title="Participant data has been deleted for this event."
          className="block cursor-not-allowed opacity-60"
        >
          {inner}
        </div>
      )
    }

    return (
      <Link key={event.id} href={`/sa/events/${event.id}`}>
        {inner}
      </Link>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live sessions</h1>
          <p className="mt-1 text-muted-foreground">
            Create a temporary room, share the code, run the workshop or challenge.
            When the session ends, the room closes—this is not a CRM.
          </p>
        </div>
        <CreateEventDialog />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-2">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-4" />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Inbox className="size-6" />
          </span>
          <div>
            <p className="font-medium">No sessions yet</p>
            <p className="text-sm text-muted-foreground">
              Create a session to generate an access code for your participants.
            </p>
          </div>
          <CreateEventDialog />
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterGroup
              label="Type"
              options={[
                { value: 'all', label: 'All types' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'challenge', label: 'Challenge' },
              ]}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
            />
            <FilterGroup
              label="Theme"
              options={[
                { value: 'all', label: 'All themes' },
                ...themesWithEvents.map((t) => ({
                  value: t.id,
                  label: t.title,
                })),
              ]}
              value={themeFilter}
              onChange={setThemeFilter}
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="px-6 py-12 text-center text-sm text-muted-foreground">
              No sessions match these filters.
            </Card>
          ) : (
            <div className="flex flex-col gap-10">
              {activeList.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
                    Active now
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeList.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}
              {completedList.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                    Completed (last 30 days)
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
                    {completedList.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-caps text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              value === o.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
