'use client'

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'

export function StripeDashboardButton({
  participantId,
}: {
  participantId: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/participants/${participantId}/login-link`)
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank', 'noopener')
      }
    } catch {
      // Silently fail — participant can retry
    } finally {
      setTimeout(() => setLoading(false), 600)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-[13px] font-semibold transition-colors disabled:opacity-70"
      style={{
        border: '1.5px solid #635BFF',
        backgroundColor: loading ? '#F4F3FF' : 'white',
        color: '#635BFF',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = '#F4F3FF'
          e.currentTarget.style.borderColor = '#5851E5'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = 'white'
          e.currentTarget.style.borderColor = '#635BFF'
        }
      }}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 28 28" className="size-4 shrink-0" fill="none">
          <path
            d="M13.976 3.5C8.184 3.5 3.5 8.184 3.5 13.976c0 5.793 4.684 10.476 10.476 10.476 5.793 0 10.477-4.683 10.477-10.476C24.453 8.184 19.769 3.5 13.976 3.5zm0 4.19c.903 0 1.528.27 2.024.753l-1.003 1.003c-.366-.349-.74-.496-1.021-.496-.904 0-1.554.734-1.554 1.658 0 .924.65 1.658 1.554 1.658.28 0 .655-.148 1.021-.496l1.003 1.003c-.496.483-1.121.753-2.024.753-1.862 0-3.362-1.484-3.362-2.918 0-1.434 1.5-2.918 3.362-2.918z"
            fill="#635BFF"
          />
        </svg>
      )}
      <span className="flex-1 text-left">
        {loading ? 'Opening...' : 'Open Stripe Dashboard'}
      </span>
      {!loading && <ExternalLink className="size-3.5 shrink-0 opacity-70" />}
    </button>
  )
}
