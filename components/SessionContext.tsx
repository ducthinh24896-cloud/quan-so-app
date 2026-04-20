'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { SessionPayload } from '@/lib/types'

interface SessionCtx {
  session: SessionPayload | null
  loading: boolean
  refresh: () => Promise<void>
}

const Ctx = createContext<SessionCtx>({ session: null, loading: true, refresh: async () => {} })

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me')
      setSession(r.ok ? await r.json() : null)
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return <Ctx.Provider value={{ session, loading, refresh }}>{children}</Ctx.Provider>
}

export const useSession = () => useContext(Ctx)