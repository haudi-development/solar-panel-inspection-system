'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SolarBlock, ThermalAnomaly } from '@/types/mega-solar'
import { cn } from '@/lib/utils'
import { 
  ZoomIn, ZoomOut, Move, Maximize2, AlertCircle, 
  AlertTriangle, Info, MapPin, Thermometer, Grid 
} from 'lucide-react'

interface MegaSolarMapProps {
  blocks: SolarBlock[]
  anomalies: Map<string, ThermalAnomaly[]> // blockId -> anomalies
  onBlockClick?: (block: SolarBlock) => void
  totalRows?: number
  totalCols?: number
}

export function MegaSolarMap({ 
  blocks, 
  anomalies,
  onBlockClick,
  totalRows = 50, // 50行
  totalCols = 35  // 35列（不規則な配置に対応）
}: MegaSolarMapProps) {
  const blockSize = 18 // ブロックサイズを小さくして全体を表示
  
  // 初期設定
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 })
  const [zoom, setZoom] = useState(0.5) // デフォルトのズーム値
  const [offset, setOffset] = useState({ x: 100, y: 50 }) // デフォルトのオフセット
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedBlock, setSelectedBlock] = useState<SolarBlock | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const minZoom = 0.2
  const maxZoom = 3

  // ブロックの異常カテゴリに基づく色を取得
  const getBlockColor = (blockId: string, hasData: boolean) => {
    if (!hasData) return 'bg-gray-400 hover:bg-gray-500'
    
    const blockAnomalies = anomalies.get(blockId) || []
    if (blockAnomalies.length === 0) return 'bg-green-500 hover:bg-green-600'
    
    // 最も深刻なカテゴリの色を返す
    const hasHotspot = blockAnomalies.some(a => a.category === 'hotspot')
    const hasBypassDiode = blockAnomalies.some(a => a.category === 'bypass_diode')
    const hasVegetation = blockAnomalies.some(a => a.category === 'vegetation')
    const hasSoiling = blockAnomalies.some(a => a.category === 'soiling')
    
    if (hasHotspot) return 'bg-red-500 hover:bg-red-600'
    if (hasBypassDiode) return 'bg-orange-500 hover:bg-orange-600'
    if (hasVegetation) return 'bg-yellow-500 hover:bg-yellow-600'
    if (hasSoiling) return 'bg-yellow-400 hover:bg-yellow-500'
    return 'bg-green-500 hover:bg-green-600'
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, maxZoom))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, minZoom))
  }

  const handleReset = () => {
    // 全体が見えるように計算
    const zoomX = containerSize.width / (totalCols * blockSize + 100)
    const zoomY = (containerSize.height - 100) / (totalRows * blockSize + 100)
    const newZoom = Math.min(zoomX, zoomY, 1.0) * 0.9
    
    setZoom(newZoom)
    setOffset({ 
      x: (containerSize.width - totalCols * blockSize * newZoom) / 2,
      y: (containerSize.height - totalRows * blockSize * newZoom) / 2
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // タッチイベント対応
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleBlockClick = (block: SolarBlock) => {
    setSelectedBlock(block)
    onBlockClick?.(block)
  }

  // ダミーデータ生成（実際はpropsから受け取る）
  const generateDummyBlocks = (): SolarBlock[] => {
    const dummyBlocks: SolarBlock[] = []
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        const blockNumber = `${String.fromCharCode(65 + Math.floor(row / 10))}${row % 10}-${col + 1}`
        dummyBlocks.push({
          id: `block-${row}-${col}`,
          siteId: 'site-1',
          blockNumber,
          coordinate: {
            latitude: 35.6762 + (row * 0.0001),
            longitude: 139.6503 + (col * 0.0001)
          },
          panelsPerBlock: 10,
          rows: 2,
          cols: 5,
          capturedAt: new Date().toISOString()
        })
      }
    }
    return dummyBlocks
  }

  const displayBlocks = blocks.length > 0 ? blocks : generateDummyBlocks()

  // コンテナサイズを取得して初期表示を調整
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const width = rect.width || 1200
        const height = rect.height - 100 || 500 // ヘッダーとコントロール分を引く
        setContainerSize({ width, height })
        
        // 全体が見えるように計算
        const zoomX = width / (totalCols * blockSize + 100)
        const zoomY = height / (totalRows * blockSize + 100)
        const newZoom = Math.min(zoomX, zoomY, 1.0) * 0.9
        
        setZoom(newZoom)
        setOffset({
          x: (width - totalCols * blockSize * newZoom) / 2,
          y: (height - totalRows * blockSize * newZoom) / 2 + 50
        })
      }
    }, 100) // レンダリング後に実行
    
    return () => clearTimeout(timer)
  }, [blockSize, totalRows, totalCols])

  // 統計を計算
  const allAnomalies = Array.from(anomalies.values()).flat()
  const hotspotCount = allAnomalies.filter(a => a.category === 'hotspot').length
  const bypassDiodeCount = allAnomalies.filter(a => a.category === 'bypass_diode').length
  const vegetationCount = allAnomalies.filter(a => a.category === 'vegetation').length
  const soilingCount = allAnomalies.filter(a => a.category === 'soiling').length
  const analyzedBlocks = displayBlocks.filter(b => b.thermalImageUrl).length
  const blocksWithAnomalies = anomalies.size
  const normalBlocks = analyzedBlocks - blocksWithAnomalies

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
            <Grid className="h-4 md:h-5 w-4 md:w-5" />
            <span className="hidden md:inline">メガソーラーマップ（{totalRows}×{totalCols} = {totalRows * totalCols}ブロック）</span>
            <span className="md:hidden">マップ</span>
          </CardTitle>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} className="p-1 md:px-2">
              <ZoomOut className="h-3 md:h-4 w-3 md:w-4" />
            </Button>
            <span className="text-xs md:text-sm font-medium px-1 md:px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} className="p-1 md:px-2">
              <ZoomIn className="h-3 md:h-4 w-3 md:w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="p-1 md:px-2">
              <Maximize2 className="h-3 md:h-4 w-3 md:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* マップビューポート */}
          <div 
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-[400px] md:h-[600px]"
          >
            <div
              ref={mapRef}
              className="absolute inset-0 cursor-move select-none touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <div
                className="relative"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  width: `${totalCols * blockSize}px`,
                  height: `${totalRows * blockSize}px`,
                  transition: isDragging ? 'none' : 'transform 0.2s'
                }}
              >
                {/* グリッド背景 */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, #000 0px, transparent 1px, transparent ${blockSize}px, #000 ${blockSize + 1}px),
                      repeating-linear-gradient(90deg, #000 0px, transparent 1px, transparent ${blockSize}px, #000 ${blockSize + 1}px)
                    `
                  }}
                />

                {/* ブロック */}
                {displayBlocks.map((block, index) => {
                  const row = Math.floor(index / totalCols)
                  const col = index % totalCols
                  const blockAnomalies = anomalies.get(block.id) || []
                  const hasData = block.thermalImageUrl !== undefined

                  return (
                    <div
                      key={block.id}
                      className={cn(
                        "absolute border border-white/50 flex items-center justify-center transition-all",
                        getBlockColor(block.id, hasData),
                        selectedBlock?.id === block.id && "ring-2 ring-blue-500 ring-offset-2",
                        "cursor-pointer"
                      )}
                      style={{
                        left: `${col * blockSize}px`,
                        top: `${row * blockSize}px`,
                        width: `${blockSize}px`,
                        height: `${blockSize}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBlockClick(block)
                      }}
                      title={`ブロック ${block.blockNumber}\n異常: ${blockAnomalies.length}件`}
                    >
                      {blockAnomalies.length > 0 && (
                        <div className="text-white">
                          {blockAnomalies.some(a => a.category === 'hotspot') ? (
                            <Thermometer className="h-4 w-4" />
                          ) : blockAnomalies.some(a => a.category === 'bypass_diode') ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : blockAnomalies.some(a => a.category === 'vegetation') ? (
                            <Grid className="h-4 w-4" />
                          ) : (
                            <Info className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ミニマップ */}
            <div className="absolute bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg p-2 shadow-lg">
              <div className="text-xs font-medium mb-1">全体図</div>
              <div 
                className="relative bg-gray-200"
                style={{
                  width: '150px',
                  height: `${150 * (totalRows / totalCols)}px`
                }}
              >
                <div
                  className="absolute bg-blue-500/30 border border-blue-500"
                  style={{
                    width: `${100 / zoom}%`,
                    height: `${100 / zoom}%`,
                    left: `${50 - (offset.x / (totalCols * blockSize * zoom)) * 100}%`,
                    top: `${50 - (offset.y / (totalRows * blockSize * zoom)) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded" />
                  <div>
                    <p className="text-sm text-gray-500">正常</p>
                    <p className="text-lg font-bold">{normalBlocks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">ホットスポット</p>
                    <p className="text-lg font-bold">{hotspotCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">バイパスダイオード</p>
                    <p className="text-lg font-bold">{bypassDiodeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Grid className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">植生</p>
                    <p className="text-lg font-bold">{vegetationCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">汚れ</p>
                    <p className="text-lg font-bold">{soilingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 選択中のブロック情報 */}
          {selectedBlock && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ブロック {selectedBlock.blockNumber} の詳細
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 基本情報 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>座標:</strong> {selectedBlock.coordinate.latitude.toFixed(6)}, {selectedBlock.coordinate.longitude.toFixed(6)}
                      </p>
                      <p className="text-sm">
                        <strong>パネル数:</strong> {selectedBlock.panelsPerBlock}枚（{selectedBlock.rows}×{selectedBlock.cols}）
                      </p>
                      <p className="text-sm">
                        <strong>撮影日時:</strong> {selectedBlock.capturedAt ? new Date(selectedBlock.capturedAt).toLocaleString('ja-JP') : '未撮影'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>検出異常:</strong> {anomalies.get(selectedBlock.id)?.length || 0}件
                      </p>
                      {anomalies.get(selectedBlock.id)?.map((anomaly, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                          <p><strong>{anomaly.description}</strong></p>
                          <p>温度: {anomaly.temperatureC.toFixed(1)}°C (Δ{anomaly.deltaTemperatureC.toFixed(1)}°C)</p>
                        </div>
                      ))}
                      <Button size="sm" className="mt-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        地図で表示
                      </Button>
                    </div>
                  </div>

                  {/* 画像プレビュー */}
                  {selectedBlock.thermalImageUrl && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* RGB画像 */}
                      <div>
                        <p className="text-sm font-semibold mb-2">RGB画像</p>
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={(() => {
                              // 異常に応じたサンプル画像を選択
                              const blockAnomalies = anomalies.get(selectedBlock.id) || []
                              if (blockAnomalies.length === 0) {
                                return "/mega-solar/samples/sample-rgb-normal.png"
                              }
                              // 最初の異常カテゴリに基づいて画像を選択
                              const firstAnomaly = blockAnomalies[0]
                              if (firstAnomaly.category === 'hotspot') return "/mega-solar/samples/sample-rgb-hotspot.png"
                              if (firstAnomaly.category === 'bypass_diode') return "/mega-solar/samples/sample-rgb-bypass-diode.png"
                              if (firstAnomaly.category === 'vegetation') return "/mega-solar/samples/sample-rgb-vegetation.png"
                              if (firstAnomaly.category === 'soiling') return "/mega-solar/samples/sample-rgb-soiling.png"
                              return "/mega-solar/samples/sample-rgb-normal.png"
                            })()}
                            alt="RGB画像"
                            className="w-full h-48 object-cover"
                          />
                          {/* 異常検出ボックス */}
                          {anomalies.get(selectedBlock.id)?.map((anomaly, index) => (
                            <div
                              key={index}
                              className="absolute border-2 border-red-500"
                              style={{
                                left: `${(anomaly.area.x / 400) * 100}%`,
                                top: `${(anomaly.area.y / 300) * 100}%`,
                                width: `${(anomaly.area.width / 400) * 100}%`,
                                height: `${(anomaly.area.height / 300) * 100}%`
                              }}
                            >
                              <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
                                {anomaly.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* サーマル画像 */}
                      <div>
                        <p className="text-sm font-semibold mb-2">サーマル画像</p>
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={(() => {
                              // 異常に応じたサンプル画像を選択
                              const blockAnomalies = anomalies.get(selectedBlock.id) || []
                              if (blockAnomalies.length === 0) {
                                return "/mega-solar/samples/sample-thermal-normal.png"
                              }
                              // 最初の異常カテゴリに基づいて画像を選択
                              const firstAnomaly = blockAnomalies[0]
                              if (firstAnomaly.category === 'hotspot') return "/mega-solar/samples/sample-thermal-hotspot.png"
                              if (firstAnomaly.category === 'bypass_diode') return "/mega-solar/samples/sample-thermal-bypass-diode.png"
                              if (firstAnomaly.category === 'vegetation') return "/mega-solar/samples/sample-thermal-vegetation.png"
                              if (firstAnomaly.category === 'soiling') return "/mega-solar/samples/sample-thermal-soiling.png"
                              return "/mega-solar/samples/sample-thermal-normal.png"
                            })()}
                            alt="サーマル画像"
                            className="w-full h-48 object-cover"
                          />
                          {/* 温度スケール */}
                          <div className="absolute right-2 top-2 bg-black/50 text-white text-xs p-2 rounded">
                            <p>最高: {anomalies.get(selectedBlock.id)?.[0]?.temperatureC.toFixed(1) || 35}°C</p>
                            <p>最低: 25°C</p>
                          </div>
                          {/* 異常検出ボックス */}
                          {anomalies.get(selectedBlock.id)?.map((anomaly, index) => (
                            <div
                              key={index}
                              className="absolute border-2 border-yellow-400"
                              style={{
                                left: `${(anomaly.area.x / 400) * 100}%`,
                                top: `${(anomaly.area.y / 300) * 100}%`,
                                width: `${(anomaly.area.width / 400) * 100}%`,
                                height: `${(anomaly.area.height / 300) * 100}%`
                              }}
                            >
                              <span className="absolute -bottom-6 right-0 bg-yellow-400 text-black text-xs px-1 rounded">
                                {anomaly.temperatureC.toFixed(1)}°C
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}