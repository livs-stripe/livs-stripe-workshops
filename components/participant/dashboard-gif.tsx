import type { WorkshopGif } from '@/lib/workshop-modules'
import { PlayCircle, ChevronRight } from 'lucide-react'

// Branded placeholder frame standing in for an animated dashboard walkthrough.
// Shows the dashboard path as breadcrumbs plus the caption. Drop a real GIF/MP4
// in later by rendering it inside the framed area.
export function DashboardGif({ gif }: { gif: WorkshopGif }) {
  const crumbs = gif.screen.split('→').map((s) => s.trim())
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Faux browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/70 px-3 py-2">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/50" />
        <span className="size-2.5 rounded-full bg-success/50" />
        <div className="ml-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 opacity-60" />}
              <span className={i === crumbs.length - 1 ? 'text-foreground' : ''}>
                {c}
              </span>
            </span>
          ))}
        </div>
      </div>
      {/* Placeholder stage */}
      <div className="flex aspect-[16/8] flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,var(--secondary),var(--secondary)_12px,var(--card)_12px,var(--card)_24px)] p-6 text-center">
        <PlayCircle className="size-9 text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">
          Dashboard walkthrough
        </p>
      </div>
      <figcaption className="border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        {gif.caption}
      </figcaption>
    </figure>
  )
}
