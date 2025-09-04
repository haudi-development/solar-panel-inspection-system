'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FolderOpen, 
  Upload, 
  FileImage, 
  HardDrive, 
  MapPin, 
  Layers,
  ChevronRight,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react'

interface FolderInfo {
  name: string
  totalFiles: number
  estimatedSize: string
  structure: { [key: string]: number }
}

interface MassImageUploaderProps {
  onFolderSelect: (folderInfo: FolderInfo) => void
}

export function MassImageUploader({ onFolderSelect }: MassImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const simulateFolderAnalysis = useCallback((files: File[]): FolderInfo => {
    // Simulate folder structure analysis
    const totalFiles = Math.floor(Math.random() * 8000) + 2000 // 2000-10000 files
    const estimatedSizeGB = (totalFiles * 8.5 / 1000).toFixed(1) // ~8.5MB per image
    
    // Generate realistic folder structure
    const areas = ['Area_A', 'Area_B', 'Area_C', 'Area_D', 'Area_E', 'Area_F', 'Area_G']
    const structure: { [key: string]: number } = {}
    
    areas.forEach((area, index) => {
      const filesInArea = Math.floor(totalFiles / areas.length) + Math.floor(Math.random() * 200) - 100
      structure[area] = Math.max(filesInArea, 100)
    })

    return {
      name: files[0]?.webkitRelativePath?.split('/')[0] || 'drone-images',
      totalFiles,
      estimatedSize: `${estimatedSizeGB} GB`,
      structure
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsAnalyzing(true)
    setIsDragActive(false)

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const folderInfo = simulateFolderAnalysis(acceptedFiles)
    setSelectedFolder(folderInfo)
    setIsAnalyzing(false)
  }, [simulateFolderAnalysis])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']
    },
    multiple: true
  })

  const handleProceed = () => {
    if (selectedFolder) {
      onFolderSelect(selectedFolder)
    }
  }

  const handleSelectDemoFolder = () => {
    const demoFolder: FolderInfo = {
      name: 'demo-drone-images',
      totalFiles: 3547,
      estimatedSize: '15.2 GB',
      structure: {
        'Area_A': 512,
        'Area_B': 487,
        'Area_C': 623,
        'Area_D': 445,
        'Area_E': 398,
        'Area_F': 567,
        'Area_G': 515
      }
    }
    setSelectedFolder(demoFolder)
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h3 className="text-lg font-semibold">フォルダ構造を解析中...</h3>
            <p className="text-gray-600">画像ファイルを検出し、エリア別構造を分析しています</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedFolder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">フォルダ解析完了</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">検出結果</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">フォルダ名</span>
                    </div>
                    <span className="text-blue-800">{selectedFolder.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-green-600" />
                      <span className="font-medium">画像ファイル</span>
                    </div>
                    <span className="text-green-800">{selectedFolder.totalFiles.toLocaleString()}枚</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">推定容量</span>
                    </div>
                    <span className="text-purple-800">{selectedFolder.estimatedSize}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">エリア別構成</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(selectedFolder.structure).map(([area, count]) => (
                    <div key={area} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium">{area}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count.toLocaleString()}枚</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-medium text-amber-800">処理時間について</h5>
                  <p className="text-sm text-amber-700 mt-1">
                    {selectedFolder.totalFiles.toLocaleString()}枚の画像処理には約{Math.ceil(selectedFolder.totalFiles / 1000) * 2}-{Math.ceil(selectedFolder.totalFiles / 1000) * 4}分程度かかる見込みです。
                    処理中はブラウザを閉じないでください。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedFolder(null)}
                >
                  フォルダを変更
                </Button>
                <Button 
                  onClick={handleProceed}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  解析を開始
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input 
              {...getInputProps()} 
              {...({ webkitdirectory: "", directory: "" } as any)}
              multiple 
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FolderOpen className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? 'フォルダをドロップしてください' : '画像フォルダを選択'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  ドローン撮影画像が格納されたフォルダをドラッグ&ドロップするか、
                  クリックして選択してください
                </p>
              </div>

              <div className="text-sm text-gray-500">
                <p>対応形式: JPG, PNG, TIFF, BMP</p>
                <p>推奨構造: エリア別サブフォルダ</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileImage className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-sm">大量画像対応</div>
              <div className="text-xs text-gray-600">1,000〜10,000枚</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-sm">エリア自動認識</div>
              <div className="text-xs text-gray-600">GPS座標抽出</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Upload className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-sm">段階的処理</div>
              <div className="text-xs text-gray-600">中断・再開可能</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              テスト用のデモデータで進める場合：
            </p>
            <Button 
              variant="outline" 
              onClick={handleSelectDemoFolder}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              デモフォルダを使用
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}