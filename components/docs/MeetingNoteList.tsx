'use client'

import { MeetingNote } from './DocumentsClient'
import { formatDate } from '@/lib/utils'

type Props = {
  notes: MeetingNote[]
  onDelete: (id: string) => void
  onEdit: (note: MeetingNote) => void
}

export function MeetingNoteList({ notes, onDelete, onEdit }: Props) {
  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        No meeting notes yet. Create your first one!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{note.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {formatDate(note.date)}
                </span>
              </div>

              {note.attendees && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-600">Attendees:</span> {note.attendees}
                </p>
              )}

              {note.agenda && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Agenda</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.agenda}</p>
                </div>
              )}

              {note.notes && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{note.notes}</p>
                </div>
              )}

              {note.actionItems && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Action Items</p>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">{note.actionItems}</p>
                </div>
              )}
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
