'use client'

import { useTransition } from 'react'
import { logoutInstructor } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await logoutInstructor()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={pending}
      className="text-white/80 hover:bg-white/10 hover:text-white"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  )
}
