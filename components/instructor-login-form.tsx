'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginInstructor } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { PLATFORM_LOCKUP_SHORT } from '@/lib/themes'
import { AlertCircle, Lock } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  )
}

export function InstructorLoginForm() {
  const [state, formAction] = useActionState(loginInstructor, undefined)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <div className="mb-6 flex items-center gap-2.5">
            <StripeWordmark variant="foreground" className="h-6 w-auto" />
            <span className="h-4 w-px bg-border" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-foreground">
              {PLATFORM_LOCKUP_SHORT}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Instructor sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For authorized facilitators only. Sign in to create sessions, share
            access codes, and run the facilitator console.
          </p>
        </div>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="livs@stripe.com"
              defaultValue="livs@stripe.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </p>
          ) : null}

          <SubmitButton />
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" />
          Facilitator-only access. No public sign-up.
        </p>
      </Card>
    </div>
  )
}
