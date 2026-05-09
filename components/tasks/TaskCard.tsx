'use client'

import { Task } from './TasksClient'
import { formatDate, isOverdue } from '@/lib/utils'

type Props = {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'

  return (
    <div className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow group ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.assignee && (
          <span className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
            {task.assignee}
          </span>
        )}
      </div>

      {task.dueDate && (
        <p className={`text-xs mt-2 font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
          {overdue ? '⚠ ' : ''}Due {formatDate(task.dueDate)}
        </p>
      )}

      {task.project && (
        <p className="text-xs text-blue-500 mt-1 truncate">{task.project}</p>
      )}

      <div className="mt-2 pt-2 border-t border-gray-100">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className="text-xs text-gray-500 bg-transparent focus:outline-none w-full cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  )
}
