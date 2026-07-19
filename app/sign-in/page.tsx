export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { isInstructor } from '@/lib/instructor-auth'
import { InstructorLoginForm } from '@/components/instructor-login-form'

export default async function SignInPage() {
  if (await isInstructor()) {
    redirect('/sa')
  }
  return <InstructorLoginForm />
}
