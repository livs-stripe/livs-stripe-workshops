'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { saveWorkshopProgress, leaveWorkshop } from '@/app/actions/participant'
import { WORKSHOP_MODULES, SCORED_MODULES } from '@/lib/workshop-modules'
import { getTheme } from '@/lib/themes'
import { WorkshopCallout } from '@/components/participant/workshop-callout'
import { DashboardGif } from '@/components/participant/dashboard-gif'
import { DashboardLink } from '@/components/participant/dashboard-link'
import { NarrativeBlock } from '@/components/participant/narrative-block'
import { StripeDashboardButton } from '@/components/participant/stripe-dashboard-button'
import { DdosAttackTrigger } from '@/components/participant/ddos-attack-trigger'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { SessionEndedWorkshop } from '@/components/participant/session-ended'
import {
  SessionTimerChip,
  SessionEndingBanner,
} from '@/components/participant/session-timer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Check,
  CircleDot,
  Clock,
  LogOut,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Mail,
  Key,
} from 'lucide-react'

type Participant = { id: string; name: string }
type EventRow = {
  id: string
  name: string
  description: string | null
  customerName: string | null
  eventTheme: string
  status: string
  eventType: string
  sessionEndsAt: string
  createdAt: string
  durationMinutes: number
}
type ProgressRow = {
  moduleId: string
  completedSteps: number[]
  moduleDone: boolean
}
type InitialData = {
  participant: Participant
  event: EventRow
  wsProgress: ProgressRow[]
  facilitatorName: string
}

type LivePayload = {
  roster: unknown[]
  waves: unknown[]
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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function WorkshopDocument({ initialData }: { initialData: InitialData }) {
  const router = useRouter()
  const { participant, event, facilitatorName } = initialData
  const eventTheme = getTheme(event.eventTheme)
  const EventThemeIcon = eventTheme?.Icon

  const [progress, setProgress] = useState<Record<string, ProgressRow>>(() => {
    const m: Record<string, ProgressRow> = {}
    for (const p of initialData.wsProgress) m[p.moduleId] = p
    return m
  })
  const [, startSave] = useTransition()
  const [leaving, startLeave] = useTransition()

  const { data: live } = useSWR<LivePayload>('/api/workshop/live', fetcher, {
    fallbackData: {
      roster: [],
      waves: [],
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

  const sessionClock = live?.event?.sessionEndsAt ?? event.sessionEndsAt

  const doneModules = useMemo(
    () =>
      new Set(
        Object.values(progress)
          .filter((p) => p.moduleDone)
          .map((p) => p.moduleId),
      ),
    [progress],
  )

  const scoredDone = useMemo(
    () => SCORED_MODULES.filter((m) => doneModules.has(m.id)).length,
    [doneModules],
  )

  const firstIncomplete =
    WORKSHOP_MODULES.find((m) => !doneModules.has(m.id)) ??
    WORKSHOP_MODULES[WORKSHOP_MODULES.length - 1]
  const [selectedId, setSelectedId] = useState(firstIncomplete.id)
  const allDone = scoredDone === SCORED_MODULES.length

  if (live?.event?.status === 'ended') {
    return (
      <SessionEndedWorkshop
        eventName={live.event.name}
        facilitatorName={facilitatorName}
      />
    )
  }

  const selected = WORKSHOP_MODULES.find((m) => m.id === selectedId)!
  const selectedProgress = progress[selected.id]
  const completedSteps = new Set(selectedProgress?.completedSteps ?? [])

  function persist(moduleId: string, next: ProgressRow) {
    setProgress((prev) => ({ ...prev, [moduleId]: next }))
    startSave(async () => {
      const res = await saveWorkshopProgress({
        moduleId,
        completedSteps: next.completedSteps,
        moduleDone: next.moduleDone,
      })
      if (res?.error) toast.error(res.error)
      else router.refresh()
    })
  }

  function toggleStep(stepIndex: number) {
    const current = progress[selected.id] ?? {
      moduleId: selected.id,
      completedSteps: [],
      moduleDone: false,
    }
    const set = new Set(current.completedSteps)
    if (set.has(stepIndex)) set.delete(stepIndex)
    else set.add(stepIndex)
    persist(selected.id, {
      ...current,
      completedSteps: Array.from(set),
    })
  }

  function toggleModuleDone() {
    const current = progress[selected.id] ?? {
      moduleId: selected.id,
      completedSteps: [],
      moduleDone: false,
    }
    const nowDone = !current.moduleDone
    persist(selected.id, { ...current, moduleDone: nowDone })
    if (nowDone) {
      if (!selected.isPrerequisite) {
        toast.success(`Module ${selected.number} complete for this session`)
      } else {
        toast.success('Getting Started complete')
      }
      const next = WORKSHOP_MODULES.find((m) => m.number === selected.number + 1)
      if (next) setTimeout(() => setSelectedId(next.id), 350)
    }
  }

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
    })
  }

  const moduleIndex = WORKSHOP_MODULES.findIndex((m) => m.id === selected.id)
  const prevModule = WORKSHOP_MODULES[moduleIndex - 1]
  const nextModule = WORKSHOP_MODULES[moduleIndex + 1]
  const overallPct = Math.round((scoredDone / SCORED_MODULES.length) * 100)

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
              <div className="text-sm font-medium">{participant.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {scoredDone}/{SCORED_MODULES.length} modules this session
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

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-64">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-caps text-muted-foreground">Modules</h2>
            <span className="text-xs text-muted-foreground">
              {scoredDone}/{SCORED_MODULES.length}
            </span>
          </div>
          <Progress value={overallPct} className="mb-4 h-1.5" />
          <nav className="flex flex-col gap-1.5">
            {WORKSHOP_MODULES.map((m) => {
              const done = doneModules.has(m.id)
              const isActive = m.id === selectedId
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    isActive
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border bg-card hover:bg-accent',
                  ].join(' ')}
                >
                  <span className="shrink-0">
                    {done ? (
                      <Check className="size-4 text-success" />
                    ) : isActive ? (
                      <CircleDot className="size-4 text-primary" />
                    ) : m.isPrerequisite ? (
                      <Key className="size-4 text-muted-foreground" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {m.isPrerequisite ? m.title : `${m.number}. ${m.title}`}
                    </span>
                    {!m.isPrerequisite && (
                      <span className="block text-xs text-muted-foreground">
                        ~{m.estMinutes} min
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Stripe Dashboard button */}
          <div className="mt-4 border-t border-border pt-4">
            <StripeDashboardButton participantId={participant.id} />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          {allDone ? (
            <CompletionCard event={event} participantName={participant.name} />
          ) : null}

          <article className="prose prose-neutral max-w-none dark:prose-invert">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {selected.isPrerequisite ? (
                <Badge variant="secondary" className="gap-1">
                  <Key className="size-3" /> Prerequisite
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-mono">
                  Module {selected.number}
                </Badge>
              )}
              {doneModules.has(selected.id) ? (
                <Badge variant="success">Done this session</Badge>
              ) : null}
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
              {selected.title}
            </h1>

            {/* Narrative story block */}
            <NarrativeBlock text={selected.narrative} />

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {selected.intro}
            </p>

            <ol className="flex list-none flex-col gap-8 pl-0">
              {selected.steps.map((step, si) => {
                const stepDone = completedSteps.has(si)
                return (
                  <li key={si} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleStep(si)}
                        className={[
                          'flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                          stepDone
                            ? 'border-success bg-success text-success-foreground'
                            : 'border-muted-foreground/40 text-transparent hover:border-primary',
                        ].join(' ')}
                        aria-pressed={stepDone}
                        aria-label={
                          stepDone ? `Mark step ${si + 1} incomplete` : `Mark step ${si + 1} complete`
                        }
                      >
                        <Check className="size-4" />
                      </button>
                    </div>

                    {step.dashboardLink && (
                      <div className="mb-3">
                        <DashboardLink to={step.dashboardLink.url} label={step.dashboardLink.label} />
                      </div>
                    )}

                    {step.body ? (
                      <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    ) : null}

                    {step.renderDashboardButton && (
                      <div className="my-4 max-w-xs">
                        <StripeDashboardButton participantId={participant.id} />
                      </div>
                    )}

                    {step.renderCredentialsCard && (
                      <CredentialsPlaceholder />
                    )}

                    {step.renderDdosPreview && (
                      <div className="my-4">
                        <DdosAttackTrigger
                          participantId={participant.id}
                          eventId={event.id}
                          title="Preview Attack"
                          description="Run a low-intensity burst to observe the attack pattern before defending."
                          defaultIntensity="low"
                          showIntensitySelector={false}
                          previewMode
                        />
                      </div>
                    )}

                    {step.renderDdosTrigger && (
                      <div className="my-4">
                        <DdosAttackTrigger
                          participantId={participant.id}
                          eventId={event.id}
                        />
                      </div>
                    )}

                    {step.gif ? <DashboardGif gif={step.gif} /> : null}
                    {step.callouts?.length ? (
                      <div className="mt-4 flex flex-col gap-3">
                        {step.callouts.map((c, ci) => (
                          <WorkshopCallout key={ci} callout={c} />
                        ))}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 border-primary/30 p-5">
              <label className="flex cursor-pointer items-center gap-3">
                <button
                  onClick={toggleModuleDone}
                  aria-pressed={doneModules.has(selected.id)}
                  className={[
                    'flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                    doneModules.has(selected.id)
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-muted-foreground/40 text-transparent hover:border-primary',
                  ].join(' ')}
                >
                  <Check className="size-4" />
                </button>
                <span className="text-sm font-medium">{selected.doneLabel}</span>
              </label>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-3">
              {prevModule ? (
                <Button
                  variant="outline"
                  onClick={() => setSelectedId(prevModule.id)}
                >
                  <ArrowLeft className="size-4" /> Earlier module
                </Button>
              ) : (
                <span />
              )}
              {nextModule ? (
                <Button onClick={() => setSelectedId(nextModule.id)}>
                  Next: {nextModule.title} <ArrowRight className="size-4" />
                </Button>
              ) : (
                <span />
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

function CredentialsPlaceholder() {
  return (
    <Card className="my-4 max-w-sm border-border p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Account credentials
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Account ID</span>
          <span className="font-mono text-xs text-foreground">acct_••••••••</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="text-xs text-foreground">assigned on join</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Password</span>
          <span className="text-xs text-foreground">••••••••</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Your credentials are available via the Stripe Dashboard button. Login links give you direct access without needing to enter these manually.
      </p>
    </Card>
  )
}

function CompletionCard({
  event,
  participantName,
}: {
  event: EventRow
  participantName: string
}) {
  return (
    <Card className="mb-8 border-primary/40 bg-primary/[0.04] p-6">
      <div className="flex items-center gap-2 text-primary">
        <PartyPopper className="size-5" />
        <h2 className="text-xl font-semibold tracking-tight">
          All modules complete this session
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Nice work, {participantName}. You worked through all {SCORED_MODULES.length}{' '}
        modules in {event.name} during this live session.
      </p>
      <ul className="mt-4 grid gap-2">
        {SCORED_MODULES.map((m) => (
          <li key={m.id} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{m.doneLabel.replace(/^I've /, '')}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm">
        <Mail className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          This was a temporary session room—no workshop profile is saved for you.
          Questions? Contact your facilitator
          {event.customerName ? ` (${event.customerName})` : ''}.
        </span>
      </div>
    </Card>
  )
}
