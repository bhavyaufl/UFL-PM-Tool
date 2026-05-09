import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
      { agenda: { contains: q, mode: 'insensitive' } },
      { actionItems: { contains: q, mode: 'insensitive' } },
    ]
  }

  const notes = await prisma.meetingNote.findMany({
    where,
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const note = await prisma.meetingNote.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      attendees: body.attendees,
      agenda: body.agenda,
      notes: body.notes,
      actionItems: body.actionItems,
    },
  })
  return NextResponse.json(note, { status: 201 })
}
