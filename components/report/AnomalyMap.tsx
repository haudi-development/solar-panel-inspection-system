'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anomaly } from '@/types'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface AnomalyMapProps {
  anomalies: Anomaly[]
  rows?: number
  cols?: number
  onPanelClick?: (panelId: string) => void
}

export function AnomalyMap({ 
  anomalies, 
  rows = 4, 
  cols = 12,
  onPanelClick
}: AnomalyMapProps) {
  const anomalyMap = new Map(
    anomalies.map(a => [`${a.coordinates?.row}-${a.coordinates?.col}`, a])
  )

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600'
      case 'moderate':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'minor':
        return 'bg-yellow-500 hover:bg-yellow-600'
      default:
        return 'bg-green-500 hover:bg-green-600'
    }
  }

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-3 w-3" />
      case 'moderate':
        return <AlertTriangle className="h-3 w-3" />
      case 'minor':
        return <Info className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>パネルマップ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Column headers */}
          <div className="flex items-center gap-1">
            <div className="w-8" /> {/* Spacer for row headers */}
            {Array.from({ length: cols }, (_, i) => (
              <div key={`col-${i}`} className="flex-1 text-center text-xs font-medium text-gray-600">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Grid with row headers */}
          <div className="flex gap-1">
            {/* Row headers */}
            <div className="flex flex-col gap-1">
              {Array.from({ length: rows }, (_, i) => (
                <div key={`row-${i}`} className="h-full aspect-square flex items-center justify-center text-xs font-medium text-gray-600">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            
            {/* Panel grid */}
            <div className="flex-1">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: rows }, (_, rowIndex) => 
              Array.from({ length: cols }, (_, colIndex) => {
                const row = rowIndex + 1
                const col = colIndex + 1
                const key = `${row}-${col}`
                const anomaly = anomalyMap.get(key)
                const panelId = `${String.fromCharCode(65 + rowIndex)}${(col).toString().padStart(2, '0')}`

                return (
                  <button
                    key={key}
                    onClick={() => onPanelClick?.(panelId)}
                    className={cn(
                      "aspect-square rounded border-2 flex items-center justify-center transition-all relative group",
                      anomaly 
                        ? getSeverityColor(anomaly.severity) 
                        : "bg-green-500 hover:bg-green-600",
                      "border-white"
                    )}
                    title={anomaly 
                      ? `${panelId} (${String.fromCharCode(65 + rowIndex)}${col}): ${anomaly.anomaly_type}` 
                      : `${panelId} (${String.fromCharCode(65 + rowIndex)}${col})`}
                  >
                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {panelId}
                    </span>
                    {anomaly && (
                      <div className="absolute top-0.5 right-0.5 text-white">
                        {getSeverityIcon(anomaly.severity)}
                      </div>
                    )}
                  </button>
                )
              })
            ).flat()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">軽微</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-sm">中程度</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">重大</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}