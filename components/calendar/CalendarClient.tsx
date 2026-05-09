'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarView } from './CalendarView'
import { EventForm } from './EventForm'

export type CalendarEvent = {
  id: string
  title: string
  date: string
  time: string | null
  description: string | null
  type: 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'OTHER'
}

export type GoogleCalendarEvent = {
  id: string
  title: string
  date: string
  time: string | null
  description: string | null
  htmlLink: string | null
  isAllDay: boolean
}

export type TaskEvent = {
  id: string
  title: string
  dueDate: string
  priority: string
  assignee: string | null
}

export type MeetingEvent = {
  id: string
  title: string
  date: string
}

export function CalendarClient() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [tasks, setTasks] = useState<TaskEvent[]>([])
  const [meetings, setMeetings] = useState<MeetingEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayDetail, setDayDetail] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchGoogleEvents = useCallback(async () => {
    const res = await fetch(`/api/google-calendar?year=${year}&month=${month}`)
    const data = await res.json()
    setGoogleConnected(data.connected ?? false)
    setGoogleEvents(data.events ?? [])
  }, [year, month])

  const fetchAll = useCallback(async () => {
    const [eventsRes, tasksRes, meetingsRes] = await Promise.all([
      fetch(`/api/calendar-events?year=${year}&month=${month}`),
      fetch('/api/tasks'),
      fetch('/api/meeting-notes'),
    ])
    setEvents(await eventsRes.json())
    setTasks(await tasksRes.json())
    setMeetings(await meetingsRes.json())
    await fetchGoogleEvents()
  }, [year, month, fetchGoogleEvents])

  useEffect(() => { fetchAll() }, [fetchAll])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/calendar-events/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Google Calendar?')) return
    setDisconnecting(true)
    await fetch('/api/google-calendar/disconnect', { method: 'DELETE' })
    setGoogleConnected(false)
    setGoogleEvents([])
    setDisconnecting(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Tasks, meetings, and events</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Calendar connection status */}
          {googleConnected ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-xs font-medium text-green-700">bhavya@asharufl.com</span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-xs text-green-500 hover:text-red-500 transition ml-1 disabled:opacity-50"
                title="Disconnect Google Calendar"
              >
                ✕
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/google"
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connect Google Calendar
            </a>
          )}
          <button
            onClick={() => { setSelectedDate(null); setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Event
          </button>
        </div>
      </div>

      <CalendarView
        year={year}
        month={month}
        events={events}
        googleEvents={googleEvents}
        tasks={tasks}
        meetings={meetings}
        onPrev={prevMonth}
        onNext={nextMonth}
        onDayClick={(date) => setDayDetail(dayDetail === date ? null : date)}
        onAddEvent={(date) => { setSelectedDate(date); setShowForm(true) }}
        selectedDay={dayDetail}
        onDeleteEvent={deleteEvent}
      />

      {showForm && (
        <EventForm
          defaultDate={selectedDate}
          googleConnected={googleConnected}
          onClose={() => { setShowForm(false); setSelectedDate(null); fetchAll() }}
        />
      )}
    </div>
  )
}
