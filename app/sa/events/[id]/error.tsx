'use client'

import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-xl py-16">
      <Link
        href="/sa"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <Card className="p-8">
        <h2 className="mb-2 text-lg font-semibold">
          Something went wrong loading this event
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          This is usually caused by a provisioning issue or a temporary database
          error. Try refreshing, or return to the dashboard.
        </p>

        {error.digest && (
          <code className="mb-5 block rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </code>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/sa">Back to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
