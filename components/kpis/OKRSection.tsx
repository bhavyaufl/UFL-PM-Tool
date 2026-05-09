'use client'

import { useState } from 'react'
import { Objective, KeyResult } from './KPIsClient'
import { getProgressBgColor, getProgressColor } from '@/lib/utils'

type Props = {
  objectives: Objective[]
  onRefresh: () => void
}

function calcKRProgress(kr: KeyResult) {
  if (kr.targetValue === 0) return 0
  return Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
}

function calcObjectiveProgress(obj: Objective) {
  if (obj.keyResults.length === 0) return 0
  return Math.round(obj.keyResults.reduce((s, kr) => s + calcKRProgress(kr), 0) / obj.keyResults.length)
}

export function OKRSection({ objectives, onRefresh }: Props) {
  const [showObjForm, setShowObjForm] = useState(false)
  const [showKRForm, setShowKRForm] = useState<string | null>(null)
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null)
  const [objForm, setObjForm] = useState({ title: '', description: '', quarter: '', year: '' })
  const [krForm, setKRForm] = useState({ title: '', targetValue: '', currentValue: '0', unit: '%', owner: '' })

  async function createObjective(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objForm),
    })
    setObjForm({ title: '', description: '', quarter: '', year: '' })
    setShowObjForm(false)
    onRefresh()
  }

  async function deleteObjective(id: string) {
    if (!confirm('Delete this objective and all its key results?')) return
    await fetch(`/api/objectives/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  async function createKR(e: React.FormEvent, objectiveId: string) {
    e.preventDefault()
    await fetch('/api/key-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...krForm, objectiveId }),
    })
    setKRForm({ title: '', targetValue: '', currentValue: '0', unit: '%', owner: '' })
    setShowKRForm(null)
    onRefresh()
  }

  async function updateKRValue(id: string, currentValue: string) {
    await fetch(`/api/key-results/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentValue }),
    })
    onRefresh()
  }

  async function deleteKR(id: string) {
    await fetch(`/api/key-results/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Objectives & Key Results</h2>
        <button
          onClick={() => setShowObjForm(!showObjForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Objective
        </button>
      </div>

      {showObjForm && (
        <form onSubmit={createObjective} className="bg-white rounded-xl border border-blue-200 p-4 mb-4 space-y-3">
          <input required type="text" placeholder="Objective title *" value={objForm.title} onChange={(e) => setObjForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Description" value={objForm.description} onChange={(e) => setObjForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-3">
            <input type="text" placeholder="Quarter (e.g. Q2)" value={objForm.quarter} onChange={(e) => setObjForm((f) => ({ ...f, quarter: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Year" value={objForm.year} onChange={(e) => setObjForm((f) => ({ ...f, year: e.target.value }))} className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowObjForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">Create</button>
          </div>
        </form>
      )}

      {objectives.length === 0 && !showObjForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No objectives yet. Create your first OKR!
        </div>
      )}

      <div className="space-y-6">
        {objectives.map((obj) => {
          const progress = calcObjectiveProgress(obj)
          return (
            <div key={obj.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base">{obj.title}</h3>
                      {obj.quarter && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{obj.quarter} {obj.year}</span>}
                    </div>
                    {obj.description && <p className="text-sm text-gray-500 mt-1">{obj.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getProgressColor(progress)}`}>{progress}%</p>
                      <p className="text-xs text-gray-400">overall</p>
                    </div>
                    <button onClick={() => deleteObjective(obj.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${getProgressBgColor(progress)}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{progress}%</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {obj.keyResults.map((kr) => {
                  const krProgress = calcKRProgress(kr)
                  return (
                    <div key={kr.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{kr.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${getProgressBgColor(krProgress)}`} style={{ width: `${krProgress}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${getProgressColor(krProgress)}`}>{krProgress}%</span>
                        </div>
                        {kr.owner && <p className="text-xs text-gray-400 mt-0.5">Owner: {kr.owner}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                        <input
                          type="number"
                          defaultValue={kr.currentValue}
                          onBlur={(e) => updateKRValue(kr.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span>/</span>
                        <span className="font-medium">{kr.targetValue} {kr.unit}</span>
                      </div>
                      <button onClick={() => deleteKR(kr.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )
                })}

                {showKRForm === obj.id ? (
                  <form onSubmit={(e) => createKR(e, obj.id)} className="border border-blue-200 rounded-lg p-3 space-y-2">
                    <input required type="text" placeholder="Key result title *" value={krForm.title} onChange={(e) => setKRForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <div className="flex gap-2">
                      <input required type="number" placeholder="Target *" value={krForm.targetValue} onChange={(e) => setKRForm((f) => ({ ...f, targetValue: e.target.value }))} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <input type="number" placeholder="Current" value={krForm.currentValue} onChange={(e) => setKRForm((f) => ({ ...f, currentValue: e.target.value }))} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <input type="text" placeholder="Unit (%, $…)" value={krForm.unit} onChange={(e) => setKRForm((f) => ({ ...f, unit: e.target.value }))} className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <input type="text" placeholder="Owner" value={krForm.owner} onChange={(e) => setKRForm((f) => ({ ...f, owner: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowKRForm(null)} className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Add Key Result</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowKRForm(obj.id)}
                    className="w-full text-xs text-blue-600 hover:text-blue-700 py-2 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 transition"
                  >
                    + Add Key Result
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
