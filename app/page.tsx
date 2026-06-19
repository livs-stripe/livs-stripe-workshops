export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentParticipant } from '@/app/actions/participant'
import { JoinFlow } from '@/components/participant/join-flow'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { BookOpen, Trophy, MonitorPlay } from 'lucide-react'
import { THEMES, PLATFORM_NAME, PLATFORM_LOCKUP_SHORT } from '@/lib/themes'

export default async function HomePage() {
  const active = await getCurrentParticipant()
  if (active) redirect('/workshop')

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      {/* Hero panel */}
      <section className="hero-gradient stripe-texture relative flex flex-col justify-between px-6 py-10 text-white md:px-12 md:py-14">
        <div className="flex items-center gap-3">
          <StripeWordmark variant="white" className="h-7 w-auto" />
          <span className="h-4 w-px bg-white/25" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/70">
            {PLATFORM_LOCKUP_SHORT}
          </span>
        </div>

        <div className="max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="size-1.5 rounded-full bg-primary" />
            Live, hands-on Stripe training
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-[-0.02em] md:text-5xl">
            {PLATFORM_NAME}
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-white/70">
            Temporary live rooms for Stripe customers: your Solutions Architect
            opens a session, you join with a code—no accounts, no history after
            the room closes.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" /> Self-paced workshops
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="size-4 text-primary" /> Live team challenges
            </li>
            <li className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-primary" /> Real Stripe
              dashboards
            </li>
          </ul>
        </div>

        <div className="grid gap-2">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
            Available topics
          </p>
          {THEMES.map((theme) => {
            const ThemeIcon = theme.Icon
            return (
            <div
              key={theme.id}
              className="flex items-center justify-between border-t border-white/10 py-2.5 text-sm"
            >
              <span className="flex items-center gap-3">
                <ThemeIcon
                  aria-hidden
                  className="size-4 shrink-0 text-primary"
                />
                <span className="text-white/80">{theme.title}</span>
              </span>
              <span
                className={`font-mono text-xs ${
                  theme.status === 'available'
                    ? 'text-primary'
                    : 'text-white/35'
                }`}
              >
                {theme.status === 'available' ? 'Available' : 'Coming soon'}
              </span>
            </div>
            )
          })}
        </div>
      </section>

      {/* Join panel */}
      <section className="flex flex-col bg-background px-6 py-10 md:px-12 md:py-14">
        <div className="flex justify-end">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Facilitator sign in
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Join a live session
            </h2>
            <p className="mt-1.5 mb-7 text-pretty text-muted-foreground">
              Enter the access code from your facilitator plus your email. This
              is a one-time room—not a login and not a saved profile.
            </p>
            <JoinFlow />
          </div>
        </div>

        <p className="mx-auto w-full max-w-md text-xs text-muted-foreground">
          Powered by Stripe · For Stripe Solutions Architects
        </p>
      </section>
    </div>
  )
}
