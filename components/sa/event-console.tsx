'use client'

import { useEffect, useState, useTransition } from 'react'
import useSWR from 'swr'
import {
  fireAttackWave,
  setEventStatus,
  extendEventSession,
  endEventNow,
  exportParticipantsCsv,
} from '@/app/actions/events'
import { ATTACK_WAVE_TYPES, MODULES, TOTAL_POSSIBLE_SCORE } from '@/lib/workshop-content'
import { WORKSHOP_MODULES } from '@/lib/workshop-modules'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ConnectedAccountsPanel,
  type ConnectedAccount,
} from '@/components/sa/connected-accounts-panel'
import { toast } from 'sonner'
import {
  Users,
  Trophy,
  Swords,
  Zap,
  Copy,
  Check,
  Crown,
  Radio,
  Power,
  MonitorPlay,
  BookOpen,
  Clock,
  Download,
  PlusCircle,
} from 'lucide-react'

type Participant = {
  id: string
  name: string
  email: string | null
  company: string | null
  score: number
  currentModule: number
  joinedAt: string
}

type Wave = {
  id: string
  waveType: string
  label: string
  firedAt: string
  active: boolean
}

type EventRow = {
  id: string
  name: string
  description: string | null
  accessCode: string
  status: string
  eventType: string
  customerName: string | null
  customerEmail: string | null
  facilitatorNotes: string | null
  sessionEndsAt: string
  endedAt: string | null
  durationMinutes: number
  createdAt: string
}

type Detail = {
  event: EventRow
  roster: Participant[]
  waves: Wave[]
  accounts: ConnectedAccount[]
  participantDataExpired: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function rankColor(i: number) {
  if (i === 0) return 'text-gold'
  if (i === 1) return 'text-silver'
  if (i === 2) return 'text-bronze'
  return 'text-muted-foreground'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

function formatSaCountdown(ms: number) {
  if (ms <= 0) return 'Session ended'
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ss = sec % 60
  if (h > 0) return `${h}h ${mm}m`
  if (m > 0) return `${m}m ${ss}s`
  return `${ss}s`
}

export function EventConsole({ initialData }: { initialData: Detail }) {
  const { data } = useSWR<Detail>(`/api/sa/events/${initialData.event.id}`, fetcher, {
    fallbackData: initialData,
    refreshInterval: 5000,
  })

  const detail = data ?? initialData
  const { event, roster, waves, accounts, participantDataExpired } = detail
  const isWorkshop = event.eventType === 'workshop'
  const moduleLen = isWorkshop ? WORKSHOP_MODULES.length : MODULES.length

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const [copied, setCopied] = useState(false)
  const [firing, setFiring] = useState<string | null>(null)
  const [statusPending, startStatus] = useTransition()
  const [extendPending, startExtend] = useTransition()
  const [exportPending, startExport] = useTransition()

  const sessionEndMs = new Date(event.sessionEndsAt).getTime()
  const msLeft = event.status === 'active' ? sessionEndMs - now : 0
  const timerLabel =
    event.status === 'active' ? formatSaCountdown(msLeft) : 'Session ended'
  const timerUrgent = event.status === 'active' && msLeft > 0 && msLeft <= 10 * 60 * 1000
  const timerCritical = event.status === 'active' && msLeft > 0 && msLeft <= 2 * 60 * 1000

  const totalParticipants = roster.length
  const avgScore =
    totalParticipants > 0
      ? Math.round(roster.reduce((s, p) => s + p.score, 0) / totalParticipants)
      : 0
  const completedAll = roster.filter((p) => p.currentModule >= moduleLen).length
  const avgProgressPct =
    totalParticipants > 0
      ? Math.round(
          (roster.reduce(
            (s, p) => s + Math.min(p.currentModule, moduleLen),
            0,
          ) /
            (totalParticipants * moduleLen)) *
            100,
        )
      : 0

  async function copyCode() {
    await navigator.clipboard.writeText(event.accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleFire(typeId: string, label: string) {
    setFiring(typeId)
    try {
      await fireAttackWave(event.id, typeId)
      toast.success(`${label} wave fired`, {
        description: 'Participants will see the alert on their dashboard.',
      })
    } catch {
      toast.error('Could not fire attack wave')
    } finally {
      setFiring(null)
    }
  }

  function handleEndNow() {
    if (
      !window.confirm(
        'End this session now? Participants will immediately see the end screen.',
      )
    ) {
      return
    }
    startStatus(async () => {
      try {
        await endEventNow(event.id)
        toast.success('Session ended')
      } catch {
        toast.error('Could not end session')
      }
    })
  }

  function handleReopen() {
    startStatus(async () => {
      try {
        await setEventStatus(event.id, 'active')
        toast.success('Session reopened — new timer started from duration setting.')
      } catch {
        toast.error('Could not reopen session')
      }
    })
  }

  function handleExtend() {
    startExtend(async () => {
      try {
        await extendEventSession(event.id, 30)
        toast.success('Extended by 30 minutes')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not extend')
      }
    })
  }

  function handleExport() {
    if (participantDataExpired) {
      toast.error('Participant data has been deleted for this event.')
      return
    }
    startExport(async () => {
      try {
        const csv = await exportParticipantsCsv(event.id)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `participants-${event.accessCode}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Download started')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Export failed')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        className={`p-6 ${
          timerCritical
            ? 'border-destructive/50 bg-destructive/5'
            : timerUrgent
              ? 'border-warning/50 bg-warning/5'
              : 'border-primary/20 bg-primary/[0.03]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-caps text-muted-foreground">Session clock</p>
            <p
              className={`mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight ${
                timerCritical ? 'text-destructive' : timerUrgent ? 'text-warning' : 'text-foreground'
              }`}
            >
              {event.status === 'active' ? `Ends in ${timerLabel}` : timerLabel}
            </p>
            {timerCritical && event.status === 'active' && (
              <p className="mt-2 max-w-xl text-sm text-destructive">
                Session ending soon — participants will see an end screen automatically
                when time runs out.
              </p>
            )}
          </div>
          {event.status === 'active' && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExtend}
                disabled={extendPending}
              >
                <PlusCircle className="size-4" /> Extend 30 min
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleEndNow}
                disabled={statusPending}
              >
                <Power className="size-4" /> End session now
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {isWorkshop ? (
                <BookOpen className="size-3" />
              ) : (
                <Trophy className="size-3" />
              )}
              {isWorkshop ? 'Workshop' : 'Challenge'}
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>
          </div>
          {(event.customerName || event.customerEmail) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {event.customerName}
              {event.customerName && event.customerEmail ? ' · ' : ''}
              {event.customerEmail}
            </p>
          )}
        </div>
      </div>

      {event.facilitatorNotes && (
        <Card className="border-l-4 border-l-warning p-4">
          <p className="label-caps mb-1 text-muted-foreground">Facilitator notes</p>
          <p className="text-sm leading-relaxed">{event.facilitatorNotes}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-sm">In this session</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{totalParticipants}</p>
        </Card>
        {isWorkshop ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="size-4" />
              <span className="text-sm">Avg progress</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {avgProgressPct}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="size-4" />
              <span className="text-sm">Avg score</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {avgScore}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / {TOTAL_POSSIBLE_SCORE}
              </span>
            </p>
          </Card>
        )}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="size-4" />
            <span className="text-sm">Finished all</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{completedAll}</p>
        </Card>
        {isWorkshop ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span className="text-sm">Modules</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{moduleLen}</p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Swords className="size-4" />
              <span className="text-sm">Waves fired</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{waves.length}</p>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              {isWorkshop ? (
                <>
                  <Users className="size-4 text-primary" /> Participants (this event)
                </>
              ) : (
                <>
                  <Trophy className="size-4 text-primary" /> Live leaderboard
                </>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportPending || participantDataExpired}
                title={
                  participantDataExpired
                    ? 'Participant data has been deleted for this event.'
                    : undefined
                }
              >
                <Download className="size-4" /> Export CSV
              </Button>
              {!isWorkshop && (
                <a
                  href={`/projector/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  <MonitorPlay className="size-3.5" /> Projector view
                </a>
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Radio className="size-3 text-primary" /> Live
              </span>
            </div>
          </div>

          {roster.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Waiting for participants with code{' '}
              <span className="font-mono text-foreground">{event.accessCode}</span>…
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">#</th>
                    <th className="py-2 pr-2 font-medium">Email</th>
                    <th className="py-2 pr-2 font-medium">Display</th>
                    <th className="py-2 pr-2 font-medium">Joined</th>
                    <th className="py-2 pr-2 font-medium">Status</th>
                    {isWorkshop ? (
                      <th className="py-2 pr-2 font-medium">Modules</th>
                    ) : (
                      <th className="py-2 font-medium">Score</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p, i) => {
                    const moduleNum = Math.min(p.currentModule, moduleLen)
                    return (
                      <tr key={p.id} className="border-b border-border/80">
                        <td className="py-2 pr-2 font-mono text-muted-foreground">
                          {!isWorkshop && i === 0 ? <Crown className="size-4 text-gold" /> : i + 1}
                        </td>
                        <td className="max-w-[180px] truncate py-2 pr-2 font-mono text-xs">
                          {p.email ?? '—'}
                        </td>
                        <td className="max-w-[140px] truncate py-2 pr-2">{p.name}</td>
                        <td className="whitespace-nowrap py-2 pr-2 text-xs text-muted-foreground">
                          {timeAgo(p.joinedAt)}
                        </td>
                        <td className="py-2 pr-2 text-xs">
                          {event.status === 'active' ? (
                            <span className="text-success">In session</span>
                          ) : (
                            <span className="text-muted-foreground">Session ended</span>
                          )}
                        </td>
                        <td className="py-2 font-mono tabular-nums">
                          {isWorkshop ? `${moduleNum}/${moduleLen}` : p.score}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {isWorkshop ? (
          <Card className="p-5">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <BookOpen className="size-4 text-primary" /> Workshop modules
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Progress for this live session only.
            </p>
            <ol className="flex flex-col gap-2">
              {WORKSHOP_MODULES.map((m, idx) => {
                const onOrPast = roster.filter((p) => p.currentModule > idx).length
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {m.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {onOrPast}/{totalParticipants || 0} done
                    </span>
                  </li>
                )
              })}
            </ol>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            <Card className="p-5">
              <h2 className="mb-1 flex items-center gap-2 font-semibold">
                <Zap className="size-4 text-destructive" /> Fire attack wave
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Push a live scenario to every participant&apos;s dashboard.
              </p>
              <div className="flex flex-col gap-2">
                {ATTACK_WAVE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleFire(t.id, t.label)}
                    disabled={firing !== null || event.status !== 'active'}
                    className="group flex items-start gap-3 rounded-md border border-border p-3 text-left transition-colors hover:border-destructive/50 hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-destructive/15 text-destructive">
                      <Swords className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {firing === t.id ? 'Firing…' : t.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {event.status !== 'active' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Reopen the session to fire new waves.
                </p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 font-semibold">Recent waves</h2>
              {waves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attack waves fired yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {waves.slice(0, 6).map((w) => (
                    <li
                      key={w.id}
                      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${
                        w.active
                          ? 'border-destructive/40 bg-destructive/[0.04]'
                          : 'border-success/30 bg-success/[0.04]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {w.active ? (
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/70" />
                            <span className="relative inline-flex size-2 rounded-full bg-destructive" />
                          </span>
                        ) : (
                          <Check className="size-3.5 text-success" />
                        )}
                        <span className="font-medium">{w.label}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span className={w.active ? 'text-destructive' : 'text-success'}>
                          {w.active ? 'Firing' : 'Resolved'}
                        </span>
                        <span className="text-muted-foreground">{timeAgo(w.firedAt)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>

      <ConnectedAccountsPanel eventId={event.id} accounts={accounts} />

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Access code</span>
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-lg tracking-[0.3em] transition-colors hover:bg-secondary/70"
          >
            {event.accessCode}
            {copied ? (
              <Check className="size-4 text-primary" />
            ) : (
              <Copy className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>
        {event.status === 'active' ? (
          <p className="text-xs text-muted-foreground">
            Use &quot;End session now&quot; above to close the room, or let the timer run out.
          </p>
        ) : (
          <Button variant="default" onClick={handleReopen} disabled={statusPending}>
            <Clock className="size-4" /> Reopen session
          </Button>
        )}
      </Card>
    </div>
  )
}
