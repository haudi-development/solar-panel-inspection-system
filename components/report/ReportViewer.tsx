'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Share2, Calendar, MapPin } from 'lucide-react'
import { AnalysisResult, Anomaly, Inspection, Project } from '@/types'
import { AnomalyMap } from './AnomalyMap'
import { StatisticsSummary } from './StatisticsSummary'
import { cn } from '@/lib/utils'

interface ReportViewerProps {
  project: Project
  inspection: Inspection
  result: AnalysisResult
}

export function ReportViewer({ project, inspection, result }: ReportViewerProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  const getAnomalyTypeLabel = (type: Anomaly['anomaly_type']) => {
    const labels = {
      'hotspot_single': '単一ホットスポット',
      'hotspot_multi': '複数ホットスポット',
      'bypass_diode': 'バイパスダイオード故障',
      'soiling': '汚れ',
      'vegetation': '植生による影'
    }
    return labels[type] || type
  }

  const getSeverityLabel = (severity: Anomaly['severity']) => {
    const labels = {
      'critical': '重大',
      'moderate': '中程度',
      'minor': '軽微'
    }
    return labels[severity] || severity
  }

  const handlePanelClick = (panelId: string) => {
    const anomaly = result.anomalies.find(a => a.panel_id === panelId)
    setSelectedAnomaly(anomaly || null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{project.name} - 点検レポート</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>点検日: {new Date(inspection.inspection_date).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{project.location || '場所未設定'}</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                共有
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF出力
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Summary */}
      <StatisticsSummary result={result} />

      {/* Panel Map */}
      <AnomalyMap 
        anomalies={result.anomalies}
        rows={project.panel_rows}
        cols={project.panel_cols}
        onPanelClick={handlePanelClick}
      />

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <CardTitle>異常詳細リスト</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">パネルID</th>
                  <th className="text-left p-2">異常タイプ</th>
                  <th className="text-left p-2">重要度</th>
                  <th className="text-left p-2">IECクラス</th>
                  <th className="text-left p-2">電力損失</th>
                  <th className="text-left p-2">温度差</th>
                </tr>
              </thead>
              <tbody>
                {result.anomalies.map((anomaly) => (
                  <tr 
                    key={anomaly.id} 
                    className={cn(
                      "border-b hover:bg-gray-50 cursor-pointer",
                      selectedAnomaly?.id === anomaly.id && "bg-blue-50"
                    )}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <td className="p-2 font-medium">{anomaly.panel_id}</td>
                    <td className="p-2">{getAnomalyTypeLabel(anomaly.anomaly_type)}</td>
                    <td className="p-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        anomaly.severity === 'critical' && "bg-red-100 text-red-700",
                        anomaly.severity === 'moderate' && "bg-orange-100 text-orange-700",
                        anomaly.severity === 'minor' && "bg-yellow-100 text-yellow-700"
                      )}>
                        {getSeverityLabel(anomaly.severity)}
                      </span>
                    </td>
                    <td className="p-2">{anomaly.iec_class}</td>
                    <td className="p-2">{anomaly.power_loss_watts}W</td>
                    <td className="p-2">
                      {anomaly.temperature_delta ? `+${anomaly.temperature_delta}°C` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Anomaly Detail */}
      {selectedAnomaly && (
        <Card>
          <CardHeader>
            <CardTitle>選択された異常: {selectedAnomaly.panel_id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>異常タイプ:</strong> {getAnomalyTypeLabel(selectedAnomaly.anomaly_type)}</p>
                <p><strong>重要度:</strong> {getSeverityLabel(selectedAnomaly.severity)}</p>
                <p><strong>IECクラス:</strong> {selectedAnomaly.iec_class}</p>
              </div>
              <div className="space-y-2">
                <p><strong>推定電力損失:</strong> {selectedAnomaly.power_loss_watts}W</p>
                {selectedAnomaly.temperature_delta && (
                  <p><strong>温度差:</strong> +{selectedAnomaly.temperature_delta}°C</p>
                )}
                <p><strong>位置:</strong> 行{selectedAnomaly.coordinates?.row}, 列{selectedAnomaly.coordinates?.col}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-1">推奨対応:</p>
              <p className="text-sm text-amber-700">
                {selectedAnomaly.severity === 'critical' 
                  ? '早急な点検と修理が必要です。'
                  : selectedAnomaly.severity === 'moderate'
                  ? '次回の定期メンテナンスで確認してください。'
                  : '経過観察を推奨します。'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}