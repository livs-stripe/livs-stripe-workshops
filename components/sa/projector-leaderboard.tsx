'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { MODULES, TOTAL_POSSIBLE_SCORE } from '@/lib/workshop-content'
import { Crown, Radio, X } from 'lucide-react'

type Participant = {
  id: string
  name: string
  company: string | null
  score: number
  currentModule: number
}

type Detail = {
  event: { id: string; name: string; accessCode: string; status: string }
  roster: Participant[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function rankAccent(i: number) {
  if (i === 0) return { border: 'border-l-gold', glow: 'bg-gold/10', label: '1st' }
  if (i === 1) return { border: 'border-l-silver', glow: 'bg-white/[0.03]', label: '2nd' }
  if (i === 2) return { border: 'border-l-bronze', glow: 'bg-white/[0.03]', label: '3rd' }
  return { border: 'border-l-transparent', glow: 'bg-white/[0.02]', label: `${i + 1}` }
}

export function ProjectorLeaderboard({ initialData }: { initialData: Detail }) {
  const { data } = useSWR<Detail>(
    `/api/sa/events/${initialData.event.id}`,
    fetcher,
    { fallbackData: initialData, refreshInterval: 3000 },
  )

  const detail = data ?? initialData
  const { event, roster } = detail

  return (
    <main className="min-h-svh bg-[#0a2540] text-white">
      {/* Brand gradient banner header */}
      <header className="leaderboard-gradient">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <StripeWordmark variant="white" className="h-7 w-auto" />
            <span className="h-5 w-px bg-white/30" />
            <span className="label-caps text-white/80">Live Leaderboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-white/80">
              <Radio className="size-4 animate-pulse" /> Live
            </span>
            <Link
              href={`/sa/events/${event.id}`}
              className="flex size-8 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Exit projector view"
            >
              <X className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {event.name}
            </h1>
            <p className="mt-1 text-white/60">
              {roster.length} participant{roster.length === 1 ? '' : 's'} · Access
              code{' '}
              <span className="font-mono text-white/90">{event.accessCode}</span>
            </p>
          </div>
        </div>

        {roster.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] py-24 text-center">
            <p className="text-lg text-white/60">
              Waiting for participants to join with code{' '}
              <span className="font-mono text-white">{event.accessCode}</span>
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {roster.map((p, i) => {
              const accent = rankAccent(i)
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-5 rounded-lg border-l-[3px] ${accent.border} ${accent.glow} px-6 py-5`}
                >
                  <span className="flex w-12 shrink-0 justify-center">
                    {i === 0 ? (
                      <Crown className="size-7 text-gold" />
                    ) : (
                      <span className="font-mono text-2xl font-semibold tabular-nums text-white/50">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-semibold">{p.name}</p>
                    <p className="truncate text-sm text-white/50">
                      {p.company ?? 'No company'} · Module{' '}
                      {Math.min(p.currentModule + 1, MODULES.length)} of{' '}
                      {MODULES.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-4xl font-bold tabular-nums text-[#7a72ff]">
                      {p.score}
                    </span>
                    <span className="block text-xs text-white/40">
                      of {TOTAL_POSSIBLE_SCORE}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </main>
  )
}
