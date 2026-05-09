import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const objectives = await prisma.objective.findMany({
    include: { keyResults: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(objectives)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const obj = await prisma.objective.create({
    data: {
      title: body.title,
      description: body.description,
      quarter: body.quarter,
      year: body.year ? parseInt(body.year) : null,
    },
    include: { keyResults: true },
  })
  return NextResponse.json(obj, { status: 201 })
}
