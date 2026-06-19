'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { leaveWorkshop } from '@/app/actions/participant'
import { ChallengeModuleView } from '@/components/participant/challenge-module-view'
import { StripeDashboardButton } from '@/components/participant/stripe-dashboard-button'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import {
  SessionTimerChip,
  SessionEndingBanner,
} from '@/components/participant/session-timer'
import { SessionEndedChallenge } from '@/components/participant/session-ended'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

type Participant = {
  id: string
  name: string
  email: string | null
  stripeAccountId: string | null
  currentBalance: number
  totalLostAmount: number
  totalBlockedAmount: number
  currentModule: number
}

type EventRow = {
  id: string
  name: string
  status: string
  sessionEndsAt: string
  createdAt: string
  durationMinutes: number
}

type InitialData = {
  participant: Participant
  event: EventRow
  facilitatorName: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ChallengeExperience({ initialData }: { initialData: InitialData }) {
  const router = useRouter()
  const { participant, event, facilitatorName } = initialData
  const [leaving, startLeave] = useTransition()

  const { data: live } = useSWR(
    '/api/workshop/live',
    fetcher,
    { refreshInterval: 15_000 },
  )

  const sessionClock = live?.event?.sessionEndsAt ?? event.sessionEndsAt

  if (live?.event?.status === 'ended') {
    return (
      <SessionEndedChallenge
        eventName={event.name}
        roster={[]}
        myId={participant.id}
        myScore={participant.currentBalance}
      />
    )
  }

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <StripeWordmark className="h-5 w-auto" />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden text-xs font-medium text-muted-foreground sm:block">
              Fraud Defence Challenge
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SessionTimerChip sessionEndsAtIso={sessionClock} />
            <span className="text-sm font-medium">{participant.name}</span>
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

      {/* Main content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <ChallengeModuleView
          participant={participant}
          event={{ id: event.id, name: event.name, status: event.status }}
        />
      </div>

      {/* Floating dashboard button - mobile */}
      {participant.stripeAccountId && (
        <div className="fixed bottom-4 right-4 z-30 lg:hidden">
          <StripeDashboardButton participantId={participant.id} />
        </div>
      )}
    </div>
  )
}
