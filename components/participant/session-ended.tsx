'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { leaveWorkshop } from '@/app/actions/participant'
import { useTransition } from 'react'
import { Camera } from 'lucide-react'

type RosterRow = { id: string; name: string; score: number; currentModule: number }

export function SessionEndedWorkshop({
  eventName,
  facilitatorName,
}: {
  eventName: string
  facilitatorName: string
}) {
  const router = useRouter()
  const [leaving, startLeave] = useTransition()

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Session ended</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Thanks for joining <span className="font-medium text-foreground">{eventName}</span>.
          This live session has closed.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Your facilitator is{' '}
          <span className="font-medium text-foreground">{facilitatorName}</span>.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          No account was created. There is nothing to log back into—this room was
          temporary.
        </p>
        <Button className="mt-8 w-full" onClick={handleLeave} disabled={leaving}>
          {leaving ? 'Leaving…' : 'Back to join page'}
        </Button>
      </Card>
    </div>
  )
}

export function SessionEndedChallenge({
  eventName,
  roster,
  myId,
  myScore,
}: {
  eventName: string
  roster: RosterRow[]
  myId: string
  myScore: number
}) {
  const router = useRouter()
  const [leaving, startLeave] = useTransition()
  const sorted = [...roster].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  const top3 = sorted.slice(0, 3)
  const myRank = sorted.findIndex((r) => r.id === myId) + 1

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg p-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">
          Session ended
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{eventName}</p>

        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-center text-sm font-medium text-foreground">
            Your score: <span className="font-mono tabular-nums">{myScore}</span>
            {myRank > 0 && (
              <span className="text-muted-foreground">
                {' '}
                · Final rank #{myRank}
              </span>
            )}
          </p>
          <p className="label-caps mt-4 text-center text-muted-foreground">
            Final leaderboard (top 3)
          </p>
          <ol className="mt-2 space-y-2">
            {top3.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="font-mono text-muted-foreground">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate px-2 font-medium">{r.name}</span>
                <span className="font-mono tabular-nums">{r.score}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-muted-foreground">
          <Camera className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
          <span>
            Screenshot the leaderboard above if you want a copy—this session is
            closed and scores are not kept for you after you leave.
          </span>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No account was created. This was a one-time live event.
        </p>

        <Button className="mt-8 w-full" onClick={handleLeave} disabled={leaving}>
          {leaving ? 'Leaving…' : 'Back to join page'}
        </Button>
      </Card>
    </div>
  )
}
