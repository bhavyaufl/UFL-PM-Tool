import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const note = await prisma.meetingNote.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.attendees !== undefined && { attendees: body.attendees }),
      ...(body.agenda !== undefined && { agenda: body.agenda }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.actionItems !== undefined && { actionItems: body.actionItems }),
    },
  })
  return NextResponse.json(note)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.meetingNote.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
