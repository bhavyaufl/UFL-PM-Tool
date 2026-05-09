import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createOAuthClient } from '@/lib/google'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json({ error: 'Missing tokens from Google' }, { status: 400 })
  }

  // Upsert: delete any existing token and store the new one
  await prisma.googleToken.deleteMany()
  await prisma.googleToken.create({
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: BigInt(tokens.expiry_date ?? 0),
    },
  })

  return NextResponse.redirect(new URL('/dashboard/calendar', req.url))
}
