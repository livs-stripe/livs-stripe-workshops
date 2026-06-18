import { notFound, redirect } from 'next/navigation'
import { isInstructor } from '@/lib/instructor-auth'
import { getEventDetail } from '@/app/actions/events'
import { ProjectorLeaderboard } from '@/components/sa/projector-leaderboard'

export default async function ProjectorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await isInstructor())) redirect('/sign-in')

  const { id } = await params
  const detail = await getEventDetail(id)
  if (!detail) notFound()

  const initialData = {
    event: {
      id: detail.event.id,
      name: detail.event.name,
      accessCode: detail.event.accessCode,
      status: detail.event.status,
    },
    roster: detail.roster.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      score: p.score,
      currentModule: p.currentModule,
    })),
  }

  return <ProjectorLeaderboard initialData={initialData} />
}
