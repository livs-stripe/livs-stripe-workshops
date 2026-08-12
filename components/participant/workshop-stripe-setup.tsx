'use client'

import { useState } from 'react'
import { Check, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OpenDashboardButton } from '@/components/participant/open-dashboard-button'
import { STRIPE_LOGIN_URL } from '@/lib/vda-links'
import { getWorkshopAccount } from '@/config/workshop-accounts'

/**
 * One-time onboarding for Dashboard access. Explains that the workshop uses a
 * shared Stripe account, walks the participant through logging in as it, and
 * lets them verify access before the modules start referencing Dashboard pages.
 */
export function WorkshopStripeSetup({ themeId }: { themeId: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const configured = !!getWorkshopAccount(themeId)

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-card shadow-stripe">
      <div className="border-b border-border bg-secondary/50 px-5 py-3">
        <p className="label-caps text-muted-foreground">Before you start</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          Set up Dashboard access
        </p>
      </div>

      <SetupRow
        number={1}
        title="Log in to the workshop Stripe account"
        done={step > 1}
        active={step === 1}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          This workshop uses a shared Stripe test account. You need to be signed
          in as this account — not your personal Stripe account — for the
          Dashboard links to open the right place. If you are already signed into
          your own account, log out first.
        </p>
        <Button
          className="mt-3 gap-1.5"
          size="sm"
          onClick={() => {
            window.open(STRIPE_LOGIN_URL, '_blank', 'noopener,noreferrer')
            setStep(2)
          }}
        >
          Open Stripe login
          <ArrowUpRight className="size-4" />
        </Button>
      </SetupRow>

      <SetupRow
        number={2}
        title="Verify your Dashboard access"
        done={step > 2}
        active={step === 2}
        locked={step < 2}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once you are logged in, open the workshop Dashboard below. If it loads
          the workshop account correctly, you are ready to go.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="w-full max-w-xs">
            <OpenDashboardButton themeId={themeId} label="Test Dashboard access" />
          </div>
          {configured && (
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              It worked — continue
            </Button>
          )}
        </div>
      </SetupRow>

      <SetupRow
        number={3}
        title="You're ready"
        done={step === 3}
        active={step === 3}
        locked={step < 3}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Dashboard links throughout this workshop open directly to the relevant
          page in the workshop account. You only need to log in once per browser
          session.
        </p>
      </SetupRow>
    </div>
  )
}

function SetupRow({
  number,
  title,
  done,
  active,
  locked,
  children,
}: {
  number: number
  title: string
  done?: boolean
  active?: boolean
  locked?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={`border-b border-border px-5 py-4 last:border-b-0 ${
        locked ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
            done
              ? 'bg-success text-success-foreground'
              : active
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground',
          ].join(' ')}
        >
          {done ? <Check className="size-3.5" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              done ? 'text-success' : 'text-foreground'
            }`}
          >
            {title}
          </p>
          {!locked && children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </div>
  )
}
