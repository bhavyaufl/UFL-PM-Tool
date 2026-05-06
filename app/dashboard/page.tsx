import { prisma } from '@/lib/prisma'
import { formatDate, getProgressBgColor } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const weekFromNow = new Date(now)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const [overdueTasks, dueSoonTasks, recentMeetings, objectives] = await Promise.all([
    prisma.task.count({
      where: {
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
    }),
    prisma.task.findMany({
      where: {
        dueDate: { gte: now, lte: weekFromNow },
        status: { not: 'DONE' },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.meetingNote.findMany({
      orderBy: { date: 'desc' },
      take: 4,
    }),
    prisma.objective.findMany({
      include: { keyResults: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  function calcObjectiveProgress(obj: typeof objectives[0]) {
    if (obj.keyResults.length === 0) return 0
    const avg = obj.keyResults.reduce((sum, kr) => {
      const pct = kr.targetValue === 0 ? 0 : Math.min(100, (kr.currentValue / kr.targetValue) * 100)
      return sum + pct
    }, 0) / obj.keyResults.length
    return Math.round(avg)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back to UFL Hub</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{overdueTasks}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/tasks?filter=overdue" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View overdue →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Due This Week</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{dueSoonTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/tasks" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View tasks →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active OKRs</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{objectives.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/kpis" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View OKRs →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Soon Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks Due This Week</h2>
          {dueSoonTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks due this week</p>
          ) : (
            <div className="space-y-3">
              {dueSoonTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.assignee || 'Unassigned'} · Due {formatDate(task.dueDate)}</p>
                  </div>
                  <span className={`ml-3 text-xs font-medium px-2 py-1 rounded-full ${
                    task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Meeting Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Meeting Notes</h2>
          {recentMeetings.length === 0 ? (
            <p className="text-gray-400 text-sm">No meeting notes yet</p>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{note.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(note.date)}</p>
                  {note.attendees && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">👥 {note.attendees}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/documents" className="text-xs text-blue-600 hover:underline mt-3 inline-block">
            View all notes →
          </Link>
        </div>

        {/* OKR Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">OKR Progress</h2>
          {objectives.length === 0 ? (
            <p className="text-gray-400 text-sm">No objectives defined yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((obj) => {
                const progress = calcObjectiveProgress(obj)
                const bgColor = getProgressBgColor(progress)
                return (
                  <div key={obj.id} className="border border-gray-100 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">{obj.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${bgColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-10 text-right">{progress}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{obj.keyResults.length} key results</p>
                  </div>
                )
              })}
            </div>
          )}
          <Link href="/dashboard/kpis" className="text-xs text-blue-600 hover:underline mt-3 inline-block">
            Manage OKRs →
          </Link>
        </div>
      </div>
    </div>
  )
}
