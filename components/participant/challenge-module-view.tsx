'use client'

import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChallengeStepCard } from '@/components/participant/challenge-step-card'
import { CHALLENGE_MODULES as FRAUD_CHALLENGE_MODULES, STARTING_BALANCE_CENTS as FRAUD_STARTING_BALANCE } from '@/lib/challenge-modules'
import { getChallengeContent } from '@/lib/theme-content'
import { Shield, Trophy, TrendingDown } from 'lucide-react'

type Participant = {
  id: string
  name: string
  currentBalance: number
  totalLostAmount: number
  totalBlockedAmount: number
  stripeAccountId: string | null
}

type EventRow = {
  id: string
  name: string
  status: string
}

type ModuleProgress = {
  completedSteps: number[]
  attack: {
    status: string
    chargesFired: number
    chargesBlocked: number
    chargesSucceeded: number
    amountLostCents: number
  } | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ChallengeModuleView({
  participant,
  event,
  eventTheme,
}: {
  participant: Participant
  event: EventRow
  eventTheme?: string
}) {
  const themeContent = getChallengeContent(eventTheme ?? 'fraud_radar')
  const CHALLENGE_MODULES = themeContent?.challengeModules ?? FRAUD_CHALLENGE_MODULES
  const STARTING_BALANCE_CENTS = themeContent?.startingBalanceCents ?? FRAUD_STARTING_BALANCE

  const [selectedModule, setSelectedModule] = useState(1)
  const [balance, setBalance] = useState(participant.currentBalance)

  const mod = CHALLENGE_MODULES.find((m) => m.number === selectedModule)!

  const [attackPolling, setAttackPolling] = useState(false)

  const { data: progress, mutate } = useSWR<ModuleProgress>(
    `/api/participants/${participant.id}/module-progress/${selectedModule}`,
    fetcher,
    {
      refreshInterval: attackPolling ? 2000 : 10000,
      onSuccess: (data) => {
        setAttackPolling(data?.attack?.status === 'running')
      },
    },
  )

  // Refresh balance periodically
  const { data: balanceData } = useSWR(
    `/api/participants/${participant.id}/balance`,
    fetcher,
    { refreshInterval: 8000 },
  )

  useEffect(() => {
    if (balanceData?.currentBalance != null) {
      setBalance(balanceData.currentBalance)
    }
  }, [balanceData])

  const completedSteps = new Set(progress?.completedSteps ?? [])
  const stepsTotal = mod.steps.length
  const stepsDone = completedSteps.size
  const progressPct = Math.round((stepsDone / stepsTotal) * 100)

  const handleCompleteStep = useCallback(async (stepNumber: number) => {
    await fetch(`/api/participants/${participant.id}/complete-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleNumber: selectedModule,
        stepNumber,
        eventId: event.id,
      }),
    })
    mutate()
  }, [participant.id, selectedModule, event.id, mutate])

  const handleFireAttack = useCallback(async () => {
    const fireStep = mod.steps.find((s) => s.type === 'fire')
    if (!fireStep) return
    await fetch(`/api/participants/${participant.id}/complete-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleNumber: selectedModule,
        stepNumber: fireStep.stepNumber,
        eventId: event.id,
      }),
    })
    mutate()
  }, [participant.id, selectedModule, event.id, mod.steps, mutate])

  const balancePct = Math.round((balance / STARTING_BALANCE_CENTS) * 100)
  const balanceColor = balancePct > 70 ? 'text-emerald-600' : balancePct > 40 ? 'text-amber-600' : 'text-red-600'

  // Determine which modules are unlocked (sequential — must complete previous)
  const moduleCompletions = CHALLENGE_MODULES.map((m) => {
    // A module is considered complete if its fire step attack is done
    return m.number <= (participant.currentBalance > 0 ? 8 : 0)
  })

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      {/* Sidebar — module list + balance */}
      <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
        {/* Balance card */}
        <Card className="p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Balance
          </p>
          <p className={`text-2xl font-bold tabular-nums ${balanceColor}`}>
            ${(balance / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </p>
          <Progress value={balancePct} className="mt-2 h-1.5" />
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="size-3" /> {participant.totalBlockedAmount} blocked
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="size-3" /> ${(participant.totalLostAmount / 100).toFixed(0)} lost
            </span>
          </div>
        </Card>

        {/* Module list */}
        <nav className="flex flex-col gap-1">
          {CHALLENGE_MODULES.map((m) => (
            <button
              key={m.number}
              onClick={() => setSelectedModule(m.number)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                m.number === selectedModule
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {m.number}
              </span>
              <span className="min-w-0 truncate">{m.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content — steps */}
      <main className="min-w-0 flex-1">
        {/* Module header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-lg font-bold">
              Module {mod.number}: {mod.title}
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {mod.difficulty}
            </Badge>
          </div>
          <p className="text-sm italic text-muted-foreground">{mod.tagline}</p>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progressPct} className="h-2 flex-1" />
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              Step {stepsDone}/{stepsTotal}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{mod.expectedCharges} charges in simulation</span>
            <span>Max exposure: ${(mod.maxExposureCents / 100).toLocaleString()}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {mod.steps.map((step) => {
            const isCompleted = completedSteps.has(step.stepNumber)
            const prevCompleted = step.stepNumber === 1 || completedSteps.has(step.stepNumber - 1)
            const state = isCompleted ? 'completed' : prevCompleted ? 'active' : 'locked'

            return (
              <ChallengeStepCard
                key={`${mod.number}-${step.stepNumber}`}
                step={step}
                state={state}
                onComplete={() => handleCompleteStep(step.stepNumber)}
                onFireAttack={handleFireAttack}
                attackStatus={step.type === 'fire' ? progress?.attack : undefined}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
