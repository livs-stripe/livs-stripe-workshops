import { randomBytes, randomUUID } from 'crypto'

// Stable unique id for rows.
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`
}

// 6-character human-friendly access code (no ambiguous chars).
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function newAccessCode(): string {
  const bytes = randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return code
}
