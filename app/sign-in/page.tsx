export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { isInstructor } from '@/lib/instructor-auth'

export default async function SignInPage() {
  if (await isInstructor()) {
    redirect('/sa')
  }
  // Cookie writes aren't allowed in Server Components — route through
  // the API handler which can set the session cookie in a Route Handler.
  redirect('/api/sa/auto-login')
}
