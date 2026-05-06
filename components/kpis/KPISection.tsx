'use client'

import { useState } from 'react'
import { KPIMetric } from './KPIsClient'
import { KPIChart } from './KPIChart'
import { formatDate } from '@/lib/utils'

type Props = {
  metrics: KPIMetric[]
  onRefresh: () => void
}

export function KPISection({ metrics, onRefresh }: Props) {
  const [showMetricForm, setShowMetricForm] = useState(false)
  const [showLogForm, setShowLogForm] = useState<string | null>(null)
  const [metricForm, setMetricForm] = useState({ name: '', description: '', unit: '' })
  const [logForm, setLogForm] = useState({ value: '', date: new Date().toISOString().split('T')[0], notes: '' })

  async function createMetric(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/kpi-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricForm),
    })
    setMetricForm({ name: '', description: '', unit: '' })
    setShowMetricForm(false)
    onRefresh()
  }

  async function deleteMetric(id: string) {
    if (!confirm('Delete this KPI metric and all its data?')) return
    await fetch(`/api/kpi-metrics/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  async function logValue(e: React.FormEvent, metricId: string) {
    e.preventDefault()
    await fetch('/api/kpi-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...logForm, metricId }),
    })
    setLogForm({ value: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowLogForm(null)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">KPI Dashboard</h2>
        <button
          onClick={() => setShowMetricForm(!showMetricForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New KPI Metric
        </button>
      </div>

      {showMetricForm && (
        <form onSubmit={createMetric} className="bg-white rounded-xl border border-blue-200 p-4 mb-4 space-y-3">
          <input required type="text" placeholder="Metric name *" value={metricForm.name} onChange={(e) => setMetricForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Description" value={metricForm.description} onChange={(e) => setMetricForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Unit (e.g. %, $, count)" value={metricForm.unit} onChange={(e) => setMetricForm((f) => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowMetricForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Create</button>
          </div>
        </form>
      )}

      {metrics.length === 0 && !showMetricForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No KPI metrics defined yet. Create your first metric!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const latestLog = metric.logs[metric.logs.length - 1]
          return (
            <div key={metric.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                  {metric.description && <p className="text-xs text-gray-500 mt-0.5">{metric.description}</p>}
                  {latestLog && (
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {latestLog.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                    </p>
                  )}
                  {latestLog && <p className="text-xs text-gray-400">Last logged: {formatDate(latestLog.date)}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowLogForm(showLogForm === metric.id ? null : metric.id)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    + Log Value
                  </button>
                  <button onClick={() => deleteMetric(metric.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {showLogForm === metric.id && (
                <form onSubmit={(e) => logValue(e, metric.id)} className="px-4 py-3 border-b border-gray-100 bg-blue-50 flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Value *</label>
                    <input required type="number" step="any" value={logForm.value} onChange={(e) => setLogForm((f) => ({ ...f, value: e.target.value }))} className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date *</label>
                    <input required type="date" value={logForm.date} onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setShowLogForm(null)} className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Log</button>
                  </div>
                </form>
              )}

              <div className="p-4">
                {metric.logs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No data yet. Log your first value!</p>
                ) : (
                  <KPIChart logs={metric.logs} unit={metric.unit} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
