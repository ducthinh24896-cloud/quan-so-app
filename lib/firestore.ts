import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc
} from 'firebase/firestore'

import { db } from './firebase'
import type { SquadConfig, ReportRow, AbsentPerson } from './types'

// ─────────────────────────────────────────────
// 🪖 Lấy tất cả trung đội
// ─────────────────────────────────────────────
export async function getAllSquads(): Promise<SquadConfig[]> {
  const snap = await getDocs(collection(db, 'squads'))

  return snap.docs.map(d => ({
    id: Number(d.id),
    ...d.data()
  })) as SquadConfig[]
}

// ─────────────────────────────────────────────
// 📊 Lấy báo cáo theo ngày
// ─────────────────────────────────────────────
export async function getReportsByDate(date: string): Promise<ReportRow[]> {
  const q = query(collection(db, 'reports'), where('date', '==', date))
  const snap = await getDocs(q)

  return snap.docs.map(d => {
    const data = d.data()

    return {
      id: d.id,

      date: data.date ?? '',
      squadId: data.squadId ?? 0,
      squadName: data.squadName ?? '',
      submittedBy: data.submittedBy ?? '',
      submittedAt: data.submittedAt ?? '',

      btdTotal: data.btdTotal ?? 0,
      btdPresent: data.btdPresent ?? 0,
      btdAbsent: data.btdAbsent ?? 0,
      btdAbsentList: data.btdAbsentList ?? [],

      csTotal: data.csTotal ?? 0,
      csPresent: data.csPresent ?? 0,
      csAbsent: data.csAbsent ?? 0,
      csAbsentList: data.csAbsentList ?? [],

      note: data.note ?? '',
    }
  })
}

// ─────────────────────────────────────────────
// 💾 Ghi / cập nhật báo cáo (UPsert)
// ─────────────────────────────────────────────
export async function upsertReport(p: {
  date: string
  squadId: number
  squadName: string
  submittedBy: string
  btdTotal: number
  btdPresent: number
  btdAbsent: number
  btdAbsentList: AbsentPerson[]
  csTotal: number
  csPresent: number
  csAbsent: number
  csAbsentList: AbsentPerson[]
  note: string
}) {
  const id = `${p.date}_${p.squadId}`

  await setDoc(doc(db, 'reports', id), {
    ...p,
    submittedAt: new Date().toISOString(),
  })
}

// ─────────────────────────────────────────────
// 📅 Lấy ngày hôm nay (YYYY-MM-DD)
// ─────────────────────────────────────────────
export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

// ─────────────────────────────────────────────
// 📈 Thống kê theo ngày / tuần / tháng
// ─────────────────────────────────────────────
export function getDateRange(mode: 'day' | 'week' | 'month', dateStr: string) {
  const date = new Date(dateStr)

  if (mode === 'day') {
    const d = date.toISOString().slice(0, 10)
    return { start: d, end: d }
  }

  if (mode === 'week') {
    const day = date.getDay() || 7
    const start = new Date(date)
    start.setDate(date.getDate() - day + 1)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  }

  if (mode === 'month') {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  }

  return null
}