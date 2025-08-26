'use client'

import React, { useState, useEffect } from 'react'
import { ThermalImageUploader } from '@/components/upload/ThermalImageUploader'
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress'
import { MegaSolarMap } from '@/components/report/MegaSolarMap'
import { SolarSiteMap } from '@/components/map/SolarSiteMap'
import { MegaSolarHistory } from '@/components/history/MegaSolarHistory'
import { 
  generateMegaSolarDummyData, 
  generateSiteReport, 
  simulateMegaSolarAnalysis 
} from '@/lib/utils/mega-solar-analyzer'
import { SolarSite, SolarBlock, ThermalAnomaly, SiteAnalysisReport } from '@/types/mega-solar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, Map as MapIcon, Grid, BarChart, Thermometer, AlertCircle,
  AlertTriangle, Info, Zap, Calendar, MapPin, History 
} from 'lucide-react'

export default function MegaSolarPage() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'report' | 'history'>('upload')
  const [activeView, setActiveView] = useState<'grid' | 'map' | 'thermal'>('grid')
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  
  const [site, setSite] = useState<SolarSite | null>(null)
  const [blocks, setBlocks] = useState<SolarBlock[]>([])
  const [anomalies, setAnomalies] = useState<Map<string, ThermalAnomaly[]>>(() => new Map<string, ThermalAnomaly[]>())
  const [report, setReport] = useState<SiteAnalysisReport | null>(null)
  const [historyItem, setHistoryItem] = useState<any>(null)

  useEffect(() => {
    // 初期データ生成
    const { site: dummySite, blocks: dummyBlocks, anomalies: dummyAnomalies } = generateMegaSolarDummyData()
    setSite(dummySite)
    setBlocks(dummyBlocks)
    setAnomalies(dummyAnomalies)
  }, [])

  const handleUpload = async (files: any[]) => {
    setStep('analyzing')
    
    // 解析シミュレーション
    await simulateMegaSolarAnalysis((progress, message) => {
      setProgress(progress)
      setProgressMessage(message)
    })

    // レポート生成
    if (site) {
      const siteReport = generateSiteReport(site, blocks, anomalies)
      setReport(siteReport)
      
      // 履歴に保存
      saveToHistory(site, siteReport)
    }
    
    setStep('report')
  }

  const saveToHistory = (site: SolarSite, report: SiteAnalysisReport) => {
    const historyItem = {
      id: `history-${Date.now()}`,
      site,
      report,
      timestamp: new Date().toISOString()
    }
    
    const stored = localStorage.getItem('mega-solar-history')
    const history = stored ? JSON.parse(stored) : []
    history.unshift(historyItem) // 新しいものを先頭に
    
    // 最大20件まで保存
    if (history.length > 20) {
      history.pop()
    }
    
    localStorage.setItem('mega-solar-history', JSON.stringify(history))
  }

  const handleReset = () => {
    setStep('upload')
    setProgress(0)
    setProgressMessage('')
    setReport(null)
  }

  const handleBlockSelect = (block: SolarBlock) => {
    console.log('Selected block:', block)
  }

  const handleViewHistoryReport = (item: any) => {
    setSite(item.site)
    setReport(item.report)
    setHistoryItem(item)
    
    // blocksとanomaliesを復元
    // generateMegaSolarDummyDataを使ってブロックを再生成
    const { blocks: restoredBlocks } = generateMegaSolarDummyData()
    const restoredAnomalies = new Map<string, ThermalAnomaly[]>()
    
    item.report.blockResults.forEach((result: any) => {
      if (result.anomalies && result.anomalies.length > 0) {
        restoredAnomalies.set(result.blockId, result.anomalies)
      }
    })
    
    setBlocks(restoredBlocks)
    setAnomalies(restoredAnomalies)
    setStep('report')
  }

  const handleShowHistory = () => {
    setStep('history')
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">メガソーラー点検システム</CardTitle>
              <CardDescription className="mt-2">
                大規模太陽光発電所の包括的な異常検出と分析
              </CardDescription>
            </div>
            <div className="flex items-start gap-4">
              {site && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">サイト名</p>
                  <p className="font-semibold">{site.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {site.totalCapacityMW} MW | {site.totalPanels.toLocaleString()}枚
                  </p>
                </div>
              )}
              <Button 
                variant={step === 'history' ? 'default' : 'outline'}
                onClick={handleShowHistory}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                解析履歴
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {step === 'upload' && (
        <div className="space-y-6">
          {/* サイト情報 */}
          {site && (
            <Card>
              <CardHeader>
                <CardTitle>サイト情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      基本情報
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>施設名:</strong> {site.name}</p>
                      <p><strong>場所:</strong> {site.location}</p>
                      <p><strong>総発電容量:</strong> {site.totalCapacityMW} MW</p>
                      <p><strong>中心座標:</strong> {site.centerCoordinate.latitude.toFixed(6)}, {site.centerCoordinate.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      構成
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>総ブロック数:</strong> {site.totalBlocks.toLocaleString()}区画</p>
                      <p><strong>総パネル数:</strong> {site.totalPanels.toLocaleString()}枚</p>
                      <p><strong>ブロックあたり:</strong> 10枚（2×5配置）</p>
                      <p><strong>グリッド構成:</strong> 50行 × 20列</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      解析プロセス
                    </h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-primary">1.</span>
                        サーマル/RGB画像アップロード
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-gray-400">2.</span>
                        ブロック単位で区画識別
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-gray-400">3.</span>
                        AIによる異常検出
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-gray-400">4.</span>
                        包括的レポート生成
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* アップローダー */}
          <ThermalImageUploader onUpload={handleUpload} maxFiles={20} />
        </div>
      )}

      {step === 'analyzing' && (
        <AnalysisProgress
          progress={progress}
          message={progressMessage}
          isComplete={progress === 100}
        />
      )}

      {step === 'report' && report && (
        <div className="space-y-6">
          {/* コントロールバー */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">解析結果</h2>
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(report.inspectionDate).toLocaleString('ja-JP')}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              新しい解析を開始
            </Button>
          </div>

          {/* サマリーカード */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <BarChart className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">解析済み</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">
                      {report.analyzedBlocks}/{report.totalBlocks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">深刻</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.criticalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">軽度</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.moderateCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">ホットスポット</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.hotspotCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">バイパスダイオード</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.bypassDiodeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Grid className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">植生</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.vegetationCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">汚れ</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">{report.summary.soilingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">推定損失</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">
                      {report.summary.estimatedTotalLossKW.toFixed(1)}
                      <span className="text-sm">kW</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 text-[10px] sm:text-xs">影響パネル</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold">
                      {report.summary.affectedPanels}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 推奨アクション */}
          {report.summary.recommendedActions.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  推奨アクション
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.summary.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* ビュー切替タブ */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                グリッドビュー
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                地図ビュー
              </TabsTrigger>
              <TabsTrigger value="thermal" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                サーマルビュー
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6">
              <MegaSolarMap 
                blocks={blocks}
                anomalies={anomalies}
                onBlockClick={handleBlockSelect}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <SolarSiteMap
                blocks={blocks}
                anomalies={anomalies}
                centerCoordinate={site?.centerCoordinate}
                onBlockSelect={handleBlockSelect}
              />
            </TabsContent>

            <TabsContent value="thermal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>サーマルビュー（開発中）</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gradient-to-br from-blue-500 via-yellow-500 to-red-500 rounded-lg opacity-20 flex items-center justify-center">
                    <p className="text-gray-600">サーマル画像オーバーレイ表示機能</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {step === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">解析履歴</h2>
            <Button onClick={handleReset} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              新しい解析を開始
            </Button>
          </div>
          
          <MegaSolarHistory onViewReport={handleViewHistoryReport} />
        </div>
      )}
    </div>
  )
}