import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assignee = searchParams.get('assignee')
  const priority = searchParams.get('priority')
  const status = searchParams.get('status')
  const project = searchParams.get('project')

  const where: Record<string, unknown> = {}
  if (assignee) where.assignee = { contains: assignee, mode: 'insensitive' }
  if (priority) where.priority = priority
  if (status) where.status = status
  if (project) where.project = { contains: project, mode: 'insensitive' }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      assignee: body.assignee,
      priority: body.priority || 'MEDIUM',
      status: body.status || 'TODO',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      project: body.project,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
