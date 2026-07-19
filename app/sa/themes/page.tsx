export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getThemeCounts } from '@/app/actions/events'
import { THEMES } from '@/lib/themes'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, ChevronRight } from 'lucide-react'

export default async function ThemesPage() {
  const counts = await getThemeCounts()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Themes</h1>
        <p className="mt-1 text-muted-foreground">
          Each theme defines the modules and participant experience for a
          session. Click a theme to view its full workshop and challenge content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const ThemeIcon = theme.Icon
          const available = theme.status === 'available'
          const count = counts[theme.id] ?? 0
          return (
            <Link key={theme.id} href={`/sa/themes/${theme.id}`} className="block">
              <Card
                className={`flex h-full flex-col gap-3 p-5 transition-colors hover:border-primary/40 hover:bg-accent/50 ${available ? '' : 'opacity-70'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-lg bg-secondary text-primary"
                  >
                    <ThemeIcon className="size-6" />
                  </span>
                  <div className="flex items-center gap-2">
                    {available ? (
                      <Badge variant="success">Available now</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="size-2.5" /> Coming soon
                      </Badge>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold">{theme.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {theme.description}
                  </p>
                </div>
                {available && (
                  <p className="mt-auto border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{count}</span>{' '}
                    {count === 1 ? 'event' : 'events'} created
                  </p>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
