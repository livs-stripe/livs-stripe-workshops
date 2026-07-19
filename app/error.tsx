'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[root error boundary]', error)
  }, [error])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 size-10 text-destructive" />
        <h1 className="mb-2 text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          An unexpected error occurred. If this persists, contact your
          facilitator.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
          <Button onClick={reset}>Try again</Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </Card>
    </div>
  )
}
