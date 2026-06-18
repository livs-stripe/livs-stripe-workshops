'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Palette,
  LifeBuoy,
  ExternalLink,
} from 'lucide-react'

const NAV = [
  { href: '/sa', label: 'Dashboard', icon: LayoutDashboard, match: 'exact' },
  { href: '/sa', label: 'Events', icon: CalendarDays, match: 'exact' },
] as const

const RESOURCES = [
  { href: '/sa/themes', label: 'Themes', icon: Palette, external: false },
  { href: '#', label: 'Help & Docs', icon: LifeBuoy, external: true },
] as const

export function SaSidebar() {
  const pathname = usePathname()

  function itemClass(active: boolean) {
    return `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`
  }

  return (
    <nav
      aria-label="Facilitator navigation"
      className="flex gap-1 overflow-x-auto border-b border-border pb-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
    >
      {NAV.map((item, i) => (
        <Link
          // Two links share /sa; disambiguate with the index.
          key={`${item.href}-${i}`}
          href={item.href}
          className={itemClass(pathname === item.href && i === 0)}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}

      <div className="my-2 hidden h-px bg-border lg:block" />
      <p className="label-caps hidden px-3 pb-1 text-muted-foreground lg:block">
        Resources
      </p>

      {RESOURCES.map((item) =>
        item.external ? (
          <a
            key={item.label}
            href={item.href}
            className={itemClass(false)}
          >
            <item.icon className="size-4" />
            {item.label}
            <ExternalLink className="ml-auto hidden size-3 opacity-60 lg:block" />
          </a>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className={itemClass(pathname.startsWith(item.href))}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}
