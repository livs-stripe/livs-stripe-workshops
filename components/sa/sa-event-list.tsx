'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateEventDialog } from '@/components/sa/create-event-dialog'
import { getTheme, THEMES } from '@/lib/themes'
import {
  Users,
  ArrowRight,
  Inbox,
  BookOpen,
  Trophy,
  CalendarPlus,
  Radio,
  Layers,
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
  createdAt: Date
  participantCount: number
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(d))
}

type TypeFilter = 'all' | 'workshop' | 'challenge'

export function SaEventList({ events }: { events: EventRow[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [themeFilter, setThemeFilter] = useState<string>('all')

  const stats = useMemo(() => {
    const totalParticipants = events.reduce(
      (s, e) => s + (e.participantCount ?? 0),
      0,
    )
    const active = events.filter((e) => e.status === 'active').length
    const themesUsed = new Set(events.map((e) => e.eventTheme)).size
    return {
      totalEvents: events.length,
      totalParticipants,
      active,
      themesUsed,
    }
  }, [events])

  // Only offer theme filters for themes that actually have events.
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

  const statCards = [
    { label: 'Total events created', value: stats.totalEvents, icon: CalendarPlus },
    {
      label: 'Total participants reached',
      value: stats.totalParticipants,
      icon: Users,
    },
    { label: 'Active sessions right now', value: stats.active, icon: Radio },
    { label: 'Themes used', value: stats.themesUsed, icon: Layers },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-1 text-muted-foreground">
            Create and run guided workshops or gamified challenges for your
            customers.
          </p>
        </div>
        <CreateEventDialog />
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-4" />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {s.value}
            </p>
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
              Create your first workshop or challenge to generate an access code.
            </p>
          </div>
          <CreateEventDialog />
        </Card>
      ) : (
        <>
          {/* Filters */}
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
                  label: `${t.icon} ${t.title}`,
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => {
                const theme = getTheme(event.eventTheme)
                return (
                  <Link key={event.id} href={`/sa/events/${event.id}`}>
                    <Card className="h-full p-5 transition-colors hover:border-primary/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="gap-1">
                            {event.eventType === 'workshop' ? (
                              <BookOpen className="size-3" />
                            ) : (
                              <Trophy className="size-3" />
                            )}
                            {event.eventType === 'workshop'
                              ? 'Workshop'
                              : 'Challenge'}
                          </Badge>
                          {theme && (
                            <Badge variant="secondary" className="gap-1">
                              <span aria-hidden>{theme.icon}</span>
                              {theme.title}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant={
                            event.status === 'active' ? 'success' : 'secondary'
                          }
                        >
                          {event.status === 'active' ? (
                            <>
                              <span className="size-1.5 rounded-full bg-success" />
                              Active
                            </>
                          ) : (
                            'Ended'
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
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {event.customerName}
                        </p>
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
                          {event.participantCount === 1
                            ? 'participant'
                            : 'participants'}
                        </span>
                        <span className="flex items-center gap-1 text-foreground">
                          Open <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Created {formatDate(event.createdAt)}
                      </p>
                    </Card>
                  </Link>
                )
              })}
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
