import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await prisma.document.findUnique({ where: { id: params.id } })
  if (doc) {
    try {
      const fullPath = path.join(process.cwd(), 'public', doc.filePath)
      await unlink(fullPath)
    } catch {
      // file may already be gone
    }
    await prisma.document.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ success: true })
}
