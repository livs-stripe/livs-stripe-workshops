import { redirect } from 'next/navigation'
import { getCurrentParticipant } from '@/app/actions/participant'
import { WorkshopExperience } from '@/components/participant/workshop-experience'
import { WorkshopDocument } from '@/components/participant/workshop-document'
import { WorkshopHolding } from '@/components/participant/workshop-holding'
import { isAvailableTheme } from '@/lib/themes'

export default async function WorkshopPage() {
  const data = await getCurrentParticipant()
  if (!data) redirect('/')

  // Safety net: only themes with real content can render. Everything else
  // shows a holding page until its content ships.
  if (!isAvailableTheme(data.event.eventTheme)) {
    return (
      <WorkshopHolding
        eventName={data.event.name}
        eventTheme={data.event.eventTheme}
      />
    )
  }

  // Document-style workshop experience (no scoring / leaderboard).
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
          },
          wsProgress: data.wsProgress.map((p) => ({
            moduleId: p.moduleId,
            moduleDone: p.moduleDone,
            completedSteps: safeParseSteps(p.completedSteps),
          })),
        }}
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
      eventTheme: data.event.eventTheme,
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
