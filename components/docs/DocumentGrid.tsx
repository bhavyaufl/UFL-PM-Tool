'use client'

import { Document } from './DocumentsClient'
import { formatDate } from '@/lib/utils'

type Props = {
  docs: Document[]
  onDelete: (id: string) => void
}

function fileIcon(mimeType: string | null) {
  if (!mimeType) return '📄'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📗'
  return '📄'
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentGrid({ docs, onDelete }: Props) {
  if (docs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        No documents yet. Upload your first file!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {docs.map((doc) => (
        <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between">
            <span className="text-3xl">{fileIcon(doc.mimeType)}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={doc.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <button
                onClick={() => onDelete(doc.id)}
                className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{doc.title}</p>
            {doc.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            {doc.category && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {doc.category}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatBytes(doc.fileSize)}</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">{formatDate(doc.createdAt)}</p>
          <p className="text-xs text-gray-300 truncate mt-0.5">{doc.fileName}</p>
        </div>
      ))}
    </div>
  )
}
