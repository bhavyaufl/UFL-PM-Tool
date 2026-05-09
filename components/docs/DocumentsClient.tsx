'use client'

import { useState, useEffect, useCallback } from 'react'
import { DocumentGrid } from './DocumentGrid'
import { DocumentForm } from './DocumentForm'
import { MeetingNoteList } from './MeetingNoteList'
import { MeetingNoteForm } from './MeetingNoteForm'

export type Document = {
  id: string
  title: string
  description: string | null
  category: string | null
  fileName: string
  filePath: string
  fileSize: number | null
  mimeType: string | null
  createdAt: string
}

export type MeetingNote = {
  id: string
  title: string
  date: string
  attendees: string | null
  agenda: string | null
  notes: string | null
  actionItems: string | null
  createdAt: string
}

export function DocumentsClient() {
  const [tab, setTab] = useState<'documents' | 'meeting-notes'>('documents')
  const [docs, setDocs] = useState<Document[]>([])
  const [notes, setNotes] = useState<MeetingNote[]>([])
  const [search, setSearch] = useState('')
  const [showDocForm, setShowDocForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null)

  const fetchDocs = useCallback(async () => {
    const params = search ? `?q=${encodeURIComponent(search)}` : ''
    const res = await fetch(`/api/documents${params}`)
    setDocs(await res.json())
  }, [search])

  const fetchNotes = useCallback(async () => {
    const params = search ? `?q=${encodeURIComponent(search)}` : ''
    const res = await fetch(`/api/meeting-notes${params}`)
    setNotes(await res.json())
  }, [search])

  useEffect(() => {
    if (tab === 'documents') fetchDocs()
    else fetchNotes()
  }, [tab, fetchDocs, fetchNotes])

  async function deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    fetchDocs()
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this meeting note?')) return
    await fetch(`/api/meeting-notes/${id}`, { method: 'DELETE' })
    fetchNotes()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Files, documents, and meeting notes</p>
        </div>
        <button
          onClick={() => tab === 'documents' ? setShowDocForm(true) : (setEditingNote(null), setShowNoteForm(true))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          {tab === 'documents' ? '+ Upload Document' : '+ New Meeting Note'}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('documents')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'documents' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setTab('meeting-notes')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'meeting-notes' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Meeting Notes
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {tab === 'documents' ? (
        <DocumentGrid docs={docs} onDelete={deleteDoc} />
      ) : (
        <MeetingNoteList
          notes={notes}
          onDelete={deleteNote}
          onEdit={(note) => { setEditingNote(note); setShowNoteForm(true) }}
        />
      )}

      {showDocForm && (
        <DocumentForm onClose={() => { setShowDocForm(false); fetchDocs() }} />
      )}
      {showNoteForm && (
        <MeetingNoteForm
          note={editingNote}
          onClose={() => { setShowNoteForm(false); setEditingNote(null); fetchNotes() }}
        />
      )}
    </div>
  )
}
