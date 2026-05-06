'use client'

import { CalendarEvent, TaskEvent, MeetingEvent } from './CalendarClient'

type Props = {
  year: number
  month: number
  events: CalendarEvent[]
  tasks: TaskEvent[]
  meetings: MeetingEvent[]
  onPrev: () => void
  onNext: () => void
  onDayClick: (date: string) => void
  onAddEvent: (date: string) => void
  selectedDay: string | null
  onDeleteEvent: (id: string) => void
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const eventTypeColors = {
  MEETING: 'bg-blue-100 text-blue-700 border-blue-200',
  DEADLINE: 'bg-red-100 text-red-700 border-red-200',
  MILESTONE: 'bg-purple-100 text-purple-700 border-purple-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
}

const eventTypeDots = {
  MEETING: 'bg-blue-500',
  DEADLINE: 'bg-red-500',
  MILESTONE: 'bg-purple-500',
  OTHER: 'bg-gray-400',
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function CalendarView({ year, month, events, tasks, meetings, onPrev, onNext, onDayClick, onAddEvent, selectedDay, onDeleteEvent }: Props) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = isoDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function getDayItems(day: number) {
    const dateStr = isoDate(year, month, day)
    const dayEvents = events.filter((e) => e.date.startsWith(dateStr))
    const dayTasks = tasks.filter((t) => t.dueDate?.startsWith(dateStr))
    const dayMeetings = meetings.filter((m) => m.date.startsWith(dateStr))
    return { dayEvents, dayTasks, dayMeetings, dateStr }
  }

  function getDayDetailItems(dateStr: string) {
    const dayEvents = events.filter((e) => e.date.startsWith(dateStr))
    const dayTasks = tasks.filter((t) => t.dueDate?.startsWith(dateStr))
    const dayMeetings = meetings.filter((m) => m.date.startsWith(dateStr))
    return { dayEvents, dayTasks, dayMeetings }
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onPrev} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{MONTH_NAMES[month - 1]} {year}</h2>
          <button onClick={onNext} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Meeting</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Deadline</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" />Milestone</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" />Task Due</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500" />Meeting Note</span>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="h-24 bg-gray-50/50 border-b border-r border-gray-100" />
            const { dayEvents, dayTasks, dayMeetings, dateStr } = getDayItems(day)
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDay
            const totalItems = dayEvents.length + dayTasks.length + dayMeetings.length

            return (
              <div
                key={i}
                onClick={() => onDayClick(dateStr)}
                className={`h-24 border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {totalItems > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddEvent(dateStr) }}
                      className="text-xs text-blue-400 hover:text-blue-600 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 ${eventTypeColors[e.type]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventTypeDots[e.type]}`} />
                      {e.title}
                    </div>
                  ))}
                  {dayTasks.slice(0, 1).map((t) => (
                    <div key={t.id} className="text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 bg-orange-50 text-orange-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      {t.title}
                    </div>
                  ))}
                  {dayMeetings.slice(0, 1).map((m) => (
                    <div key={m.id} className="text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 bg-teal-50 text-teal-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                      {m.title}
                    </div>
                  ))}
                  {totalItems > 3 && (
                    <p className="text-xs text-gray-400 pl-1">+{totalItems - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (() => {
        const { dayEvents, dayTasks, dayMeetings } = getDayDetailItems(selectedDay)
        const total = dayEvents.length + dayTasks.length + dayMeetings.length
        return (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <button
                onClick={() => onAddEvent(selectedDay)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Event
              </button>
            </div>

            {total === 0 && <p className="text-gray-400 text-sm">Nothing scheduled for this day.</p>}

            {dayEvents.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Events</p>
                <div className="space-y-2">
                  {dayEvents.map((e) => (
                    <div key={e.id} className={`flex items-start justify-between p-3 rounded-lg border ${eventTypeColors[e.type]}`}>
                      <div>
                        <p className="text-sm font-medium">{e.title}</p>
                        {e.time && <p className="text-xs opacity-75 mt-0.5">🕐 {e.time}</p>}
                        {e.description && <p className="text-xs opacity-75 mt-0.5">{e.description}</p>}
                        <p className="text-xs opacity-60 mt-0.5 capitalize">{e.type.toLowerCase()}</p>
                      </div>
                      <button onClick={() => onDeleteEvent(e.id)} className="p-1 hover:opacity-70 ml-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dayTasks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tasks Due</p>
                <div className="space-y-2">
                  {dayTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{t.title}</p>
                        {t.assignee && <p className="text-xs text-orange-600">{t.assignee}</p>}
                      </div>
                      <span className="ml-auto text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dayMeetings.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Meeting Notes</p>
                <div className="space-y-2">
                  {dayMeetings.map((m) => (
                    <div key={m.id} className="p-3 bg-teal-50 border border-teal-100 rounded-lg">
                      <p className="text-sm font-medium text-teal-800">{m.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
