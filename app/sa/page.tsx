export const dynamic = 'force-dynamic'

import { getEvents, getDashboardCounts } from '@/app/actions/events'
import { SaEventList } from '@/components/sa/sa-event-list'

export default async function SaDashboardPage() {
  const [events, counts] = await Promise.all([getEvents(), getDashboardCounts()])
  return <SaEventList events={events} counts={counts} />
}
