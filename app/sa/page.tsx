export const dynamic = 'force-dynamic'

import { getEvents, getDashboardCounts } from '@/app/actions/events'
import { SaEventList } from '@/components/sa/sa-event-list'

export default async function SaDashboardPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = []
  let counts: Awaited<ReturnType<typeof getDashboardCounts>> = {
    totalEvents: 0,
    activeEvents: 0,
  }
  try {
    ;[events, counts] = await Promise.all([getEvents(), getDashboardCounts()])
  } catch (err) {
    console.error('[SA Dashboard] Failed to load:', err instanceof Error ? err.message : err)
  }
  return <SaEventList events={events} counts={counts} />
}
