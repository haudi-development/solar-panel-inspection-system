'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, MapPin, Thermometer, AlertCircle, 
  FileText, ChevronRight, Grid, Zap 
} from 'lucide-react'
import { SolarSite, SiteAnalysisReport } from '@/types/mega-solar'

interface MegaSolarHistoryItem {
  id: string
  site: SolarSite
  report: SiteAnalysisReport
  timestamp: string
}

interface MegaSolarHistoryProps {
  onViewReport: (item: MegaSolarHistoryItem) => void
}

export function MegaSolarHistory({ onViewReport }: MegaSolarHistoryProps) {
  const [historyItems, setHistoryItems] = useState<MegaSolarHistoryItem[]>([])

  useEffect(() => {
    // ローカルストレージから履歴を読み込み
    const loadHistory = () => {
      const stored = localStorage.getItem('mega-solar-history')
      if (stored) {
        try {
          const items = JSON.parse(stored)
          // Map型を復元
          const restoredItems = items.map((item: any) => ({
            ...item,
            report: {
              ...item.report,
              blockResults: item.report.blockResults.map((result: any) => ({
                ...result,
                anomalies: result.anomalies || []
              }))
            }
          }))
          setHistoryItems(restoredItems)
        } catch (error) {
          console.error('履歴の読み込みエラー:', error)
        }
      }
    }
    loadHistory()
  }, [])

  if (historyItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">解析履歴がありません</p>
          <p className="text-sm text-gray-400 mt-2">
            メガソーラーサイトの解析を実行すると、ここに履歴が表示されます
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">メガソーラー解析履歴</h2>
        <Badge variant="secondary">
          {historyItems.length}件の記録
        </Badge>
      </div>

      {historyItems.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {item.site.name}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleDateString('ja-JP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {item.site.totalCapacityMW} MW
                  </span>
                  <span className="flex items-center gap-1">
                    <Grid className="h-3 w-3" />
                    {item.site.totalPanels.toLocaleString()}パネル
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onViewReport(item)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                レポート表示
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {Math.max(0, item.report.analyzedBlocks - item.report.summary.affectedBlocks)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">正常</p>
                  <p className="font-semibold">
                    {item.report.analyzedBlocks > 0 
                      ? ((Math.max(0, item.report.analyzedBlocks - item.report.summary.affectedBlocks) / item.report.analyzedBlocks) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Thermometer className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">ホットスポット</p>
                  <p className="font-semibold">{item.report.summary.hotspotCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">バイパスダイオード</p>
                  <p className="font-semibold">{item.report.summary.bypassDiodeCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Grid className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">植生</p>
                  <p className="font-semibold">{item.report.summary.vegetationCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">汚れ</p>
                  <p className="font-semibold">{item.report.summary.soilingCount}</p>
                </div>
              </div>
            </div>

            {item.report.summary.recommendedActions.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs font-semibold text-orange-800 mb-1">推奨アクション:</p>
                <p className="text-xs text-orange-700">
                  {item.report.summary.recommendedActions[0]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}