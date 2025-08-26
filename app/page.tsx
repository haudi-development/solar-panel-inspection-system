'use client'

import React, { useState, useEffect } from 'react'
import { ImageUploader } from '@/components/upload/ImageUploader'
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress'
import { ReportViewer } from '@/components/report/ReportViewer'
import { AnalysisHistory } from '@/components/history/AnalysisHistory'
import { generateDummyAnomalies, calculateSummary, simulateAnalysisProgress } from '@/lib/utils/dummy-data-generator'
import { AnalysisHistoryService, AnalysisHistoryItem } from '@/lib/services/analysis-history'
import { AnalysisResult, Project, Inspection } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Upload, History, Plus, Home, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [step, setStep] = useState<'upload' | 'analyzing' | 'report'>('upload')
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null)
  const [historyItem, setHistoryItem] = useState<AnalysisHistoryItem | null>(null)

  // Default project data
  const createProject = (): Project => ({
    id: `project-${Date.now()}`,
    name: 'オリックス太陽光発電所 #1',
    location: '千葉県市原市',
    capacity_mw: 2.5,
    panel_rows: 4,
    panel_cols: 12,
    created_at: new Date().toISOString(),
  })

  const createInspection = (projectId: string): Inspection => ({
    id: `inspection-${Date.now()}`,
    project_id: projectId,
    inspection_date: new Date().toISOString(),
    status: 'completed',
    total_panels: 48,
    created_at: new Date().toISOString(),
  })

  useEffect(() => {
    const project = createProject()
    setCurrentProject(project)
    setCurrentInspection(createInspection(project.id))
  }, [])

  const handleUpload = async (files: File[]) => {
    if (!currentProject || !currentInspection) return

    setUploadedFiles(files)
    setStep('analyzing')
    
    // Simulate analysis process
    await simulateAnalysisProgress((progress, message) => {
      setProgress(progress)
      setProgressMessage(message)
    })

    // Generate dummy analysis results
    const anomalies = generateDummyAnomalies(
      currentInspection.id, 
      currentProject.panel_rows, 
      currentProject.panel_cols
    )
    const summary = calculateSummary(anomalies)
    
    const result: AnalysisResult = {
      inspection_id: currentInspection.id,
      anomalies,
      summary
    }

    // Save to history
    AnalysisHistoryService.addToHistory({
      project: currentProject,
      inspection: currentInspection,
      result,
      uploadedFiles: {
        name: files[0]?.name || 'images',
        size: files.reduce((acc, file) => acc + file.size, 0),
        count: files.length
      }
    })

    setAnalysisResult(result)
    setStep('report')
  }

  const handleReset = () => {
    const project = createProject()
    setCurrentProject(project)
    setCurrentInspection(createInspection(project.id))
    setStep('upload')
    setProgress(0)
    setProgressMessage('')
    setAnalysisResult(null)
    setUploadedFiles([])
    setHistoryItem(null)
  }

  const handleViewHistoryReport = (item: AnalysisHistoryItem) => {
    setCurrentProject(item.project)
    setCurrentInspection(item.inspection)
    setAnalysisResult(item.result)
    setHistoryItem(item)
    setStep('report')
    setActiveTab('new')
  }

  const handleBackToHistory = () => {
    handleReset()
    setActiveTab('history')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'history')}>
        <div className="mb-6 flex justify-between items-center">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新規解析
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              解析履歴
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {step === 'report' && historyItem && (
              <Button onClick={handleBackToHistory} variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                履歴に戻る
              </Button>
            )}
            <Link href="/mega-solar">
              <Button variant="outline" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                メガソーラーモード
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="new">
          {step === 'upload' && currentProject && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">太陽光パネル点検を開始</CardTitle>
                  <CardDescription>
                    ドローンで撮影した画像をアップロードして、AIによる異常検出を実行します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">プロジェクト情報</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>施設名:</strong> {currentProject.name}</p>
                        <p><strong>場所:</strong> {currentProject.location}</p>
                        <p><strong>容量:</strong> {currentProject.capacity_mw} MW</p>
                        <p><strong>パネル数:</strong> {currentProject.panel_rows * currentProject.panel_cols}枚</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">解析プロセス</h3>
                      <ol className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-primary">1.</span>
                          画像をアップロード
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">2.</span>
                          オルソ画像を生成
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">3.</span>
                          AIで異常を検出
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-gray-400">4.</span>
                          レポートを確認
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ImageUploader onUpload={handleUpload} />
            </div>
          )}

          {step === 'analyzing' && (
            <AnalysisProgress
              progress={progress}
              message={progressMessage}
              isComplete={progress === 100}
            />
          )}

          {step === 'report' && analysisResult && currentProject && currentInspection && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">点検結果</h2>
                  {historyItem && (
                    <p className="text-sm text-gray-500 mt-1">
                      解析日時: {new Date(historyItem.timestamp).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
                <Button onClick={handleReset} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  新しい点検を開始
                </Button>
              </div>
              <ReportViewer
                project={currentProject}
                inspection={currentInspection}
                result={analysisResult}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <AnalysisHistory onViewReport={handleViewHistoryReport} />
        </TabsContent>
      </Tabs>
    </div>
  )
}