import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthedClient } from '@/lib/google'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await getAuthedClient()
  if (!client) return NextResponse.json({ connected: false, events: [] })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const timeMin = new Date(year, month - 1, 1).toISOString()
  const timeMax = new Date(year, month, 0, 23, 59, 59).toISOString()

  const cal = google.calendar({ version: 'v3', auth: client })
  const res = await cal.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  const events = (res.data.items ?? []).map((e) => ({
    id: e.id ?? '',
    title: e.summary ?? '(no title)',
    date: (e.start?.dateTime ?? e.start?.date ?? '').split('T')[0],
    time: e.start?.dateTime
      ? new Date(e.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : null,
    description: e.description ?? null,
    htmlLink: e.htmlLink ?? null,
    isAllDay: !e.start?.dateTime,
  }))

  return NextResponse.json({ connected: true, events })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await getAuthedClient()
  if (!client) return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })

  const body = await req.json()
  const cal = google.calendar({ version: 'v3', auth: client })

  const startDateTime = body.time
    ? `${body.date}T${body.time}:00`
    : body.date

  const event = await cal.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: body.title,
      description: body.description,
      start: body.time
        ? { dateTime: startDateTime, timeZone: 'Asia/Kolkata' }
        : { date: body.date },
      end: body.time
        ? { dateTime: startDateTime, timeZone: 'Asia/Kolkata' }
        : { date: body.date },
    },
  })

  return NextResponse.json(event.data, { status: 201 })
}
