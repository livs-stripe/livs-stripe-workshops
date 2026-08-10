'use client'

import type { WorkshopGif } from '@/lib/workshop-modules'
import { PlayCircle, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Renders a dashboard walkthrough for a workshop step.
//
// When `gif.src` points at a real animated GIF in /public, the recording plays
// inline: it auto-loops silently and only begins loading once scrolled into
// view (intersection observer), which keeps large GIFs off the critical path on
// Vercel. Clicking expands it into a lightbox. When `gif.src` is absent, we fall
// back to the branded placeholder frame so authored steps read cleanly before a
// recording has been captured.
export function DashboardGif({ gif }: { gif: WorkshopGif }) {
  const crumbs = gif.screen.split('→').map((s) => s.trim())
  const aspect = gif.aspectRatio ?? '16/9'

  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Faux browser chrome with the dashboard breadcrumb path */}
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

      {gif.src ? (
        <RecordingStage src={gif.src} alt={gif.alt ?? gif.caption} aspect={aspect} />
      ) : (
        <PlaceholderStage aspect={aspect} />
      )}

      <figcaption className="border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        {gif.caption}
      </figcaption>
    </figure>
  )
}

function PlaceholderStage({ aspect }: { aspect: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,var(--secondary),var(--secondary)_12px,var(--card)_12px,var(--card)_24px)] p-6 text-center"
      style={{ aspectRatio: aspect }}
    >
      <PlayCircle className="size-9 text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Dashboard walkthrough</p>
    </div>
  )
}

function RecordingStage({
  src,
  alt,
  aspect,
}: {
  src: string
  alt: string
  aspect: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Start loading a little before the recording scrolls into view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!expanded) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  return (
    <>
      <div
        ref={ref}
        className="group relative w-full cursor-zoom-in bg-secondary/40"
        style={{ aspectRatio: aspect }}
        onClick={() => {
          setVisible(true)
          setExpanded(true)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setExpanded(true)
        }}
        aria-label={`${alt} (click to expand)`}
      >
        {visible ? (
          // Plain <img> preserves GIF animation. next/image with the Vercel
          // optimizer strips animation, so it is intentionally avoided here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-secondary/60" />
        )}
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Click to expand
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="h-auto max-h-[90vh] w-full rounded-lg object-contain"
            />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(false)
              }}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
