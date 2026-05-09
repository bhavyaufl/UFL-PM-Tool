'use client'

import { Filters } from './TasksClient'

type Props = {
  filters: Filters
  onChange: (f: Filters) => void
}

export function TaskFilters({ filters, onChange }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <input
        type="text"
        placeholder="Filter by assignee..."
        value={filters.assignee}
        onChange={set('assignee')}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
      />
      <select
        value={filters.priority}
        onChange={set('priority')}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <select
        value={filters.status}
        onChange={set('status')}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="REVIEW">Review</option>
        <option value="DONE">Done</option>
      </select>
      <input
        type="text"
        placeholder="Filter by project..."
        value={filters.project}
        onChange={set('project')}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
      />
      {hasFilters && (
        <button
          onClick={() => onChange({ assignee: '', priority: '', status: '', project: '' })}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
