'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnalysisHistoryService, AnalysisHistoryItem } from '@/lib/services/analysis-history'
import { Trash2, Eye, Download, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisHistoryProps {
  onViewReport: (item: AnalysisHistoryItem) => void
}

export function AnalysisHistory({ onViewReport }: AnalysisHistoryProps) {
  const [history, setHistory] = React.useState<AnalysisHistoryItem[]>([])

  React.useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const items = AnalysisHistoryService.getHistory()
    setHistory(items)
  }

  const handleDelete = (id: string) => {
    if (confirm('この解析履歴を削除しますか？')) {
      AnalysisHistoryService.deleteHistoryItem(id)
      loadHistory()
    }
  }

  const handleClearAll = () => {
    if (confirm('すべての解析履歴を削除しますか？この操作は取り消せません。')) {
      AnalysisHistoryService.clearHistory()
      loadHistory()
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'moderate':
        return 'text-orange-600 bg-orange-50'
      case 'minor':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">解析履歴がありません</p>
            <p className="text-sm text-gray-400 mt-2">
              新しい解析を実行すると、ここに履歴が表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">解析履歴</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          すべて削除
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const criticalCount = item.result.summary.critical_count
          const moderateCount = item.result.summary.moderate_count
          const minorCount = item.result.summary.minor_count
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {item.project.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.timestamp)}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReport(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      表示
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">画像枚数</p>
                    <p className="font-medium">{item.uploadedFiles.count}枚</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">検出異常</p>
                    <p className="font-medium">{item.result.summary.total_anomalies}件</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">推定損失</p>
                    <p className="font-medium">
                      {(item.result.summary.estimated_power_loss / 1000).toFixed(1)} kW
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">重要度</p>
                    <div className="flex gap-1 mt-1">
                      {criticalCount > 0 && (
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getSeverityColor('critical'))}>
                          重大 {criticalCount}
                        </span>
                      )}
                      {moderateCount > 0 && (
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getSeverityColor('moderate'))}>
                          中 {moderateCount}
                        </span>
                      )}
                      {minorCount > 0 && (
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getSeverityColor('minor'))}>
                          軽 {minorCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}