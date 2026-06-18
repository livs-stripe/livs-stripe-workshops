'use client'

import { useRef } from 'react'

const LENGTH = 6

/**
 * Stripe-style OTP boxes for the 6-character workshop access code.
 * Large 48x56 cells, monospace, with paste / arrow / backspace handling.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  onComplete?: (code: string) => void
  disabled?: boolean
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const chars = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '')

  function setChar(index: number, char: string) {
    const sanitized = char.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (!sanitized) return
    const next = (value.slice(0, index) + sanitized[0] + value.slice(index + 1))
      .slice(0, LENGTH)
    onChange(next)
    if (index < LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
    if (next.length === LENGTH && !next.includes('')) {
      onComplete?.(next)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (chars[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        onChange(value.slice(0, index - 1) + value.slice(index))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, LENGTH)
    if (!pasted) return
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, LENGTH - 1)
    refs.current[focusIndex]?.focus()
    if (pasted.length === LENGTH) onComplete?.(pasted)
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Workshop access code">
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={1}
          value={char}
          disabled={disabled}
          aria-label={`Character ${i + 1}`}
          onChange={(e) => setChar(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="h-14 w-12 rounded-md border-[1.5px] border-input bg-card text-center font-mono text-2xl font-medium text-foreground transition-[color,box-shadow,border-color] outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      ))}
    </div>
  )
}
