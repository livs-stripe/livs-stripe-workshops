'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Palette,
  LifeBuoy,
  MessageSquarePlus,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/sa', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/sa/themes', label: 'Themes', icon: Palette, exact: false },
  { href: '/sa/help', label: 'Help & Docs', icon: LifeBuoy, exact: false },
] as const

export function SaSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Facilitator navigation"
      className="flex gap-1 overflow-x-auto border-b border-border pb-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}

      <div className="my-2 hidden h-px bg-border lg:block" />

      <a
        href="mailto:livs@stripe.com?subject=Workshop%20Platform%20Feedback"
        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <MessageSquarePlus className="size-4" />
        Send Feedback
      </a>
    </nav>
  )
}
