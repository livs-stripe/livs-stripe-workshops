export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentParticipant } from '@/app/actions/participant'
import { WorkshopDocument } from '@/components/participant/workshop-document'
import { WorkshopHolding } from '@/components/participant/workshop-holding'
import { ChallengeExperience } from '@/components/participant/challenge-experience'
import { SessionEndedChallenge, SessionEndedWorkshop } from '@/components/participant/session-ended'
import { isAvailableTheme } from '@/lib/themes'
import { getSessionEndsAt } from '@/lib/event-retention'
import { INSTRUCTOR_NAME } from '@/lib/instructor-auth'

export default async function WorkshopPage() {
  let data = null
  try {
    data = await getCurrentParticipant()
  } catch {
    redirect('/')
  }
  if (!data) redirect('/')

  const sessionEndsAt = getSessionEndsAt(data.event).toISOString()
  const eventTiming = {
    status: data.event.status,
    eventType: data.event.eventType,
    sessionEndsAt,
    createdAt: data.event.createdAt.toISOString(),
    durationMinutes: data.event.durationMinutes,
  }

  if (!isAvailableTheme(data.event.eventTheme)) {
    return (
      <WorkshopHolding
        eventName={data.event.name}
        eventTheme={data.event.eventTheme}
      />
    )
  }

  if (data.event.eventType === 'workshop' && data.event.status === 'ended') {
    return (
      <SessionEndedWorkshop
        eventName={data.event.name}
        facilitatorName={INSTRUCTOR_NAME}
      />
    )
  }

  if (data.event.eventType === 'workshop') {
    return (
      <WorkshopDocument
        initialData={{
          participant: {
            id: data.participant.id,
            name: data.participant.name,
            email: data.participant.email ?? null,
            stripeAccountId: data.participant.stripeAccountId ?? null,
          },
          event: {
            id: data.event.id,
            name: data.event.name,
            description: data.event.description,
            customerName: data.event.customerName,
            eventTheme: data.event.eventTheme,
            ...eventTiming,
          },
          wsProgress: data.wsProgress.map((p) => ({
            moduleId: p.moduleId,
            moduleDone: p.moduleDone,
            completedSteps: safeParseSteps(p.completedSteps),
          })),
          facilitatorName: INSTRUCTOR_NAME,
        }}
      />
    )
  }

  if (data.event.status === 'ended' && data.finalRoster) {
    return (
      <SessionEndedChallenge
        eventName={data.event.name}
        roster={data.finalRoster}
        myId={data.participant.id}
        myScore={data.participant.score}
      />
    )
  }

  // Challenge mode — balance-based fraud defence simulation
  return (
    <ChallengeExperience
      initialData={{
        participant: {
          id: data.participant.id,
          name: data.participant.name,
          email: data.participant.email ?? null,
          stripeAccountId: data.participant.stripeAccountId ?? null,
          currentBalance: data.participant.currentBalance,
          totalLostAmount: data.participant.totalLostAmount,
          totalBlockedAmount: data.participant.totalBlockedAmount,
          currentModule: data.participant.currentModule,
        },
        event: {
          id: data.event.id,
          name: data.event.name,
          eventTheme: data.event.eventTheme,
          ...eventTiming,
        },
        facilitatorName: INSTRUCTOR_NAME,
      }}
    />
  )
}

function safeParseSteps(value: string): number[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === 'number')
      : []
  } catch {
    return []
  }
}
