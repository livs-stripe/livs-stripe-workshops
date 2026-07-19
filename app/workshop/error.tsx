'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function WorkshopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[workshop error]', error)
  }, [error])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 size-10 text-warning" />
        <h1 className="mb-2 text-xl font-semibold tracking-tight">
          Workshop session error
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Your session encountered a problem. This is usually temporary.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Return to join
          </Button>
          <Button onClick={reset}>Reload</Button>
        </div>
      </Card>
    </div>
  )
}
