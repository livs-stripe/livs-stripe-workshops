'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

function CredentialRow({
  label,
  value,
  placeholder,
  mono,
  revealed,
  onToggle,
}: {
  label: string
  value: string | null
  placeholder?: string
  mono?: boolean
  revealed: boolean
  onToggle: () => void
}) {
  const [copied, setCopied] = useState(false)

  const isLoading = !value
  const displayValue = isLoading
    ? placeholder ?? 'Loading...'
    : revealed
      ? value
      : '••••••••••'

  async function handleCopy() {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="w-24 shrink-0 text-[13px] uppercase tracking-[0.04em]"
        style={{ color: '#8898AA' }}
      >
        {label}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[13px] ${
          isLoading ? 'italic text-muted-foreground' : 'text-foreground'
        } ${mono && revealed ? 'font-mono' : ''}`}
      >
        {displayValue}
      </span>
      {!isLoading && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="flex size-7 items-center justify-center rounded transition-colors"
            style={{ color: '#8898AA' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#425466' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8898AA' }}
            aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-7 items-center justify-center rounded transition-colors"
            style={{ color: copied ? '#00D924' : '#8898AA' }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = '#425466' }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = '#8898AA' }}
            aria-label={`Copy ${label}`}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      )}
    </div>
  )
}

export function CredentialsCard({
  stripeAccountId,
  email,
}: {
  stripeAccountId: string | null
  email: string | null
}) {
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({})

  function toggle(field: string) {
    setRevealedFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const allRevealed = revealedFields.accountId && revealedFields.email
  function toggleAll() {
    if (allRevealed) {
      setRevealedFields({})
    } else {
      setRevealedFields({ accountId: true, email: true })
    }
  }

  return (
    <Card className="my-4 max-w-md border-border p-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Your Stripe test account
      </p>

      <div className="flex flex-col divide-y divide-border">
        <CredentialRow
          label="Account ID"
          value={stripeAccountId}
          placeholder="Account still being set up..."
          mono
          revealed={!!revealedFields.accountId}
          onToggle={() => toggle('accountId')}
        />
        <CredentialRow
          label="Email"
          value={email}
          placeholder="Loading..."
          revealed={!!revealedFields.email}
          onToggle={() => toggle('email')}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Use the Dashboard button for direct access — no credentials needed.
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="shrink-0 text-[13px] font-medium transition-colors hover:underline"
          style={{ color: '#635BFF', cursor: 'pointer' }}
        >
          {allRevealed ? 'Hide all' : 'Show all'}
        </button>
      </div>
    </Card>
  )
}
