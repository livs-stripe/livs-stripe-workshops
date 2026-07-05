import { NextResponse } from 'next/server'
import { createSession, isInstructor } from '@/lib/instructor-auth'

export async function GET(req: Request) {
  if (!(await isInstructor())) {
    await createSession()
  }
  const url = new URL('/sa', req.url)
  return NextResponse.redirect(url)
}
