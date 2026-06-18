'use client'

import { useState, useTransition } from 'react'
import useSWR from 'swr'
import { fireAttackWave, setEventStatus } from '@/app/actions/events'
import { ATTACK_WAVE_TYPES } from '@/lib/workshop-content'
import { MODULES, TOTAL_POSSIBLE_SCORE } from '@/lib/workshop-content'
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
} from 'lucide-react'

type Participant = {
  id: string
  name: string
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
}

type Detail = {
  event: EventRow
  roster: Participant[]
  waves: Wave[]
  accounts: ConnectedAccount[]
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

export function EventConsole({ initialData }: { initialData: Detail }) {
  const { data } = useSWR<Detail>(
    `/api/sa/events/${initialData.event.id}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 4000,
    },
  )

  const detail = data ?? initialData
  const { event, roster, waves, accounts } = detail
  const isWorkshop = event.eventType === 'workshop'
  const [copied, setCopied] = useState(false)
  const [firing, setFiring] = useState<string | null>(null)
  const [statusPending, startStatus] = useTransition()

  const totalParticipants = roster.length
  const avgScore =
    totalParticipants > 0
      ? Math.round(
          roster.reduce((s, p) => s + p.score, 0) / totalParticipants,
        )
      : 0
  const completedAll = roster.filter(
    (p) => p.currentModule >= MODULES.length,
  ).length
  const avgProgressPct =
    totalParticipants > 0
      ? Math.round(
          (roster.reduce(
            (s, p) => s + Math.min(p.currentModule, MODULES.length),
            0,
          ) /
            (totalParticipants * MODULES.length)) *
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

  function toggleStatus() {
    const next = event.status === 'active' ? 'ended' : 'active'
    startStatus(async () => {
      try {
        await setEventStatus(event.id, next)
        toast.success(next === 'ended' ? 'Workshop ended' : 'Workshop reopened')
      } catch {
        toast.error('Could not update status')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Session header */}
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
            <h1 className="text-xl font-semibold tracking-tight">
              {event.name}
            </h1>
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
          <p className="label-caps mb-1 text-muted-foreground">
            Facilitator notes
          </p>
          <p className="text-sm leading-relaxed">{event.facilitatorNotes}</p>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-sm">Participants</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {totalParticipants}
          </p>
        </Card>
        {isWorkshop ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="size-4" />
              <span className="text-sm">Avg progress</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {avgProgressPct}
              <span className="text-sm font-normal text-muted-foreground">
                %
              </span>
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
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {completedAll}
          </p>
        </Card>
        {isWorkshop ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span className="text-sm">Modules</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {MODULES.length}
            </p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Swords className="size-4" />
              <span className="text-sm">Waves fired</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {waves.length}
            </p>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leaderboard */}
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              {isWorkshop ? (
                <>
                  <Users className="size-4 text-primary" /> Participant progress
                </>
              ) : (
                <>
                  <Trophy className="size-4 text-primary" /> Live leaderboard
                </>
              )}
            </h2>
            <div className="flex items-center gap-3">
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
              Waiting for participants to join with code{' '}
              <span className="font-mono text-foreground">
                {event.accessCode}
              </span>
              …
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {roster.map((p, i) => {
                const moduleNum = Math.min(p.currentModule, MODULES.length)
                const progressPct = (moduleNum / MODULES.length) * 100
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-secondary/50"
                  >
                    <span
                      className={`flex w-6 justify-center font-mono text-sm font-semibold tabular-nums ${
                        isWorkshop ? 'text-muted-foreground' : rankColor(i)
                      }`}
                    >
                      {!isWorkshop && i === 0 ? (
                        <Crown className="size-4" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.company ?? 'No company'} · Module{' '}
                        {Math.min(p.currentModule + 1, MODULES.length)} of{' '}
                        {MODULES.length}
                      </p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Progress
                        value={
                          isWorkshop
                            ? progressPct
                            : (p.score / TOTAL_POSSIBLE_SCORE) * 100
                        }
                        className="h-1.5"
                      />
                    </div>
                    <span className="w-14 text-right font-mono text-sm font-semibold tabular-nums">
                      {isWorkshop ? `${moduleNum}/${MODULES.length}` : p.score}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Workshop module overview */}
        {isWorkshop ? (
          <Card className="p-5">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <BookOpen className="size-4 text-primary" /> Workshop modules
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Participants work through these at their own pace.
            </p>
            <ol className="flex flex-col gap-2">
              {MODULES.map((m, idx) => {
                const onOrPast = roster.filter(
                  (p) => p.currentModule > idx,
                ).length
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
              Push a live fraud scenario to every participant&apos;s dashboard.
            </p>
            <div className="flex flex-col gap-2">
              {ATTACK_WAVE_TYPES.map((t) => (
                <button
                  key={t.id}
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
                Reopen the workshop to fire waves.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Recent waves</h2>
            {waves.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No attack waves fired yet.
              </p>
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
                      <span
                        className={
                          w.active ? 'text-destructive' : 'text-success'
                        }
                      >
                        {w.active ? 'Firing' : 'Resolved'}
                      </span>
                      <span className="text-muted-foreground">
                        {timeAgo(w.firedAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        )}
      </div>

      {/* Connected accounts */}
      <ConnectedAccountsPanel eventId={event.id} accounts={accounts} />

      {/* Footer controls */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Access code</span>
          <button
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
        <Button
          variant={event.status === 'active' ? 'outline' : 'default'}
          onClick={toggleStatus}
          disabled={statusPending}
        >
          <Power className="size-4" />
          {event.status === 'active'
            ? `End ${event.eventType}`
            : `Reopen ${event.eventType}`}
        </Button>
      </Card>
    </div>
  )
}
