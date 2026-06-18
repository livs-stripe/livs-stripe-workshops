'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { findEventByCode, joinEvent } from '@/app/actions/participant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CodeInput } from '@/components/participant/code-input'
import { getTheme } from '@/lib/themes'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

type FoundEvent = {
  id: string
  name: string
  description: string | null
  status: string
  eventType: string
  eventTheme: string
}

export function JoinFlow() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [event, setEvent] = useState<FoundEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, startCheck] = useTransition()
  const [joining, startJoin] = useTransition()

  function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const normalized = code.trim().toUpperCase()
    if (normalized.length !== 6) {
      setError('Access codes are 6 characters.')
      return
    }
    startCheck(async () => {
      const found = await findEventByCode(normalized)
      if (!found) {
        setError('No session found for that code. Check with your facilitator.')
        return
      }
      if (found.status === 'ended') {
        setError('That session has already ended.')
        return
      }
      setEvent(found)
    })
  }

  function handleJoin(formData: FormData) {
    setError(null)
    formData.set('code', code.trim().toUpperCase())
    startJoin(async () => {
      const result = await joinEvent(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.push('/workshop')
      router.refresh()
    })
  }

  if (event) {
    return (
      <form action={handleJoin} className="flex flex-col gap-4">
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-4" />
            <span className="text-sm font-medium">
              {event.eventType === 'workshop' ? 'Workshop found' : 'Challenge found'}
            </span>
          </div>
          <p className="mt-1 font-semibold text-foreground">{event.name}</p>
          {getTheme(event.eventTheme) && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
              <span aria-hidden>{getTheme(event.eventTheme)!.icon}</span>
              {getTheme(event.eventTheme)!.title}
            </span>
          )}
          {event.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="email" name="email" type="email" autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">
              Company <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="company" name="company" autoComplete="organization" />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEvent(null)
              setError(null)
            }}
          >
            Back
          </Button>
          <Button type="submit" disabled={joining} className="flex-1">
            {joining ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Joining…
              </>
            ) : (
              <>
                Enter {event?.eventType === 'challenge' ? 'challenge' : 'workshop'}{' '}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleCheck} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <Label className="label-caps text-muted-foreground">Access code</Label>
        <CodeInput value={code} onChange={setCode} disabled={checking} />
          <p className="text-xs text-muted-foreground">
          Enter the 6-character code from your facilitator.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={checking} size="lg">
        {checking ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Checking…
          </>
        ) : (
          <>
            Find my session <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}
