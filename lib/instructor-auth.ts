import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Single hardcoded instructor. There is no sign-up — only Liv can sign in.
export const INSTRUCTOR_EMAIL = 'livs@stripe.com'
export const INSTRUCTOR_NAME = 'Liv'
// Stable id used as `saUserId` on every event this instructor owns.
export const INSTRUCTOR_ID = 'livs'

const COOKIE_NAME = 'instructor_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function signingSecret() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.INSTRUCTOR_PASSWORD
  if (!secret) throw new Error('Missing BETTER_AUTH_SECRET for session signing')
  return secret
}

function sign(payload: string) {
  return createHmac('sha256', signingSecret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** Validate the instructor's credentials against the environment. */
export function verifyCredentials(email: string, password: string) {
  const expected = process.env.INSTRUCTOR_PASSWORD
  if (!expected) throw new Error('INSTRUCTOR_PASSWORD is not configured')
  const emailOk = email.trim().toLowerCase() === INSTRUCTOR_EMAIL
  const passwordOk = safeEqual(password, expected)
  return emailOk && passwordOk
}

/** Issue a signed session cookie for the instructor. */
export async function createSession() {
  const payload = JSON.stringify({ sub: INSTRUCTOR_ID, iat: Date.now() })
  const value = Buffer.from(payload).toString('base64url')
  const token = `${value}.${sign(value)}`
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

/** Clear the instructor session cookie. */
export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Returns true when a valid instructor session cookie is present. */
export async function isInstructor() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return false
  const [value, signature] = token.split('.')
  if (!value || !signature) return false
  if (!safeEqual(signature, sign(value))) return false
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString())
    return parsed?.sub === INSTRUCTOR_ID
  } catch {
    return false
  }
}

/** Throws when the request is not an authenticated instructor. */
export async function requireInstructor() {
  if (!(await isInstructor())) throw new Error('Unauthorized')
  return INSTRUCTOR_ID
}
