import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const kr = await prisma.keyResult.create({
    data: {
      title: body.title,
      targetValue: parseFloat(body.targetValue),
      currentValue: parseFloat(body.currentValue ?? 0),
      unit: body.unit || '%',
      owner: body.owner,
      objectiveId: body.objectiveId,
    },
  })
  return NextResponse.json(kr, { status: 201 })
}
