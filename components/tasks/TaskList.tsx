'use client'

import { Task } from './TasksClient'
import { formatDate, isOverdue } from '@/lib/utils'

type Props = {
  tasks: Task[]
  onStatusChange: (id: string, status: Task['status']) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
}

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
}

export function TaskList({ tasks, onStatusChange, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        No tasks found. Create your first task!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">TASK</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">ASSIGNEE</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">PRIORITY</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">STATUS</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">DUE DATE</th>
            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">PROJECT</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'
            return (
              <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{task.assignee || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                    className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer focus:outline-none ${statusColors[task.status]}`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td className={`px-4 py-3 text-sm ${overdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                </td>
                <td className="px-4 py-3 text-xs text-blue-600">{task.project || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
