import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const metrics = await prisma.kPIMetric.findMany({
    include: { logs: { orderBy: { date: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(metrics)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const metric = await prisma.kPIMetric.create({
    data: {
      name: body.name,
      description: body.description,
      unit: body.unit,
    },
    include: { logs: true },
  })
  return NextResponse.json(metric, { status: 201 })
}
