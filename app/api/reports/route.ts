import { NextResponse } from 'next/server'
import { getReportsByDate, upsertReport, getTodayKey } from '@/lib/firestore'
import { getSession } from '@/lib/session'

export async function GET(req: Request) {
  const s = await getSession()
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || await getTodayKey()
  const rows = await getReportsByDate(date)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const s = await getSession()
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (s.role === 'trungdoi' && s.squad !== body.squadId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const date = await getTodayKey()
  await upsertReport({
    date,
    squadId:       body.squadId,
    squadName:     body.squadName,
    submittedBy:   s.name,
    btdTotal:      body.btdTotal,
    btdPresent:    body.btdPresent,
    btdAbsent:     body.btdAbsent,
    btdAbsentList: body.btdAbsentList,
    csTotal:       body.csTotal,
    csPresent:     body.csPresent,
    csAbsent:      body.csAbsent,
    csAbsentList:  body.csAbsentList,
    note:          body.note || '',
  })

  return NextResponse.json({ ok: true })
}

