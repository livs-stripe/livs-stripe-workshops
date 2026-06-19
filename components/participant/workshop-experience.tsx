'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { submitModule, leaveWorkshop } from '@/app/actions/participant'
import {
  MODULES,
  getModule,
  getAttackWaveType,
  TOTAL_POSSIBLE_SCORE,
} from '@/lib/workshop-content'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { getTheme } from '@/lib/themes'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Trophy,
  Crown,
  Lock,
  Check,
  CircleDot,
  AlertTriangle,
  LogOut,
  ArrowRight,
  Target,
  ShieldAlert,
} from 'lucide-react'
import { SessionEndedChallenge } from '@/components/participant/session-ended'
import {
  SessionTimerChip,
  SessionEndingBanner,
} from '@/components/participant/session-timer'

type Participant = {
  id: string
  name: string
  score: number
  currentModule: number
}
type EventRow = {
  id: string
  name: string
  description: string | null
  status: string
  eventType: string
  eventTheme: string
  sessionEndsAt: string
  createdAt: string
  durationMinutes: number
}
type ProgressRow = { moduleId: string; status: string; score: number }
type Wave = { id: string; waveType: string; label: string; firedAt: string }
type LeaderRow = {
  id: string
  name: string
  company: string | null
  score: number
  currentModule: number
}

type LivePayload = {
  roster: LeaderRow[]
  waves: Wave[]
  meId: string
  event: {
    id: string
    name: string
    status: string
    eventType: string
    sessionEndsAt: string
    createdAt: string
    durationMinutes: number
  }
}

type InitialData = {
  participant: Participant
  event: EventRow
  progress: ProgressRow[]
  waves: Wave[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function WorkshopExperience({
  initialData,
}: {
  initialData: InitialData
}) {
  const router = useRouter()
  const { participant, event } = initialData
  const eventTheme = getTheme(event.eventTheme)
  const EventThemeIcon = eventTheme?.Icon

  const [progress, setProgress] = useState<ProgressRow[]>(initialData.progress)
  const [score, setScore] = useState(participant.score)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{
    moduleId: string
    correct: number
    totalQuestions: number
    earned: number
    results: Record<string, boolean>
  } | null>(null)
  const [pending, startTransition] = useTransition()
  const [leaving, startLeave] = useTransition()

  const completed = useMemo(
    () =>
      new Set(
        progress.filter((p) => p.status === 'completed').map((p) => p.moduleId),
      ),
    [progress],
  )

  // First not-yet-completed module is the default selection.
  const firstIncomplete =
    MODULES.find((m) => !completed.has(m.id)) ?? MODULES[MODULES.length - 1]
  const [selectedId, setSelectedId] = useState(firstIncomplete.id)
  const selected = getModule(selectedId)!

  // Live roster, waves, and session clock (poll ~30s for end-of-session sync).
  const { data: live } = useSWR<LivePayload>('/api/workshop/live', fetcher, {
    fallbackData: {
      roster: [],
      waves: initialData.waves,
      meId: participant.id,
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
        eventType: event.eventType,
        sessionEndsAt: event.sessionEndsAt,
        createdAt: event.createdAt,
        durationMinutes: event.durationMinutes,
      },
    },
    refreshInterval: 30_000,
  })

  const roster = live?.roster ?? []
  const activeWaves = live?.waves ?? []
  const sessionClock =
    live?.event?.sessionEndsAt ?? event.sessionEndsAt

  function isUnlocked(order: number) {
    if (order === 1) return true
    const prev = MODULES.find((m) => m.order === order - 1)
    return prev ? completed.has(prev.id) : false
  }

  function selectModule(id: string, order: number) {
    if (!isUnlocked(order)) {
      toast.error('Finish the earlier module in this session to unlock this one.')
      return
    }
    setSelectedId(id)
    setAnswers({})
    setResult(null)
  }

  function handleSubmit() {
    if (Object.keys(answers).length < selected.questions.length) {
      toast.error('Answer every question before submitting.')
      return
    }
    startTransition(async () => {
      const res = await submitModule(selected.id, answers)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      if (res?.ok) {
        setResult({ moduleId: selected.id, ...res })
        setProgress((prev) => {
          const next = prev.filter((p) => p.moduleId !== selected.id)
          next.push({
            moduleId: selected.id,
            status: 'completed',
            score: res.earned,
          })
          return next
        })
        // Recompute total locally from best-per-module.
        setScore((prevScore) => {
          const map = new Map(progress.map((p) => [p.moduleId, p.score]))
          map.set(
            selected.id,
            Math.max(map.get(selected.id) ?? 0, res.earned),
          )
          return Array.from(map.values()).reduce((a, b) => a + b, 0)
        })
        toast.success(
          `Module complete — ${res.correct}/${res.totalQuestions} correct, +${res.earned} pts`,
        )
        router.refresh()
      }
    })
  }

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
    })
  }

  const completedCount = completed.size
  const overallPct = Math.round((score / TOTAL_POSSIBLE_SCORE) * 100)
  const myRank =
    roster.findIndex((r) => r.id === (live?.meId ?? participant.id)) + 1

  if (live?.event?.status === 'ended') {
    return (
      <SessionEndedChallenge
        eventName={live.event.name}
        roster={roster}
        myId={live.meId}
        myScore={score}
      />
    )
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <StripeWordmark className="h-5 w-auto" />
            {eventTheme && EventThemeIcon && (
              <>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground sm:flex">
                  <EventThemeIcon className="size-3.5 shrink-0" aria-hidden />
                  {eventTheme.title}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <SessionTimerChip sessionEndsAtIso={sessionClock} />
            <div className="text-right">
              <div className="font-mono text-sm font-semibold text-primary">
                {score} pts
              </div>
              <div className="text-[11px] text-muted-foreground">
                {myRank > 0 ? `Rank #${myRank}` : 'Unranked'} · {participant.name}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              disabled={leaving}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <SessionEndingBanner sessionEndsAtIso={sessionClock} />

      {activeWaves.length > 0 ? (
        <div className="border-b border-destructive/40 bg-destructive/10">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
            <span className="flex size-7 shrink-0 animate-pulse items-center justify-center rounded-md bg-destructive/20 text-destructive">
              <ShieldAlert className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-destructive">
                Live attack in progress: {activeWaves.map((w) => w.label).join(', ')}
              </p>
              <p className="truncate text-xs text-destructive/80">
                {getAttackWaveType(activeWaves[0].waveType)?.defense ??
                  'Identify the attack type and respond.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr_260px]">
        {/* Module navigation */}
        <aside className="lg:order-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Modules
            </h2>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{MODULES.length}
            </span>
          </div>
          <Progress value={overallPct} className="mb-4 h-1.5" />
          <nav className="grid gap-1.5">
            {MODULES.map((m) => {
              const done = completed.has(m.id)
              const unlocked = isUnlocked(m.order)
              const isActive = m.id === selectedId
              return (
                <button
                  key={m.id}
                  onClick={() => selectModule(m.id, m.order)}
                  className={[
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    isActive
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border bg-card hover:bg-accent',
                    !unlocked && 'opacity-55',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="shrink-0">
                    {done ? (
                      <Check className="size-4 text-primary" />
                    ) : unlocked ? (
                      <CircleDot className="size-4 text-muted-foreground" />
                    ) : (
                      <Lock className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {m.title}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {m.points} pts
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Module content */}
        <section className="lg:order-2">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                MODULE {String(selected.order).padStart(2, '0')}
              </span>
              {completed.has(selected.id) ? (
                <Badge variant="secondary" className="text-primary">
                  <Check className="mr-1 size-3" /> Completed
                </Badge>
              ) : (
                <Badge variant="secondary">{selected.points} pts</Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {selected.title}
            </h1>
            <p className="mt-1 text-muted-foreground">{selected.tagline}</p>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/90">
              {selected.briefing.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Target className="size-4 text-primary" /> Learning objectives
              </h3>
              <ul className="grid gap-1.5 text-sm text-muted-foreground">
                {selected.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Quiz */}
          <Card className="mt-4 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Challenge</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Answer all questions to complete this module and earn points.
            </p>

            <div className="grid gap-6">
              {selected.questions.map((q, qi) => {
                const chosen = answers[q.id]
                const graded = result?.moduleId === selected.id
                const wasCorrect = graded ? result?.results[q.id] : undefined
                return (
                  <div key={q.id}>
                    <p className="mb-3 text-sm font-medium">
                      {qi + 1}. {q.prompt}
                    </p>
                    <div className="grid gap-2">
                      {q.options.map((opt) => {
                        const isChosen = chosen === opt.id
                        const isAnswer = opt.id === q.correctOptionId
                        let cls =
                          'border-border bg-card hover:bg-accent'
                        if (graded) {
                          if (isAnswer)
                            cls = 'border-primary/60 bg-primary/10'
                          else if (isChosen && !isAnswer)
                            cls = 'border-destructive/60 bg-destructive/10'
                        } else if (isChosen) {
                          cls = 'border-primary/60 bg-primary/10'
                        }
                        return (
                          <button
                            key={opt.id}
                            disabled={graded || pending}
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [q.id]: opt.id }))
                            }
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${cls}`}
                          >
                            <span
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                isChosen
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40 text-muted-foreground'
                              }`}
                            >
                              {opt.id.toUpperCase()}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        )
                      })}
                    </div>
                    {graded ? (
                      <p
                        className={`mt-2 flex items-start gap-2 text-xs ${
                          wasCorrect ? 'text-primary' : 'text-destructive'
                        }`}
                      >
                        {wasCorrect ? (
                          <Check className="mt-0.5 size-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        )}
                        {q.explanation}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              {result?.moduleId === selected.id ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Scored{' '}
                    <span className="font-medium text-foreground">
                      {result.correct}/{result.totalQuestions}
                    </span>{' '}
                    · +{result.earned} pts
                  </p>
                  {(() => {
                    const next = MODULES.find(
                      (m) => m.order === selected.order + 1,
                    )
                    return next ? (
                      <Button
                        onClick={() => selectModule(next.id, next.order)}
                      >
                        Next module <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-primary">
                        <Trophy className="mr-1 size-3" /> All modules done
                      </Badge>
                    )
                  })()}
                </>
              ) : (
                <Button onClick={handleSubmit} disabled={pending}>
                  {pending ? 'Grading…' : 'Submit answers'}
                </Button>
              )}
            </div>
          </Card>
        </section>

        {/* Live leaderboard */}
        <aside className="lg:order-3">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Live leaderboard
            </h2>
          </div>
          <Card className="divide-y divide-border p-0">
            {roster.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Waiting for scores…
              </p>
            ) : (
              roster.slice(0, 10).map((r, i) => {
                const me = r.id === (live?.meId ?? participant.id)
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      me ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span
                      className={`w-5 text-center font-mono text-xs ${
                        i === 0 ? 'text-warning' : 'text-muted-foreground'
                      }`}
                    >
                      {i === 0 ? <Crown className="mx-auto size-3.5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.name}
                        {me ? (
                          <span className="ml-1 text-xs text-primary">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      {r.company ? (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {r.company}
                        </p>
                      ) : null}
                    </div>
                    <span className="font-mono text-sm font-semibold">
                      {r.score}
                    </span>
                  </div>
                )
              })
            )}
          </Card>
        </aside>
      </main>
    </div>
  )
}
