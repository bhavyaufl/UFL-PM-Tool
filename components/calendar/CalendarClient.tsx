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
  const [tasks, setTasks] = useState<TaskEvent[]>([])
  const [meetings, setMeetings] = useState<MeetingEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayDetail, setDayDetail] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const [eventsRes, tasksRes, meetingsRes] = await Promise.all([
      fetch(`/api/calendar-events?year=${year}&month=${month}`),
      fetch('/api/tasks'),
      fetch('/api/meeting-notes'),
    ])
    setEvents(await eventsRes.json())
    setTasks(await tasksRes.json())
    setMeetings(await meetingsRes.json())
  }, [year, month])

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Tasks, meetings, and events</p>
        </div>
        <button
          onClick={() => { setSelectedDate(null); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Event
        </button>
      </div>

      <CalendarView
        year={year}
        month={month}
        events={events}
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
          onClose={() => { setShowForm(false); setSelectedDate(null); fetchAll() }}
        />
      )}
    </div>
  )
}
