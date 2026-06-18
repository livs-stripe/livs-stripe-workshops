'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveWorkshopProgress, leaveWorkshop } from '@/app/actions/participant'
import { WORKSHOP_MODULES } from '@/lib/workshop-modules'
import { getTheme } from '@/lib/themes'
import { WorkshopCallout } from '@/components/participant/workshop-callout'
import { DashboardGif } from '@/components/participant/dashboard-gif'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
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
} from 'lucide-react'

type Participant = { id: string; name: string }
type EventRow = {
  id: string
  name: string
  description: string | null
  customerName: string | null
  eventTheme: string
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
}

export function WorkshopDocument({ initialData }: { initialData: InitialData }) {
  const router = useRouter()
  const { participant, event } = initialData
  const eventTheme = getTheme(event.eventTheme)

  // Map moduleId -> progress, seeded from the server.
  const [progress, setProgress] = useState<Record<string, ProgressRow>>(() => {
    const m: Record<string, ProgressRow> = {}
    for (const p of initialData.wsProgress) m[p.moduleId] = p
    return m
  })
  const [, startSave] = useTransition()
  const [leaving, startLeave] = useTransition()

  const doneModules = useMemo(
    () =>
      new Set(
        Object.values(progress)
          .filter((p) => p.moduleDone)
          .map((p) => p.moduleId),
      ),
    [progress],
  )

  const firstIncomplete =
    WORKSHOP_MODULES.find((m) => !doneModules.has(m.id)) ??
    WORKSHOP_MODULES[WORKSHOP_MODULES.length - 1]
  const [selectedId, setSelectedId] = useState(firstIncomplete.id)
  const allDone = doneModules.size === WORKSHOP_MODULES.length

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
      toast.success(`Module ${selected.number} complete`)
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
  const overallPct = Math.round(
    (doneModules.size / WORKSHOP_MODULES.length) * 100,
  )

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <StripeWordmark className="h-5 w-auto" />
            {eventTheme && (
              <>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground sm:flex">
                  <span aria-hidden>{eventTheme.icon}</span>
                  {eventTheme.title}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{participant.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {doneModules.size}/{WORKSHOP_MODULES.length} modules complete
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

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start">
        {/* Module navigation */}
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-64">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-caps text-muted-foreground">Modules</h2>
            <span className="text-xs text-muted-foreground">
              {doneModules.size}/{WORKSHOP_MODULES.length}
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
                      <Check className="size-4 text-primary" />
                    ) : (
                      <CircleDot className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {m.number}. {m.title}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" /> {m.estMinutes} min
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Module document */}
        <section className="min-w-0 flex-1">
          {allDone ? (
            <CompletionCard
              event={event}
              participantName={participant.name}
            />
          ) : null}

          <article>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                MODULE {String(selected.number).padStart(2, '0')}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> ~{selected.estMinutes} min
              </span>
              {doneModules.has(selected.id) && (
                <Badge variant="success">
                  <Check className="mr-1 size-3" /> Done
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-pretty text-3xl font-semibold tracking-tight">
              {selected.title}
            </h1>
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
              {selected.intro}
            </p>

            <ol className="mt-8 flex flex-col gap-8">
              {selected.steps.map((step, idx) => {
                const stepDone = completedSteps.has(idx)
                return (
                  <li
                    key={idx}
                    className="border-l-2 border-border pl-5 [counter-increment:step]"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStep(idx)}
                        aria-pressed={stepDone}
                        aria-label={
                          stepDone ? 'Mark step incomplete' : 'Mark step complete'
                        }
                        className={[
                          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                          stepDone
                            ? 'border-success bg-success text-success-foreground'
                            : 'border-muted-foreground/40 text-transparent hover:border-primary',
                        ].join(' ')}
                      >
                        <Check className="size-3.5" />
                      </button>
                      <h2
                        className={[
                          'text-lg font-semibold tracking-tight',
                          stepDone ? 'text-muted-foreground line-through' : '',
                        ].join(' ')}
                      >
                        {step.title}
                      </h2>
                    </div>

                    {step.body && (
                      <p className="mt-2 pl-9 text-pretty text-sm leading-relaxed text-foreground/90">
                        {step.body}
                      </p>
                    )}

                    {step.gif && (
                      <div className="mt-4 pl-9">
                        <DashboardGif gif={step.gif} />
                      </div>
                    )}

                    {step.callouts && step.callouts.length > 0 && (
                      <div className="mt-4 flex flex-col gap-3 pl-9">
                        {step.callouts.map((c, ci) => (
                          <WorkshopCallout key={ci} callout={c} />
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>

            {/* Module completion */}
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
                <span className="text-sm font-medium">
                  {selected.doneLabel}
                </span>
              </label>
            </Card>

            {/* Prev / next navigation */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {prevModule ? (
                <Button
                  variant="outline"
                  onClick={() => setSelectedId(prevModule.id)}
                >
                  <ArrowLeft className="size-4" /> Previous
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
          Workshop complete
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Nice work, {participantName}. You worked through all{' '}
        {WORKSHOP_MODULES.length} modules of {event.name}. Here&apos;s what you
        built today:
      </p>
      <ul className="mt-4 grid gap-2">
        {WORKSHOP_MODULES.map((m) => (
          <li key={m.id} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{m.doneLabel.replace(/^I&apos;ve |^I've /, '')}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm">
        <Mail className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          Your Stripe test account remains active after the workshop. Questions?
          Reach out to your facilitator
          {event.customerName ? ` at ${event.customerName}` : ''}.
        </span>
      </div>
    </Card>
  )
}
