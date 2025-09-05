'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, Camera, Thermometer, AlertCircle, MapPin, Clock, 
  TrendingUp, Settings, FileText, Download, Zap, Grid
} from 'lucide-react'
import { ThermalAnomaly, MegaSolarSite } from '@/types'

interface BlockDetailModalProps {
  block: {
    x: number
    y: number
    anomalies: ThermalAnomaly[]
  }
  site: MegaSolarSite
  onClose: () => void
}

// Generate realistic solar panel image URLs based on anomaly type
const generateSolarPanelImageUrl = (anomalies: ThermalAnomaly[], type: 'rgb' | 'thermal'): string => {
  // Determine image type based on most severe anomaly
  let imageType = 'normal'
  if (anomalies.length > 0) {
    const sortedAnomalies = anomalies.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
    })
    
    const primaryAnomaly = sortedAnomalies[0]
    switch (primaryAnomaly.category) {
      case 'hotspot':
        imageType = 'hotspot'
        break
      case 'bypass_diode':
        imageType = 'bypass-diode'
        break
      case 'vegetation':
        imageType = 'vegetation'
        break
      case 'soiling':
        imageType = 'soiling'
        break
      default:
        imageType = 'normal'
    }
  }
  
  return `/mega-solar/samples/sample-${type}-${imageType}.png`
}

// Generate mock thermal overlay data
const generateThermalOverlay = (anomalies: ThermalAnomaly[]) => {
  return anomalies.map((anomaly, index) => ({
    id: anomaly.id,
    x: 50 + (index % 3) * 100, // Mock positions
    y: 60 + Math.floor(index / 3) * 80,
    width: 80,
    height: 60,
    temperature: anomaly.temperature,
    severity: anomaly.severity,
    type: anomaly.type
  }))
}

function BlockDetailModal({ block, site, onClose }: BlockDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'analysis' | 'history'>('overview')
  const [imageView, setImageView] = useState<'rgb' | 'thermal' | 'overlay'>('rgb')
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  
  const hasAnomalies = block.anomalies.length > 0
  
  // Handle keyboard events and prevent background scroll
  useEffect(() => {
    setMounted(true)
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (typeof window !== 'undefined') {
      // Prevent background scrolling when modal is open
      const originalBodyStyle = window.getComputedStyle(document.body).overflow
      const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow
      
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.body.style.overflow = originalBodyStyle
        document.documentElement.style.overflow = originalHtmlStyle
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.removeEventListener('keydown', handleKeyDown)
        setMounted(false)
      }
    }
  }, [onClose])
  const primaryAnomaly = block.anomalies[0]
  const thermalOverlays = generateThermalOverlay(block.anomalies)

  // Calculate global coordinates
  const calculateGlobalCoordinates = () => {
    const blockWidthKm = 0.1 // 100m per block (typical mega solar spacing)
    const blockHeightKm = 0.1
    
    // Calculate offset from site center
    const centerX = site.blocks_x / 2
    const centerY = site.blocks_y / 2
    const offsetX = (block.x - centerX) * blockWidthKm
    const offsetY = (block.y - centerY) * blockHeightKm
    
    // Convert to approximate lat/lng offset (rough calculation)
    const latOffset = offsetY / 111 // 1 degree lat ≈ 111km
    const lngOffset = offsetX / (111 * Math.cos(site.coordinate.lat * Math.PI / 180))
    
    return {
      lat: site.coordinate.lat + latOffset,
      lng: site.coordinate.lng + lngOffset
    }
  }
  
  const globalCoords = calculateGlobalCoordinates()
  
  // Calculate summary stats for this block
  const blockStats = {
    estimatedPanels: 100, // Assume 100 panels per block
    normalPanels: 100 - block.anomalies.length,
    anomalyCount: block.anomalies.length,
    maxTemperature: Math.max(...block.anomalies.map(a => a.temperature), 25),
    avgTemperature: block.anomalies.length > 0 
      ? block.anomalies.reduce((sum, a) => sum + a.temperature, 0) / block.anomalies.length 
      : 25,
    powerLossEstimate: block.anomalies.length * 150 // Rough estimate: 150W per anomaly
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hotspot': return <Thermometer className="h-4 w-4" />
      case 'bypass_diode': return <Zap className="h-4 w-4" />
      case 'vegetation': return <Grid className="h-4 w-4" />
      case 'soiling': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  // Don't render on server side or before component is mounted
  if (!mounted || typeof window === 'undefined') {
    return null
  }

  const modalContent = (
    <div 
      className="bg-black bg-opacity-50 overflow-hidden"
      style={{ 
        position: 'fixed',
        zIndex: 99999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        margin: 0,
        padding: 0
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div className="h-full w-full flex items-center justify-center p-1 sm:p-4">
        <div 
          className="bg-white rounded-lg w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-6 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Grid className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id="modal-title" className="text-base sm:text-xl font-bold text-gray-900 truncate">ブロック詳細</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                位置: ({block.x}, {block.y}) | <span className="hidden sm:inline">{site.name}</span>
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="flex-shrink-0 p-1 sm:p-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col h-full">
            <div className="px-2 sm:px-6 pt-2 sm:pt-6 pb-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-2 py-2">概要</TabsTrigger>
                <TabsTrigger value="images" className="text-xs sm:text-sm px-1 sm:px-2 py-2">画像</TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs sm:text-sm px-1 sm:px-2 py-2">解析</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm px-1 sm:px-2 py-2">履歴</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6">

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-3 sm:space-y-6 mt-0">
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {/* Block Status */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                      ブロック状態
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 pt-0 sm:pt-6">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>ブロック座標:</span>
                      <span className="font-mono">({block.x}, {block.y})</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>グローバル座標:</span>
                      <span className="font-mono text-xs">
                        {globalCoords.lat.toFixed(6)}, {globalCoords.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>推定パネル数:</span>
                      <span className="font-bold">{blockStats.estimatedPanels}枚</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>異常パネル数:</span>
                      <span className={`font-bold ${hasAnomalies ? 'text-red-600' : 'text-green-600'}`}>
                        {blockStats.anomalyCount}枚
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>正常パネル数:</span>
                      <span className="font-bold text-green-600">{blockStats.normalPanels}枚</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>推定電力損失:</span>
                      <span className="font-bold text-orange-600">{blockStats.powerLossEstimate}W</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Panel Layout */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                      ブロック内パネル配置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 sm:pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-sm text-gray-600 mb-2">
                        10×10パネル配置 (推定100枚)
                      </div>
                      
                      {/* Panel Grid */}
                      <div 
                        className="mx-auto border-2 border-gray-300 p-1 sm:p-2 bg-gray-50 rounded"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(10, 1fr)',
                          gap: '1px',
                          width: isMobile ? '150px' : '200px',
                          height: isMobile ? '150px' : '200px',
                        }}
                      >
                        {Array.from({ length: 100 }, (_, i) => {
                          // Simulate some anomalies at panel level
                          const hasAnomalyHere = block.anomalies.some(() => Math.random() < 0.1)
                          const anomalyType = hasAnomalyHere ? 
                            block.anomalies[Math.floor(Math.random() * block.anomalies.length)]?.category : null
                          
                          const getPanelColor = () => {
                            if (!hasAnomalyHere) return 'bg-green-300'
                            switch (anomalyType) {
                              case 'hotspot': return 'bg-red-400'
                              case 'bypass_diode': return 'bg-orange-400'
                              case 'vegetation': return 'bg-green-600'
                              case 'soiling': return 'bg-yellow-400'
                              default: return 'bg-gray-400'
                            }
                          }
                          
                          return (
                            <div
                              key={i}
                              className={`w-full h-full ${getPanelColor()} border border-gray-400 rounded-sm`}
                              title={`パネル ${i + 1}${hasAnomalyHere ? ` - ${anomalyType}` : ' - 正常'}`}
                            />
                          )
                        })}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        緑: 正常 | 赤: ホットスポット | 橙: ダイオード | 黄: 汚れ
                      </div>
                      
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div>最高温度: <span className="font-bold text-red-600">{blockStats.maxTemperature.toFixed(1)}°C</span></div>
                        <div>平均温度: <span className="font-bold">{blockStats.avgTemperature.toFixed(1)}°C</span></div>
                        <div>環境との差: <span className="font-bold text-orange-600">+{(blockStats.maxTemperature - 25).toFixed(1)}°C</span></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Anomalies List */}
              {hasAnomalies && (
                <Card>
                  <CardHeader>
                    <CardTitle>検出された異常</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {block.anomalies.map((anomaly, index) => (
                        <div key={anomaly.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(anomaly.category)}
                            <Badge variant="outline">{anomaly.type}</Badge>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{anomaly.description}</p>
                            <p className="text-sm text-gray-600">
                              温度: {anomaly.temperature.toFixed(1)}°C | 
                              信頼度: {(anomaly.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(anomaly.severity)}`}></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!hasAnomalies && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Grid className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-bold text-green-700 mb-2">ブロック正常</h3>
                    <p className="text-gray-600">このブロックでは異常は検出されませんでした。</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6 mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">画像解析ビュー</h3>
                  <p className="text-sm text-gray-600">
                    {hasAnomalies ? (
                      <>
                        表示中: <span className="font-medium text-red-600">
                          {primaryAnomaly.category === 'hotspot' && 'ホットスポット異常'}
                          {primaryAnomaly.category === 'bypass_diode' && 'バイパスダイオード異常'}
                          {primaryAnomaly.category === 'vegetation' && '植生遮蔽異常'}
                          {primaryAnomaly.category === 'soiling' && '汚れ付着異常'}
                        </span> のサンプル画像
                      </>
                    ) : (
                      <span className="text-green-600">正常ブロックのサンプル画像</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={imageView === 'rgb' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageView('rgb')}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    RGB
                  </Button>
                  <Button
                    variant={imageView === 'thermal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageView('thermal')}
                  >
                    <Thermometer className="h-4 w-4 mr-1" />
                    サーマル
                  </Button>
                  <Button
                    variant={imageView === 'overlay' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageView('overlay')}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    オーバーレイ
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* RGB Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      RGB画像
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <img
                        src={generateSolarPanelImageUrl(block.anomalies, 'rgb')}
                        alt={`RGB image of block (${block.x}, ${block.y})`}
                        className="w-full h-64 object-cover rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/400x300/4ade80/ffffff?text=RGB+Block+(${block.x},${block.y})`
                        }}
                      />
                      {imageView === 'overlay' && hasAnomalies && (
                        <div className="absolute inset-0">
                          {thermalOverlays.map((overlay) => (
                            <div
                              key={overlay.id}
                              className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                              style={{
                                left: `${(overlay.x / 400) * 100}%`,
                                top: `${(overlay.y / 300) * 100}%`,
                                width: `${(overlay.width / 400) * 100}%`,
                                height: `${(overlay.height / 300) * 100}%`,
                              }}
                            >
                              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
                                {overlay.temperature.toFixed(1)}°C
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Thermal Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      サーマル画像
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <img
                        src={generateSolarPanelImageUrl(block.anomalies, 'thermal')}
                        alt={`Thermal image of block (${block.x}, ${block.y})`}
                        className="w-full h-64 object-cover rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/400x300/dc2626/ffffff?text=Thermal+Block+(${block.x},${block.y})`
                        }}
                      />
                      {hasAnomalies && (
                        <div className="absolute inset-0">
                          {thermalOverlays.map((overlay) => (
                            <div
                              key={`thermal-${overlay.id}`}
                              className="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-30"
                              style={{
                                left: `${(overlay.x / 400) * 100}%`,
                                top: `${(overlay.y / 300) * 100}%`,
                                width: `${(overlay.width / 400) * 100}%`,
                                height: `${(overlay.height / 300) * 100}%`,
                              }}
                            >
                              <div className="absolute -top-6 left-0 bg-yellow-600 text-white text-xs px-1 rounded">
                                異常
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Temperature Scale and Sample Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">温度スケール</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">20°C</span>
                      <div className="w-32 h-4 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded"></div>
                      <span className="text-xs">60°C</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <strong>実サンプル画像:</strong> 実際の点検データから取得
                      </div>
                      <div>
                        <strong>異常検知:</strong> AI分析による自動判定結果
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6 mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI解析結果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">解析精度</h4>
                      <p className="text-sm text-blue-700">全体信頼度: 92.3%</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92.3%' }}></div>
                      </div>
                    </div>
                    
                    {hasAnomalies && (
                      <>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <h4 className="font-medium text-red-800">リスク評価</h4>
                          <p className="text-sm text-red-700">
                            {primaryAnomaly.severity === 'high' ? '高リスク - 即座の対応が必要' :
                             primaryAnomaly.severity === 'medium' ? '中リスク - 計画的対応を推奨' :
                             '低リスク - 定期監視を継続'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-800">推奨アクション</h4>
                          <ul className="text-sm text-orange-700 list-disc list-inside mt-1">
                            <li>詳細な現地調査を実施</li>
                            <li>パネルの清掃・メンテナンス</li>
                            <li>継続的な温度監視</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>性能影響</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">推定出力低下:</span>
                        <span className="font-bold text-orange-600">
                          {((blockStats.anomalyCount / blockStats.estimatedPanels) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">月間損失見込:</span>
                        <span className="font-bold text-red-600">
                          ¥{((blockStats.powerLossEstimate * 24 * 30 * 0.02)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">年間損失見込:</span>
                        <span className="font-bold text-red-600">
                          ¥{((blockStats.powerLossEstimate * 24 * 365 * 0.02)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    点検履歴
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">今回の点検 (現在)</p>
                        <p className="text-sm text-gray-600">
                          {hasAnomalies ? `${block.anomalies.length}件の異常を検出` : '異常なし'}
                        </p>
                      </div>
                      <Badge variant="default">最新</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">前回点検 (30日前)</p>
                        <p className="text-sm text-gray-600">異常なし</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">初回点検 (90日前)</p>
                        <p className="text-sm text-gray-600">異常なし</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center p-3 sm:p-6 border-t bg-gray-50 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">座標: {site.coordinate.lat.toFixed(4)}, {site.coordinate.lng.toFixed(4)}</span>
            <span className="sm:hidden">{site.coordinate.lat.toFixed(2)}, {site.coordinate.lng.toFixed(2)}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs px-2 py-1">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">レポート出力</span>
              <span className="sm:hidden">出力</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs px-2 py-1">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">詳細表示</span>
              <span className="sm:hidden">詳細</span>
            </Button>
            <Button onClick={onClose} size="sm" className="flex-1 sm:flex-none text-xs">閉じる</Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default BlockDetailModal