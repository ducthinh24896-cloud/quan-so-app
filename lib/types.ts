import { Timestamp } from 'firebase/firestore'
// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'chihuy' | 'trungdoi'

// ─── Database row types ───────────────────────────────────────────────────────
export interface User {
  id: number
  username: string
  password_hash: string
  name: string
  role: UserRole
  squad: number | null
}

export interface SquadConfig {
  id: number
  name: string
  btd_total: number
  cs_total: number
}

export interface ReportRow {
  id: string
  date: string
  squadId: number
  squadName: string
  submittedBy: string
  submittedAt: string

  btdTotal: number
  btdPresent: number
  btdAbsent: number
  btdAbsentList: AbsentPerson[]

  csTotal: number
  csPresent: number
  csAbsent: number
  csAbsentList: AbsentPerson[]

  note: string
}

// ─── Business types ───────────────────────────────────────────────────────────
export interface AbsentPerson {
  name: string
  position: string
  reason: string
  note: string
}

export interface SquadReport {
  squadId: number
  squadName: string
  btdTotal: number
  btdPresent: number
  btdAbsent: number
  btdAbsentList: AbsentPerson[]
  csTotal: number
  csPresent: number
  csAbsent: number
  csAbsentList: AbsentPerson[]
  note: string
}

// ─── Session ─────────────────────────────────────────────────────────────────
export interface SessionPayload {
  userId: string   // ✅ đổi number → string
  username: string
  role: UserRole
  name: string
  squad: number | null
}
// ─── Stats ───────────────────────────────────────────────────────────────────
export interface SquadStat {
  id: number
  name: string
  total: number
  present: number
  absent: number
  reported: boolean
  reportedAt: string | null
  reportedBy: string | null
  btd: { total: number; present: number; absent: number }
  cs:  { total: number; present: number; absent: number }
  absentList: AbsentPerson[]
}

export interface DailyStats {
  date: string
  total: number
  present: number
  absent: number
  reportedCount: number
  squads: SquadStat[]
  reasons: Record<string, number>
}