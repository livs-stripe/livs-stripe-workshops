export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isInstructor, INSTRUCTOR_NAME, INSTRUCTOR_EMAIL } from '@/lib/instructor-auth'
import { PLATFORM_LOCKUP_SHORT } from '@/lib/themes'
import { StripeWordmark } from '@/components/brand/stripe-wordmark'
import { SignOutButton } from '@/components/sa/sign-out-button'
import { SaSidebar } from '@/components/sa/sa-sidebar'

export default async function SaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    if (!(await isInstructor())) redirect('/sign-in')
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err
    redirect('/sign-in')
  }

  return (
    <div className="min-h-svh">
      <header className="hero-gradient sticky top-0 z-10 border-b border-sidebar-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/sa" className="flex items-center gap-2.5">
            <StripeWordmark variant="white" className="h-5 w-auto" />
            <span className="ml-0.5 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80">
              {PLATFORM_LOCKUP_SHORT}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm leading-tight text-white/70 sm:block">
              <span className="block font-medium text-white">Facilitator Dashboard</span>
              <span className="block text-xs text-white/60">
                {INSTRUCTOR_NAME} · {INSTRUCTOR_EMAIL}
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <aside className="lg:w-52 lg:shrink-0">
          <SaSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
