import { google } from 'googleapis'
import { prisma } from './prisma'

export function assertGoogleEnv() {
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'].filter(
    (k) => !process.env[k],
  )
  if (missing.length) {
    throw new Error(`Missing Google OAuth env vars: ${missing.join(', ')}`)
  }
}

export function createOAuthClient() {
  assertGoogleEnv()
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!,
  )
}

export function getAuthUrl() {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })
}

export async function getAuthedClient() {
  const token = await prisma.googleToken.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!token) return null

  const client = createOAuthClient()
  client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: Number(token.expiryDate),
  })

  // Refresh if expired (or within 60 s of expiry)
  if (Number(token.expiryDate) < Date.now() + 60_000) {
    const { credentials } = await client.refreshAccessToken()
    await prisma.googleToken.update({
      where: { id: token.id },
      data: {
        accessToken: credentials.access_token!,
        expiryDate: BigInt(credentials.expiry_date ?? 0),
        ...(credentials.refresh_token && { refreshToken: credentials.refresh_token }),
      },
    })
    client.setCredentials(credentials)
  }

  return client
}

export async function isConnected(): Promise<boolean> {
  const token = await prisma.googleToken.findFirst()
  return !!token
}
