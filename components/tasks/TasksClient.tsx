'use client'

import { useState, useEffect, useCallback } from 'react'
import { KanbanBoard } from './KanbanBoard'
import { TaskList } from './TaskList'
import { TaskForm } from './TaskForm'
import { TaskFilters } from './TaskFilters'

export type Task = {
  id: string
  title: string
  description: string | null
  assignee: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate: string | null
  project: string | null
  createdAt: string
  updatedAt: string
}

export type Filters = {
  assignee: string
  priority: string
  status: string
  project: string
}

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<Filters>({ assignee: '', priority: '', status: '', project: '' })

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.assignee) params.set('assignee', filters.assignee)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.status) params.set('status', filters.status)
    if (filters.project) params.set('project', filters.project)
    const res = await fetch(`/api/tasks?${params}`)
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function handleStatusChange(id: string, status: Task['status']) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchTasks()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingTask(null)
    fetchTasks()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + New Task
          </button>
        </div>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading tasks...</div>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <TaskList tasks={tasks} onStatusChange={handleStatusChange} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
