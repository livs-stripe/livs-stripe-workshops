export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentParticipant } from '@/app/actions/participant'
import { JoinFlow } from '@/components/participant/join-flow'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { THEMES } from '@/lib/themes'

export default async function HomePage() {
  let active = null
  try {
    active = await getCurrentParticipant()
  } catch {
    // DB unavailable or no session — render join form
  }
  if (active) redirect('/workshop')

  return (
    <div className="grid min-h-svh md:grid-cols-[55fr_45fr]">
      {/* Left panel — dark */}
      <section className="relative flex flex-col justify-between bg-[#0A2540] px-8 py-10 md:px-16 md:py-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <StripeWordmark variant="white" className="h-6 w-auto" />
          <span className="h-4 w-px bg-white/25" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Workshop Platform
          </span>
        </div>

        {/* Headline + subtext */}
        <div className="py-10 md:py-0">
          <h1 className="max-w-[480px] text-[32px] font-bold leading-[1.15] tracking-[-0.01em] text-white md:text-[42px]">
            Hands-on Stripe training, live with your team.
          </h1>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Real Stripe environments. Facilitator-led. No account needed.
          </p>

          {/* How it works — hidden on mobile */}
          <div className="mt-12 hidden md:block">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
              How it works
            </p>
            <div className="relative flex flex-col gap-5">
              <div className="absolute left-[14px] top-[28px] h-[calc(100%-28px)] w-px bg-primary/20" />
              <Step
                num={1}
                title="Receive your access code"
                desc="Your facilitator shares a 6-character code via email, Slack, or in the room."
              />
              <Step
                num={2}
                title="Enter code and your email"
                desc="No password, no account creation. Your email identifies you within this session only."
              />
              <Step
                num={3}
                title="Access your live Stripe environment"
                desc="You'll get credentials to a real Stripe test account for the duration of the session."
              />
            </div>
          </div>
        </div>

        {/* Available topics — hidden on mobile */}
        <div className="hidden md:block">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            Available topics
          </p>
          <div className="flex flex-col gap-3">
            {THEMES.map((theme) => {
              const ThemeIcon = theme.Icon
              const available = theme.status === 'available'
              return (
                <div
                  key={theme.id}
                  className={`flex items-center justify-between ${available ? '' : 'cursor-default'}`}
                >
                  <span className="flex items-center gap-3">
                    <ThemeIcon
                      aria-hidden
                      className={`size-5 shrink-0 ${available ? 'text-primary' : 'text-secondary-foreground'}`}
                    />
                    <span className={`text-[14px] ${available ? 'text-white' : 'text-secondary-foreground'}`}>
                      {theme.title}
                    </span>
                  </span>
                  {available ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-success-bright">
                      <span className="size-1.5 rounded-full bg-success-bright" />
                      Available
                    </span>
                  ) : (
                    <span className="text-[12px] text-secondary-foreground">
                      Coming soon
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Right panel — white */}
      <section className="relative flex flex-col bg-white px-8 py-10 md:px-16 md:py-16">
        {/* Facilitator link */}
        <div className="flex justify-end">
          <Link
            href="/sign-in"
            className="text-[13px] text-secondary-foreground transition-colors hover:text-primary"
          >
            Facilitator sign in →
          </Link>
        </div>

        {/* Form — vertically centered */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-[28px] font-bold leading-tight text-foreground">
              Join your session
            </h2>
            <p className="mt-2 mb-8 text-[15px] text-secondary-foreground">
              Enter the access code your facilitator shared with you.
            </p>
            <JoinFlow />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-border">
          Powered by Stripe · For Stripe Solutions Architects
        </p>
      </section>
    </div>
  )
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="relative flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary/40 text-[13px] font-semibold text-primary">
        {num}
      </span>
      <div>
        <p className="text-[15px] font-medium text-white">{title}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
