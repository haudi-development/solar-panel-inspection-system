'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, MapPin, Thermometer, AlertCircle, 
  FileText, ChevronRight, Grid, Zap, Trash2, FolderOpen 
} from 'lucide-react'
import { MegaSolarHistoryService, MegaSolarHistoryItem } from '@/lib/services/mega-solar-history'

interface MegaSolarHistoryProps {
  onViewReport: (item: MegaSolarHistoryItem) => void
}

export function MegaSolarHistory({ onViewReport }: MegaSolarHistoryProps) {
  const [historyItems, setHistoryItems] = useState<MegaSolarHistoryItem[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const items = MegaSolarHistoryService.getHistory()
    setHistoryItems(items)
  }

  const handleDeleteItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm('この履歴を削除してもよろしいですか？')) {
      MegaSolarHistoryService.deleteHistoryItem(id)
      loadHistory()
    }
  }

  const handleClearHistory = () => {
    if (confirm('すべての履歴を削除してもよろしいですか？')) {
      MegaSolarHistoryService.clearHistory()
      loadHistory()
    }
  }

  if (historyItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">点検履歴がありません</p>
          <p className="text-sm text-gray-400 mt-2">
            メガソーラーサイトの点検を実行すると、ここに履歴が表示されます
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">メガソーラー点検履歴</h2>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {historyItems.length}件の記録
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearHistory}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            履歴をクリア
          </Button>
        </div>
      </div>

      {historyItems.map((item) => {
        const summary = MegaSolarHistoryService.getSummary(item.anomalies)
        
        return (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    {item.site.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.timestamp).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.site.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Grid className="h-3 w-3" />
                      {item.uploadInfo.totalFiles.toLocaleString()}枚
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{item.site.capacity_mw}</div>
                  <div className="text-xs text-blue-700">MW</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{item.site.total_panels.toLocaleString()}</div>
                  <div className="text-xs text-green-700">パネル</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{item.uploadInfo.estimatedSize}</div>
                  <div className="text-xs text-purple-700">容量</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{summary.total}</div>
                  <div className="text-xs text-orange-700">異常検出</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-600">ホットスポット</p>
                    <p className="font-semibold text-red-700">{summary.byCategory.hotspot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-600">バイパスダイオード</p>
                    <p className="font-semibold text-orange-700">{summary.byCategory.bypass_diode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Grid className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">植生影響</p>
                    <p className="font-semibold text-green-700">{summary.byCategory.vegetation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-600">汚れ影響</p>
                    <p className="font-semibold text-yellow-700">{summary.byCategory.soiling}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-800 mb-1">アップロード情報:</p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>📁 {item.uploadInfo.name}</span>
                  <span>🏞️ {Object.keys(item.uploadInfo.structure).length} エリア</span>
                  <span>💾 {item.uploadInfo.estimatedSize}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}