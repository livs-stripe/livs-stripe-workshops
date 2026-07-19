'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getTheme, THEMES } from '@/lib/themes'
import { getWorkshopContent, getChallengeContent } from '@/lib/theme-content'
import { WorkshopCallout } from '@/components/participant/workshop-callout'
import { DashboardGif } from '@/components/participant/dashboard-gif'
import { NarrativeBlock } from '@/components/participant/narrative-block'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react'

type Tab = 'overview' | 'workshop' | 'challenge'

export default function ThemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.id as string
  const theme = getTheme(themeId)
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0)

  if (!theme) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Theme not found.{' '}
        <button onClick={() => router.push('/sa/themes')} className="text-primary underline">
          Back to themes
        </button>
      </div>
    )
  }

  const ThemeIcon = theme.Icon
  const available = theme.status === 'available'
  const workshopContent = available ? getWorkshopContent(themeId) : null
  const challengeContent = available ? getChallengeContent(themeId) : null
  const workshopModules = workshopContent?.workshopModules ?? []
  const scoredModules = workshopContent?.scoredModules ?? []
  const challengeModules = challengeContent?.challengeModules ?? []

  const totalMinutes = scoredModules.reduce((sum, m) => sum + m.estMinutes, 0)
  const totalSteps = scoredModules.reduce((sum, m) => sum + m.steps.length, 0)

  const tabs: { id: Tab; label: string; icon: typeof BookOpen; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    ...(workshopModules.length > 0
      ? [{ id: 'workshop' as Tab, label: 'Workshop', icon: BookOpen, count: scoredModules.length }]
      : []),
    ...(challengeModules.length > 0
      ? [{ id: 'challenge' as Tab, label: 'Challenge', icon: Trophy, count: challengeModules.length }]
      : []),
  ]

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => router.push('/sa/themes')}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All themes
      </button>

      {/* Theme header */}
      <div className="mb-6 flex items-start gap-4">
        <span className="flex size-14 items-center justify-center rounded-xl bg-secondary text-primary">
          <ThemeIcon className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{theme.title}</h1>
            {available ? (
              <Badge variant="success">Available</Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-2.5" /> Coming soon
              </Badge>
            )}
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {theme.blurb}
          </p>
          {available && (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" /> {scoredModules.length} modules
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> ~{totalMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> {totalSteps} steps
              </span>
              {challengeModules.length > 0 && (
                <span className="flex items-center gap-1">
                  <Trophy className="size-3.5" /> {challengeModules.length} challenge tasks
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!available && (
        <Card className="p-8 text-center text-muted-foreground">
          <Lock className="mx-auto mb-3 size-8 opacity-40" />
          <p className="text-sm">This theme is not yet available. Content is in development.</p>
        </Card>
      )}

      {available && (
        <>
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-border bg-secondary/50 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id)
                  setSelectedModuleIdx(0)
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon className="size-3.5" />
                {t.label}
                {t.count != null && (
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Workshop modules summary */}
              {scoredModules.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Workshop Modules</h2>
                  <div className="grid gap-2">
                    {workshopModules.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setTab('workshop')
                          setSelectedModuleIdx(i)
                        }}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:bg-accent"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                          {m.isPrerequisite ? '0' : m.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{m.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {m.steps.length} steps · ~{m.estMinutes} min
                          </span>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge tasks summary */}
              {challengeModules.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Challenge Tasks</h2>
                  <div className="grid gap-2">
                    {challengeModules.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setTab('challenge')
                          setSelectedModuleIdx(i)
                        }}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:bg-accent"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                          {m.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{m.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {m.tagline}
                          </span>
                        </div>
                        <Badge
                          variant={
                            m.difficulty === 'Beginner'
                              ? 'secondary'
                              : m.difficulty === 'Expert'
                                ? 'destructive'
                                : 'default'
                          }
                          className="shrink-0 text-[10px]"
                        >
                          {m.difficulty}
                        </Badge>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Workshop tab */}
          {tab === 'workshop' && workshopModules.length > 0 && (
            <WorkshopPreview
              modules={workshopModules}
              selectedIdx={selectedModuleIdx}
              onSelectIdx={setSelectedModuleIdx}
            />
          )}

          {/* Challenge tab */}
          {tab === 'challenge' && challengeModules.length > 0 && (
            <ChallengePreview
              modules={challengeModules}
              selectedIdx={selectedModuleIdx}
              onSelectIdx={setSelectedModuleIdx}
            />
          )}
        </>
      )}
    </div>
  )
}

/* ── Workshop content preview ────────────────────────────────────────── */

function WorkshopPreview({
  modules,
  selectedIdx,
  onSelectIdx,
}: {
  modules: { id: string; number: number; title: string; estMinutes: number; intro: string; narrative: string; steps: any[]; doneLabel: string; isPrerequisite?: boolean }[]
  selectedIdx: number
  onSelectIdx: (i: number) => void
}) {
  const selected = modules[selectedIdx]
  if (!selected) return null

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Module sidebar */}
      <nav className="w-full shrink-0 lg:sticky lg:top-4 lg:w-56">
        <p className="label-caps mb-2 text-muted-foreground">Modules</p>
        <div className="flex flex-col gap-1">
          {modules.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelectIdx(i)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                i === selectedIdx
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
                {m.isPrerequisite ? '0' : m.number}
              </span>
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Module content */}
      <article className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {selected.isPrerequisite ? (
            <Badge variant="secondary">Prerequisite</Badge>
          ) : (
            <Badge variant="secondary" className="font-mono">Module {selected.number}</Badge>
          )}
          <span className="text-xs text-muted-foreground">~{selected.estMinutes} min · {selected.steps.length} steps</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold tracking-tight">{selected.title}</h2>

        <NarrativeBlock text={selected.narrative} />

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{selected.intro}</p>

        <div className="flex flex-col gap-5">
          {selected.steps.map((step: any, si: number) => (
            <Card key={si} className="p-4">
              <h3 className="mb-2 text-base font-semibold">{step.title}</h3>

              {step.dashboardLink && (
                <p className="mb-2 text-xs text-primary">
                  Dashboard: {step.dashboardLink.label} ({step.dashboardLink.url})
                </p>
              )}

              {step.body && (
                <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              )}

              {step.gif && (
                <DashboardGif gif={step.gif} />
              )}

              {step.callouts?.map((c: any, ci: number) => (
                <div key={ci} className="mt-3">
                  <WorkshopCallout callout={c} />
                </div>
              ))}
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {selectedIdx > 0 ? (
            <Button variant="outline" size="sm" onClick={() => onSelectIdx(selectedIdx - 1)}>
              <ArrowLeft className="size-3.5" /> {modules[selectedIdx - 1].title}
            </Button>
          ) : <span />}
          {selectedIdx < modules.length - 1 ? (
            <Button size="sm" onClick={() => onSelectIdx(selectedIdx + 1)}>
              {modules[selectedIdx + 1].title} <ChevronRight className="size-3.5" />
            </Button>
          ) : <span />}
        </div>
      </article>
    </div>
  )
}

/* ── Challenge content preview ───────────────────────────────────────── */

function ChallengePreview({
  modules,
  selectedIdx,
  onSelectIdx,
}: {
  modules: { number: number; id: string; title: string; tagline: string; difficulty: string; steps: any[] }[]
  selectedIdx: number
  onSelectIdx: (i: number) => void
}) {
  const selected = modules[selectedIdx]
  if (!selected) return null

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Task sidebar */}
      <nav className="w-full shrink-0 lg:sticky lg:top-4 lg:w-56">
        <p className="label-caps mb-2 text-muted-foreground">Tasks</p>
        <div className="flex flex-col gap-1">
          {modules.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelectIdx(i)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                i === selectedIdx
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
                {m.number}
              </span>
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Task content */}
      <article className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">Task {selected.number}</Badge>
          <Badge
            variant={
              selected.difficulty === 'Beginner'
                ? 'secondary'
                : selected.difficulty === 'Expert'
                  ? 'destructive'
                  : 'default'
            }
          >
            {selected.difficulty}
          </Badge>
        </div>
        <h2 className="mb-1 text-xl font-semibold tracking-tight">{selected.title}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{selected.tagline}</p>

        <div className="flex flex-col gap-4">
          {selected.steps.map((step: any) => (
            <Card key={step.stepNumber} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase">
                  {step.type}
                </Badge>
                <h3 className="text-base font-semibold">{step.title}</h3>
              </div>

              {step.content && (
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{step.content}</p>
              )}

              {step.instruction && (
                <div className="mb-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {step.instruction}
                </div>
              )}

              {step.dashboardLink && (
                <p className="mb-2 text-xs text-primary">Dashboard: {step.dashboardLink}</p>
              )}

              {step.warningText && (
                <div className="mt-2 rounded-md border border-warning/40 bg-warning/[0.06] p-3 text-sm text-foreground">
                  {step.warningText}
                </div>
              )}

              {step.checklist && step.checklist.length > 0 && (
                <div className="mt-3 rounded-md border border-border bg-secondary/30 p-3">
                  <p className="label-caps mb-2 text-muted-foreground">Done criteria</p>
                  <ul className="space-y-1.5">
                    {step.checklist.map((item: string, ci: number) => (
                      <li key={ci} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step.ruleCode && (
                <div className="mt-3 rounded-md border border-border bg-secondary/50 p-3">
                  <p className="label-caps mb-1 text-muted-foreground">Rule</p>
                  <code className="text-sm">{step.ruleCode}</code>
                  {step.ruleExplanation && (
                    <p className="mt-2 text-sm text-muted-foreground">{step.ruleExplanation}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {selectedIdx > 0 ? (
            <Button variant="outline" size="sm" onClick={() => onSelectIdx(selectedIdx - 1)}>
              <ArrowLeft className="size-3.5" /> Task {modules[selectedIdx - 1].number}
            </Button>
          ) : <span />}
          {selectedIdx < modules.length - 1 ? (
            <Button size="sm" onClick={() => onSelectIdx(selectedIdx + 1)}>
              Task {modules[selectedIdx + 1].number} <ChevronRight className="size-3.5" />
            </Button>
          ) : <span />}
        </div>
      </article>
    </div>
  )
}
