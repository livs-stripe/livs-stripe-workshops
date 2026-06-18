'use server'

import { redirect } from 'next/navigation'
import {
  createSession,
  destroySession,
  verifyCredentials,
} from '@/lib/instructor-auth'

export async function loginInstructor(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!verifyCredentials(email, password)) {
    return { error: 'Invalid email or password.' }
  }

  await createSession()
  redirect('/sa')
}

export async function logoutInstructor() {
  await destroySession()
  redirect('/sign-in')
}
