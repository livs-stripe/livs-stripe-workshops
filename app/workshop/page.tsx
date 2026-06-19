export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentParticipant } from '@/app/actions/participant'
import { WorkshopExperience } from '@/components/participant/workshop-experience'
import { WorkshopDocument } from '@/components/participant/workshop-document'
import { WorkshopHolding } from '@/components/participant/workshop-holding'
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

  const initialData = {
    participant: {
      id: data.participant.id,
      name: data.participant.name,
      score: data.participant.score,
      currentModule: data.participant.currentModule,
    },
    event: {
      id: data.event.id,
      name: data.event.name,
      description: data.event.description,
      status: data.event.status,
      eventType: data.event.eventType,
      eventTheme: data.event.eventTheme,
      ...eventTiming,
    },
    progress: data.progress.map((p) => ({
      moduleId: p.moduleId,
      status: p.status,
      score: p.score,
    })),
    waves: data.waves.map((w) => ({
      id: w.id,
      waveType: w.waveType,
      label: w.label,
      firedAt: w.firedAt.toISOString(),
    })),
  }

  return <WorkshopExperience initialData={initialData} />
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
