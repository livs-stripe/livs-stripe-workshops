import { getEvents } from '@/app/actions/events'
import { SaEventList } from '@/components/sa/sa-event-list'

export default async function SaDashboardPage() {
  const events = await getEvents()
  return <SaEventList events={events} />
}
