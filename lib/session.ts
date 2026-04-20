import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload } from './types'

const SECRET       = new TextEncoder().encode(process.env.JWT_SECRET ?? 'quan-so-dev-secret-2024!')
export const COOKIE_NAME    = 'qs_session'
export const COOKIE_MAX_AGE = 60 * 60 * 8   // 8 giờ

// ─── Ký token ────────────────────────────────────────────────────────────────
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(SECRET)
}

// ─── Xác minh token ──────────────────────────────────────────────────────────
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Lấy session từ cookie (dùng trong Server Components / Route Handlers) ───
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}