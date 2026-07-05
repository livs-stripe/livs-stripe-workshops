export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { isInstructor, createSession } from '@/lib/instructor-auth'

export default async function SignInPage() {
  if (!(await isInstructor())) {
    await createSession()
  }
  redirect('/sa')
}
