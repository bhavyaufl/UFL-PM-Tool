'use client'

import { useState, useEffect, useCallback } from 'react'
import { OKRSection } from './OKRSection'
import { KPISection } from './KPISection'

export type KeyResult = {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: string
  owner: string | null
  objectiveId: string
}

export type Objective = {
  id: string
  title: string
  description: string | null
  quarter: string | null
  year: number | null
  keyResults: KeyResult[]
}

export type KPILog = {
  id: string
  value: number
  date: string
  notes: string | null
}

export type KPIMetric = {
  id: string
  name: string
  description: string | null
  unit: string | null
  logs: KPILog[]
}

export function KPIsClient() {
  const [tab, setTab] = useState<'okrs' | 'kpis'>('okrs')
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [metrics, setMetrics] = useState<KPIMetric[]>([])

  const fetchObjectives = useCallback(async () => {
    const res = await fetch('/api/objectives')
    setObjectives(await res.json())
  }, [])

  const fetchMetrics = useCallback(async () => {
    const res = await fetch('/api/kpi-metrics')
    setMetrics(await res.json())
  }, [])

  useEffect(() => {
    fetchObjectives()
    fetchMetrics()
  }, [fetchObjectives, fetchMetrics])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KPIs & OKRs</h1>
        <p className="text-gray-500 text-sm mt-1">Track objectives, key results, and performance metrics</p>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setTab('okrs')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'okrs' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          OKRs
        </button>
        <button
          onClick={() => setTab('kpis')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'kpis' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          KPI Dashboard
        </button>
      </div>

      {tab === 'okrs' ? (
        <OKRSection objectives={objectives} onRefresh={fetchObjectives} />
      ) : (
        <KPISection metrics={metrics} onRefresh={fetchMetrics} />
      )}
    </div>
  )
}
