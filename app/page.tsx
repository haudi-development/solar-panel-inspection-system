'use client'

import React, { useState, useEffect } from 'react'
import { MassImageUploader } from '@/components/upload/MassImageUploader'
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress'
import MegaSolarReportViewer from '@/components/mega-solar/MegaSolarReportViewer'
import { MegaSolarHistory } from '@/components/mega-solar/MegaSolarHistory'
import { generateMegaSolarDummyData, simulateAnalysisProgress } from '@/lib/utils/dummy-data-generator'
import { MegaSolarHistoryService, MegaSolarHistoryItem } from '@/lib/services/mega-solar-history'
import { ThermalAnomaly, MegaSolarSite } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, History, Zap, FolderOpen, MapPin } from 'lucide-react'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')
  const [step, setStep] = useState<'folder-select' | 'file-scanning' | 'upload-progress' | 'analyzing' | 'report'>('folder-select')
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [site, setSite] = useState<MegaSolarSite | null>(null)
  const [anomalies, setAnomalies] = useState<ThermalAnomaly[]>([])
  const [selectedFolderInfo, setSelectedFolderInfo] = useState<{
    name: string
    totalFiles: number
    estimatedSize: string
    structure: { [key: string]: number }
  } | null>(null)

  // Default mega solar site
  const createMegaSolarSite = (): MegaSolarSite => ({
    id: `site-${Date.now()}`,
    name: '千葉中央メガソーラー発電所',
    location: '千葉県市原市',
    capacity_mw: 50,
    total_panels: 100000,
    blocks_x: 50,
    blocks_y: 35,
    coordinate: { lat: 35.4983, lng: 140.1169 },
    created_at: new Date().toISOString(),
  })

  useEffect(() => {
    setSite(createMegaSolarSite())
  }, [])

  const handleFolderSelect = (folderInfo: any) => {
    setSelectedFolderInfo(folderInfo)
    setStep('file-scanning')
    
    // Simulate file scanning
    setTimeout(() => {
      setStep('upload-progress')
      simulateUploadProgress()
    }, 2000)
  }

  const simulateUploadProgress = async () => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      setProgressMessage(`フォルダから画像をアップロード中... ${i}%`)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Start analysis
    setStep('analyzing')
    setProgress(0)
    
    await simulateAnalysisProgress((progress, message) => {
      setProgress(progress)
      setProgressMessage(message)
    })

    // Generate results
    if (site) {
      const dummyData = generateMegaSolarDummyData(site.id, site.blocks_x, site.blocks_y)
      setAnomalies(dummyData.anomalies)

      // Save to history
      MegaSolarHistoryService.addToHistory({
        site,
        anomalies: dummyData.anomalies,
        uploadInfo: selectedFolderInfo || {
          name: 'drone-images',
          totalFiles: 3500,
          estimatedSize: '15.2 GB',
          structure: {}
        }
      })

      setStep('report')
    }
  }

  const handleReset = () => {
    setSite(createMegaSolarSite())
    setStep('folder-select')
    setProgress(0)
    setProgressMessage('')
    setAnomalies([])
    setSelectedFolderInfo(null)
  }

  const handleViewHistoryReport = (item: MegaSolarHistoryItem) => {
    setSite(item.site)
    setAnomalies(item.anomalies)
    setSelectedFolderInfo(item.uploadInfo)
    setStep('report')
    setActiveTab('upload')
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Zap className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">メガソーラー点検システム</h1>
            <p className="text-gray-600">大規模太陽光発電所の点検・監視システム</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'history')}>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              新規点検
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              点検履歴
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'history')}>
        <TabsContent value="upload">
          {step === 'folder-select' && site && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    大規模点検を開始
                  </CardTitle>
                  <CardDescription>
                    ドローンで撮影した大量画像フォルダを選択して、AIによる包括的な異常検出を実行します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-3">サイト情報</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>施設名:</strong> {site.name}</p>
                        <p><strong>所在地:</strong> {site.location}</p>
                        <p><strong>発電容量:</strong> {site.capacity_mw} MW</p>
                        <p><strong>総パネル数:</strong> {site.total_panels.toLocaleString()}枚</p>
                        <p><strong>ブロック数:</strong> {(site.blocks_x * site.blocks_y).toLocaleString()}ブロック</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">点検プロセス</h3>
                      <ol className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-primary">1.</span>
                          画像フォルダを選択
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">2.</span>
                          ファイル構造を解析
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">3.</span>
                          段階的アップロード
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">4.</span>
                          AI包括解析実行
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">5.</span>
                          詳細レポート確認
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-yellow-200 rounded-lg bg-yellow-50/50 p-4">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">メガソーラー対応</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      1,000〜10,000枚の大量画像処理に対応。エリア別フォルダ構造の自動認識と段階的解析が可能です。
                    </p>
                  </div>
                </CardContent>
              </Card>

              <MassImageUploader onFolderSelect={handleFolderSelect} />
            </div>
          )}

          {step === 'file-scanning' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  ファイル構造を解析中...
                </CardTitle>
                <CardDescription>
                  選択されたフォルダの画像ファイルを解析しています
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFolderInfo && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedFolderInfo.totalFiles.toLocaleString()}</div>
                        <div className="text-sm text-blue-700">画像ファイル</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedFolderInfo.estimatedSize}</div>
                        <div className="text-sm text-green-700">推定容量</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{Object.keys(selectedFolderInfo.structure).length}</div>
                        <div className="text-sm text-purple-700">エリア数</div>
                      </div>
                    </div>
                    
                    <div className="animate-pulse">
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-ping"></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(step === 'upload-progress' || step === 'analyzing') && (
            <AnalysisProgress
              progress={progress}
              message={progressMessage}
              isComplete={progress === 100 && step === 'analyzing'}
            />
          )}

          {step === 'report' && site && anomalies.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">メガソーラー点検結果</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    解析完了: {new Date().toLocaleString('ja-JP')}
                  </p>
                </div>
                <Button onClick={handleReset} variant="outline">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  新しい点検を開始
                </Button>
              </div>
              <MegaSolarReportViewer
                site={site}
                anomalies={anomalies}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <MegaSolarHistory onViewReport={handleViewHistoryReport} />
        </TabsContent>
      </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}