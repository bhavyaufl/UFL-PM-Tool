'use client'

import { Task } from './TasksClient'
import { TaskCard } from './TaskCard'

type Props = {
  tasks: Task[]
  onStatusChange: (id: string, status: Task['status']) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}

const columns: { id: Task['status']; label: string; color: string; dot: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100', dot: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50', dot: 'bg-blue-500' },
  { id: 'REVIEW', label: 'Review', color: 'bg-yellow-50', dot: 'bg-yellow-500' },
  { id: 'DONE', label: 'Done', color: 'bg-green-50', dot: 'bg-green-500' },
]

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className={`${col.color} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
              <span className="ml-auto text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
