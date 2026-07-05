'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { joinEvent } from '@/app/actions/participant'
import { CodeInput, type CodeInputHandle } from '@/components/participant/code-input'
import { Loader2 } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  CODE_NOT_FOUND: "That code didn't match any active session. Check with your facilitator.",
  EVENT_NOT_STARTED: "This session hasn't started yet. Your facilitator will let you know when it's time to join.",
  EVENT_ENDED: 'This session has closed. Access codes expire when the session ends.',
  SESSION_FULL: 'This session has reached its participant limit. Check with your facilitator.',
}

export function JoinFlow() {
  const router = useRouter()
  const codeRef = useRef<CodeInputHandle>(null)
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasCodeError, setHasCodeError] = useState(false)
  const [joining, startJoin] = useTransition()

  const canSubmit = code.trim().length === 6 && email.trim().length > 0

  function handleCodeChange(next: string) {
    setCode(next)
    if (hasCodeError) {
      setHasCodeError(false)
      setError(null)
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setHasCodeError(false)

    const normalized = code.trim().toUpperCase()
    if (normalized.length !== 6) {
      setError('Access codes are 6 characters.')
      setHasCodeError(true)
      return
    }

    // Validate only alphanumeric
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setError('Access codes are 6 letters and numbers.')
      setHasCodeError(true)
      codeRef.current?.clear()
      return
    }

    const fd = new FormData()
    fd.set('code', normalized)
    fd.set('email', email.trim())
    if (displayName.trim()) fd.set('name', displayName.trim())

    startJoin(async () => {
      try {
        const result = await joinEvent(fd)
        if (result?.error) {
          const code = (result as { code?: string }).code
          const msg = code && ERROR_MESSAGES[code] ? ERROR_MESSAGES[code] : result.error
          setError(msg)

          // Mark code-related errors to show red borders
          if (code === 'CODE_NOT_FOUND' || code === 'EVENT_ENDED' || code === 'EVENT_NOT_STARTED' || code === 'SESSION_FULL') {
            setHasCodeError(true)
            codeRef.current?.clear()
          }
          return
        }
        router.push('/workshop')
        router.refresh()
      } catch {
        setError('Something went wrong on our end. Wait a moment and try again.')
      }
    })
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-6">
      {/* Access code */}
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="access-code"
          className="label-caps text-secondary-foreground"
        >
          Access code
        </label>
        <CodeInput
          ref={codeRef}
          value={code}
          onChange={handleCodeChange}
          disabled={joining}
          hasError={hasCodeError}
        />
        {error && (
          <p className="mt-1 text-[14px] text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="email"
          className="label-caps text-secondary-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          disabled={joining}
          className="join-input"
        />
        <p className="text-[12px] text-muted-foreground">
          Used to identify you in this session only. No account is created.
        </p>
      </div>

      {/* Display name */}
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="displayName"
          className="text-[11px] uppercase tracking-[0.08em] text-secondary-foreground"
        >
          <span className="font-semibold">Display name</span>{' '}
          <span className="font-normal normal-case">(optional)</span>
        </label>
        <input
          id="displayName"
          name="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="First name or nickname"
          autoComplete="nickname"
          disabled={joining}
          className="join-input"
        />
        <p className="text-[12px] text-muted-foreground">
          Shown on the live leaderboard and facilitator view.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || joining}
        className="h-[52px] w-full rounded-lg border-none bg-primary text-[16px] font-semibold text-white transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(99,91,255,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-primary/50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {joining ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Joining…
          </span>
        ) : (
          'Join session →'
        )}
      </button>
    </form>
  )
}
