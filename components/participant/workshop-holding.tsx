'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { leaveWorkshop } from '@/app/actions/participant'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { Button } from '@/components/ui/button'
import { getTheme } from '@/lib/themes'
import { Clock, LogOut } from 'lucide-react'

export function WorkshopHolding({
  eventName,
  eventTheme,
}: {
  eventName: string
  eventTheme: string
}) {
  const router = useRouter()
  const [leaving, startLeave] = useTransition()
  const theme = getTheme(eventTheme)
  const ThemeIcon = theme?.Icon

  function handleLeave() {
    startLeave(async () => {
      await leaveWorkshop()
      router.push('/')
    })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <StripeWordmark className="h-5 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            disabled={leaving}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Clock className="size-6" />
          </span>
          <h1 className="mt-5 text-balance text-xl font-semibold">
            {eventName}
          </h1>
          {theme && ThemeIcon && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
              <ThemeIcon className="size-3.5 shrink-0" aria-hidden />
              {theme.title}
            </span>
          )}
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Your facilitator is setting up the content for this session. Check
            back shortly.
          </p>
        </div>
      </main>
    </div>
  )
}
