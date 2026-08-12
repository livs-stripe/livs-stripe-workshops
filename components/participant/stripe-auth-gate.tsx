'use client'

import { useEffect, useState } from 'react'
import { STRIPE_LOGIN_URL } from '@/lib/vda-links'
import { Button } from '@/components/ui/button'
import {
  KeyRound,
  TriangleAlert,
  ArrowUpRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
} from 'lucide-react'

const SESSION_KEY = 'stripe_workshop_auth_confirmed'

// Public (build-time inlined) workshop login credentials. These are only shown
// to help participants log into the shared test account; leave the password
// unset to have facilitators share it out of band instead.
const WORKSHOP_EMAIL = process.env.NEXT_PUBLIC_WORKSHOP_STRIPE_EMAIL ?? ''
const WORKSHOP_PASSWORD = process.env.NEXT_PUBLIC_WORKSHOP_STRIPE_PASSWORD ?? ''

type GateState = 'idle' | 'checking' | 'needs-login'

/**
 * Pre-flight wrapper for Stripe View-Dashboard-As links.
 *
 * VDA only works when the viewer's browser is authenticated as the platform
 * account. On the first use this shows a short modal (credentials + a nudge to
 * log out of any personal account first); after the participant confirms, the
 * choice is remembered for the rest of the browser session so subsequent
 * clicks open directly.
 */
export function StripeAuthGate({
  targetUrl,
  targetLabel = 'the Stripe Dashboard',
  children,
}: {
  targetUrl: string
  targetLabel?: string
  children: (props: { onClick: () => void }) => React.ReactNode
}) {
  const [state, setState] = useState<GateState>('idle')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setConfirmed(sessionStorage.getItem(SESSION_KEY) === 'true')
    }
  }, [])

  function open() {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  function handleClick() {
    if (confirmed) {
      open()
      return
    }
    setState('checking')
  }

  function handleLoginFirst() {
    window.open(STRIPE_LOGIN_URL, '_blank', 'noopener,noreferrer')
    setState('needs-login')
  }

  function handleConfirmLoggedIn() {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setConfirmed(true)
    setState('idle')
    open()
  }

  const showModal = state === 'checking' || state === 'needs-login'

  return (
    <>
      {children({ onClick: handleClick })}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setState('idle')}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-stripe-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-tight text-foreground">
                  Log in as the workshop account
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  To open {targetLabel}, your browser must be signed into Stripe
                  as the shared workshop account — not your personal account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setState('idle')}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {(WORKSHOP_EMAIL || WORKSHOP_PASSWORD) && (
              <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-4">
                <p className="label-caps mb-2 text-muted-foreground">
                  Workshop Stripe credentials
                </p>
                <div className="flex flex-col divide-y divide-border">
                  <CredentialRow
                    label="Email"
                    value={WORKSHOP_EMAIL || 'Ask your facilitator'}
                    copyable={!!WORKSHOP_EMAIL}
                  />
                  <CredentialRow
                    label="Password"
                    value={WORKSHOP_PASSWORD || 'Ask your facilitator'}
                    copyable={!!WORKSHOP_PASSWORD}
                    secret
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2 rounded-lg border border-warning/40 bg-warning/[0.06] p-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-xs leading-relaxed text-foreground">
                If you are signed into your own Stripe account, log out first.
                Using the wrong account shows the wrong Dashboard.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={handleLoginFirst} className="w-full gap-1.5">
                Open Stripe login
                <ArrowUpRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirmLoggedIn}
                className="w-full gap-1.5"
              >
                <Check className="size-4" />
                I&rsquo;m logged in — open the Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CredentialRow({
  label,
  value,
  secret,
  copyable,
}: {
  label: string
  value: string
  secret?: boolean
  copyable?: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — ignore.
    }
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
        {secret && !revealed ? '••••••••' : value}
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
            aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              copied ? 'text-success' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={`Copy ${label}`}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
