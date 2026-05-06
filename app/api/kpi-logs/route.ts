import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const log = await prisma.kPILog.create({
    data: {
      value: parseFloat(body.value),
      date: new Date(body.date),
      notes: body.notes,
      metricId: body.metricId,
    },
  })
  return NextResponse.json(log, { status: 201 })
}
