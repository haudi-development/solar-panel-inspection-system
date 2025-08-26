'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SolarBlock, ThermalAnomaly, GPSCoordinate } from '@/types/mega-solar'
import { MapPin, Navigation, Layers, Thermometer, AlertCircle } from 'lucide-react'

// Leafletは動的インポート（SSR対応）
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" /> }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)
const Rectangle = dynamic(
  () => import('react-leaflet').then(mod => mod.Rectangle),
  { ssr: false }
)

interface SolarSiteMapProps {
  blocks: SolarBlock[]
  anomalies: Map<string, ThermalAnomaly[]>
  centerCoordinate?: GPSCoordinate
  onBlockSelect?: (block: SolarBlock) => void
}

export function SolarSiteMap({
  blocks,
  anomalies,
  centerCoordinate = { latitude: 35.6762, longitude: 139.6503 }, // 東京のデフォルト座標
  onBlockSelect
}: SolarSiteMapProps) {
  const [mapReady, setMapReady] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<SolarBlock | null>(null)
  const [mapLayer, setMapLayer] = useState<'satellite' | 'map'>('satellite')

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      setMapReady(true)
    }
  }, [])

  // ブロックの重要度に基づく色を取得
  const getBlockColor = (blockId: string): string => {
    const blockAnomalies = anomalies.get(blockId) || []
    if (blockAnomalies.length === 0) return '#10b981' // green-500
    
    const hasHotspot = blockAnomalies.some(a => a.category === 'hotspot')
    const hasBypassDiode = blockAnomalies.some(a => a.category === 'bypass_diode')
    const hasVegetation = blockAnomalies.some(a => a.category === 'vegetation')
    
    if (hasHotspot) return '#ef4444' // red-500
    if (hasBypassDiode) return '#f97316' // orange-500
    if (hasVegetation) return '#10b981' // green-600
    return '#eab308' // yellow-500 (soiling)
  }

  // ダミーブロックデータを生成（mega-solar-analyzer.tsと同じ配置）
  const generateDummyBlocks = (): SolarBlock[] => {
    const dummyBlocks: SolarBlock[] = []
    const baseLatitude = centerCoordinate.latitude
    const baseLongitude = centerCoordinate.longitude
    const rows = 50
    const cols = 35
    
    // サイトレイアウト（mega-solar-analyzer.tsと同じ）
    const siteLayout = [
      { startRow: 0, endRow: 15, startCol: 3, endCol: 18, density: 0.95 },
      { startRow: 0, endRow: 12, startCol: 19, endCol: 28, density: 0.90 },
      { startRow: 16, endRow: 35, startCol: 0, endCol: 15, density: 0.93 },
      { startRow: 16, endRow: 40, startCol: 16, endCol: 30, density: 0.97 },
      { startRow: 36, endRow: 48, startCol: 2, endCol: 12, density: 0.88 },
      { startRow: 41, endRow: 50, startCol: 13, endCol: 22, density: 0.85 },
      { startRow: 45, endRow: 50, startCol: 23, endCol: 28, density: 0.75 }
    ]
    
    // 50×35グリッド（不規則配置）
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // このセルがどのエリアに属するか確認
        const area = siteLayout.find(a => 
          row >= a.startRow && row <= a.endRow &&
          col >= a.startCol && col <= a.endCol
        )
        
        // エリア外または密度チェックで除外
        if (!area || Math.random() > area.density) {
          continue
        }
        
        const blockId = `block-${row}-${col}`
        const hasData = Math.random() > 0.05 // 95%のブロックにデータあり
        
        dummyBlocks.push({
          id: blockId,
          siteId: 'site-1',
          blockNumber: `${String.fromCharCode(65 + Math.floor(row / 10))}${row % 10}-${col + 1}`,
          coordinate: {
            latitude: baseLatitude + (row - rows/2) * 0.00005,
            longitude: baseLongitude + (col - cols/2) * 0.00006
          },
          panelsPerBlock: 100,
          rows: 10,
          cols: 10,
          thermalImageUrl: hasData ? '/dummy-thermal.jpg' : undefined,
          rgbImageUrl: hasData ? '/dummy-rgb.jpg' : undefined,
          capturedAt: hasData ? new Date().toISOString() : undefined
        })
      }
    }
    return dummyBlocks
  }

  const displayBlocks = blocks.length > 0 ? blocks : generateDummyBlocks()

  const handleBlockClick = (block: SolarBlock) => {
    setSelectedBlock(block)
    onBlockSelect?.(block)
  }

  // 全ブロックを含む境界ボックスを計算
  const calculateBounds = () => {
    if (displayBlocks.length === 0) return null
    
    const lats = displayBlocks.map(b => b.coordinate.latitude)
    const lngs = displayBlocks.map(b => b.coordinate.longitude)
    
    return {
      north: Math.max(...lats) + 0.0002,
      south: Math.min(...lats) - 0.0002,
      east: Math.max(...lngs) + 0.0002,
      west: Math.min(...lngs) - 0.0002
    }
  }

  const bounds = calculateBounds()

  return (
    <Card>
      <CardHeader className="p-3 md:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
            <MapPin className="h-4 md:h-5 w-4 md:w-5" />
            <span className="hidden sm:inline">サイトマップ（GPS座標）</span>
            <span className="sm:hidden">地図</span>
          </CardTitle>
          <div className="flex gap-1 md:gap-2">
            <Button
              variant={mapLayer === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapLayer('satellite')}
              className="px-2 md:px-3 py-1"
            >
              <Layers className="h-3 md:h-4 w-3 md:w-4 md:mr-2" />
              <span className="hidden md:inline">衛星</span>
            </Button>
            <Button
              variant={mapLayer === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapLayer('map')}
              className="px-2 md:px-3 py-1"
            >
              <Navigation className="h-3 md:h-4 w-3 md:w-4 md:mr-2" />
              <span className="hidden md:inline">地図</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* 地図表示 */}
          {mapReady && (
            <div className="h-[350px] md:h-[500px] w-full rounded-lg overflow-hidden">
              <MapContainer
                center={[centerCoordinate.latitude, centerCoordinate.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={
                  mapLayer === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
              />

              {/* ブロックを矩形で表示 */}
              {displayBlocks.map(block => {
                const blockAnomalies = anomalies.get(block.id) || []
                const hasData = block.thermalImageUrl !== undefined
                
                // ブロックのサイズ（約10m×6m）
                const blockBounds = [
                  [block.coordinate.latitude - 0.000045, block.coordinate.longitude - 0.000027],
                  [block.coordinate.latitude + 0.000045, block.coordinate.longitude + 0.000027]
                ] as [[number, number], [number, number]]

                return (
                  <Rectangle
                    key={block.id}
                    bounds={blockBounds}
                    pathOptions={{
                      fillColor: hasData ? getBlockColor(block.id) : '#9ca3af',
                      fillOpacity: 0.6,
                      weight: 1,
                      color: selectedBlock?.id === block.id ? '#3b82f6' : '#ffffff'
                    }}
                    eventHandlers={{
                      click: () => handleBlockClick(block)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm mb-2">
                          ブロック {block.blockNumber}
                        </h3>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>座標:</strong><br />
                            {block.coordinate.latitude.toFixed(6)}, {block.coordinate.longitude.toFixed(6)}
                          </p>
                          <p>
                            <strong>パネル数:</strong> {block.panelsPerBlock}枚
                          </p>
                          <p>
                            <strong>異常検出:</strong> {blockAnomalies.length}件
                          </p>
                          {block.capturedAt && (
                            <p>
                              <strong>撮影日:</strong><br />
                              {new Date(block.capturedAt).toLocaleDateString('ja-JP')}
                            </p>
                          )}
                        </div>
                        {blockAnomalies.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <span className="text-xs font-medium">
                                要対応
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Rectangle>
                )
              })}
            </MapContainer>
            </div>
          )}

          {/* 凡例 */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">軽微な異常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-sm">中程度の異常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">重大な異常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span className="text-sm">未撮影</span>
            </div>
          </div>

          {/* 選択中のブロック情報 */}
          {selectedBlock && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-2">
                      選択中: ブロック {selectedBlock.blockNumber}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">GPS座標</p>
                        <p className="font-mono">
                          {selectedBlock.coordinate.latitude.toFixed(6)},
                          {selectedBlock.coordinate.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">状態</p>
                        <p className="font-medium">
                          {selectedBlock.thermalImageUrl ? '撮影済み' : '未撮影'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    <Thermometer className="h-4 w-4 mr-2" />
                    詳細表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}