'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinEvent } from '@/app/actions/participant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CodeInput } from '@/components/participant/code-input'
import { ArrowRight, Loader2 } from 'lucide-react'

export function JoinFlow() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [joining, startJoin] = useTransition()

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const normalized = code.trim().toUpperCase()
    if (normalized.length !== 6) {
      setError('Access codes are 6 characters.')
      return
    }
    const fd = new FormData()
    fd.set('code', normalized)
    fd.set('email', email.trim())
    if (displayName.trim()) fd.set('name', displayName.trim())
    startJoin(async () => {
      const result = await joinEvent(fd)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.push('/workshop')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <Label className="label-caps text-muted-foreground" htmlFor="access-code">
          Access code
        </Label>
        <CodeInput
          value={code}
          onChange={setCode}
          disabled={joining}
        />
        <p className="text-xs text-muted-foreground">
          From your facilitator (email, Slack, or in the room).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
        <p className="text-xs text-muted-foreground">
          We use your email only to identify you in this live room. No account is
          created; session data is not kept for you after the event ends.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">
          How you&apos;d like to appear{' '}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="displayName"
          name="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="First name or nickname"
          autoComplete="nickname"
        />
        <p className="text-xs text-muted-foreground">
          Shown to your facilitator and on the live roster. If you leave and
          rejoin with the same email while the session is open, you pick up where
          you left off in this room—not a saved account.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={joining} size="lg">
        {joining ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Joining…
          </>
        ) : (
          <>
            Join session <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}
