import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const kr = await prisma.keyResult.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.currentValue !== undefined && { currentValue: parseFloat(body.currentValue) }),
      ...(body.targetValue !== undefined && { targetValue: parseFloat(body.targetValue) }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.owner !== undefined && { owner: body.owner }),
    },
  })
  return NextResponse.json(kr)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.keyResult.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
