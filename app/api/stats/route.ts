import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

// ─────────────────────────────────────────
// 📅 RANGE
// ─────────────────────────────────────────
function getDateRange(mode: string, dateStr: string) {
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
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    return {
      start: start.toISOString().slice(0, 10),
      end:   end.toISOString().slice(0, 10),
    }
  }

  return { start: dateStr, end: dateStr }
}

// ─────────────────────────────────────────
// ⚡ SIMPLE CACHE (RAM)
// ─────────────────────────────────────────
const cache = new Map<string, { data: any; time: number }>()

const CACHE_TTL = 10 * 1000 // 10s

function getCache(key: string) {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return item.data
}

function setCache(key: string, data: any) {
  cache.set(key, { data, time: Date.now() })
}

// ─────────────────────────────────────────
// 🚀 API
// ─────────────────────────────────────────
export async function GET(req: Request) {
  const s = await getSession()
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('mode') || 'day'
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const cacheKey = `${mode}_${date}`

  // ⚡ CACHE HIT
  const cached = getCache(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  // ─────────────────────────────
  // 🔥 QUERY FIREBASE (1 lần)
  // ─────────────────────────────
  const range = getDateRange(mode, date)

  const q = query(
    collection(db, 'reports'),
    where('date', '>=', range.start),
    where('date', '<=', range.end)
  )

  const snap = await getDocs(q)

  // ─────────────────────────────
  // ⚡ AGGREGATE NHANH
  // ─────────────────────────────
  let total = 0
  let present = 0
  let absent = 0

  const squadMap: Record<number, any> = {}
  const reasonMap: Record<string, number> = {}

  snap.forEach(doc => {
    const r = doc.data()

    const squadId = r.squad_id

    // 👉 tổng toàn đại đội
    const t = r.btd_total + r.cs_total
    const p = r.btd_present + r.cs_present
    const a = r.btd_absent + r.cs_absent

    total += t
    present += p
    absent += a

    // 👉 init squad
    if (!squadMap[squadId]) {
      squadMap[squadId] = {
        id: squadId,
        name: r.squad_name,
        total: 0,
        present: 0,
        absent: 0,
        reported: true,

        btd: { total: 0, present: 0, absent: 0 },
        cs:  { total: 0, present: 0, absent: 0 },

        absentList: [],
      }
    }

    const sq = squadMap[squadId]

    // 👉 cộng dồn
    sq.total   += t
    sq.present += p
    sq.absent  += a

    sq.btd.total   += r.btd_total
    sq.btd.present += r.btd_present
    sq.btd.absent  += r.btd_absent

    sq.cs.total   += r.cs_total
    sq.cs.present += r.cs_present
    sq.cs.absent  += r.cs_absent

    // 👉 lý do vắng
    const allAbsent = [
      ...(r.btd_absent_list || []),
      ...(r.cs_absent_list || [])
    ]

    allAbsent.forEach((p: any) => {
      reasonMap[p.reason] = (reasonMap[p.reason] || 0) + 1
    })
  })

  // ─────────────────────────────
  // 🔄 convert sang array
  // ─────────────────────────────
  const squads = Object.values(squadMap)

  // ─────────────────────────────
  // 📊 RESPONSE
  // ─────────────────────────────
  const data = {
    mode,
    date,
    range,
    total,
    present,
    absent,
    squads,
    reasons: reasonMap,
  }

  // ⚡ CACHE SAVE
  setCache(cacheKey, data)

  return NextResponse.json(data)
}