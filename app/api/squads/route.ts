import { NextResponse } from 'next/server'
import { getAllSquads } from '@/lib/firestore'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const squads = await getAllSquads()
  return NextResponse.json(squads)
}