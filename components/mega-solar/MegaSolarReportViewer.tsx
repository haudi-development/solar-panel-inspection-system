'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, Thermometer, AlertCircle, Grid, Zap, 
  FileText, Download, Share, Eye, Filter, Map, Layers
} from 'lucide-react'
import { ThermalAnomaly, MegaSolarSite } from '@/types'
import SolarSiteMapView from './SolarSiteMapView'
import BlockDetailModal from './BlockDetailModal'

interface MegaSolarReportViewerProps {
  site: MegaSolarSite
  anomalies: ThermalAnomaly[]
}

function MegaSolarReportViewer({ site, anomalies }: MegaSolarReportViewerProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'map'>('overview')
  const [selectedBlock, setSelectedBlock] = useState<{ x: number; y: number; anomalies: ThermalAnomaly[] } | null>(null)

  // Calculate summary statistics
  const summary = {
    total: anomalies.length,
    byCategory: {
      hotspot: anomalies.filter(a => a.category === 'hotspot').length,
      bypass_diode: anomalies.filter(a => a.category === 'bypass_diode').length,
      vegetation: anomalies.filter(a => a.category === 'vegetation').length,
      soiling: anomalies.filter(a => a.category === 'soiling').length,
    }
  }

  const totalBlocks = site.blocks_x * site.blocks_y
  const affectedBlocks = new Set(anomalies.map(a => `${a.block_x}-${a.block_y}`)).size
  const normalBlocks = totalBlocks - affectedBlocks

  // Generate grid display blocks for overview
  const displayBlocks = []
  for (let y = 0; y < site.blocks_y; y++) {
    for (let x = 0; x < site.blocks_x; x++) {
      const blockAnomalies = anomalies.filter(a => a.block_x === x && a.block_y === y)
      const hasAnomaly = blockAnomalies.length > 0
      const primaryAnomaly = blockAnomalies[0]
      
      displayBlocks.push({
        x,
        y,
        hasAnomaly,
        anomalyType: primaryAnomaly?.category || null,
        anomalyCount: blockAnomalies.length,
        anomalies: blockAnomalies
      })
    }
  }

  const getBlockColor = (block: any) => {
    if (!block.hasAnomaly) return 'bg-green-200 hover:bg-green-300'
    
    switch (block.anomalyType) {
      case 'hotspot': return 'bg-red-400 hover:bg-red-500'
      case 'bypass_diode': return 'bg-orange-400 hover:bg-orange-500'
      case 'vegetation': return 'bg-green-600 hover:bg-green-700'
      case 'soiling': return 'bg-yellow-400 hover:bg-yellow-500'
      default: return 'bg-gray-400 hover:bg-gray-500'
    }
  }

  const handleBlockClick = (blockX: number, blockY: number) => {
    const blockAnomalies = anomalies.filter(a => a.block_x === blockX && a.block_y === blockY)
    setSelectedBlock({ x: blockX, y: blockY, anomalies: blockAnomalies })
  }

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">概要ダッシュボード</span>
            <span className="sm:hidden">概要</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
            <Map className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">地図ビュー</span>
            <span className="sm:hidden">地図</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{normalBlocks.toLocaleString()}</div>
                <div className="text-xs text-green-700">正常ブロック</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((normalBlocks / totalBlocks) * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{summary.byCategory.hotspot}</div>
                <div className="text-xs text-red-700">ホットスポット</div>
                <div className="text-xs text-gray-500 mt-1">重要度: 高</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">{summary.byCategory.bypass_diode}</div>
                <div className="text-xs text-orange-700">バイパスダイオード</div>
                <div className="text-xs text-gray-500 mt-1">重要度: 中</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{summary.byCategory.vegetation}</div>
                <div className="text-xs text-green-800">植生影響</div>
                <div className="text-xs text-gray-500 mt-1">重要度: 中</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{summary.byCategory.soiling}</div>
                <div className="text-xs text-yellow-700">汚れ影響</div>
                <div className="text-xs text-gray-500 mt-1">重要度: 低</div>
              </CardContent>
            </Card>
          </div>

          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                サイト詳細情報
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">施設名:</span>
                    <span className="font-medium">{site.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">所在地:</span>
                    <span className="font-medium">{site.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">発電容量:</span>
                    <span className="font-medium">{site.capacity_mw} MW</span>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">総パネル数:</span>
                    <span className="font-medium">{site.total_panels.toLocaleString()}枚</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ブロック構成:</span>
                    <span className="font-medium">{site.blocks_x} × {site.blocks_y}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">解析完了:</span>
                    <span className="font-medium">{new Date().toLocaleString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simple Grid Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">サイト概要グリッド</h3>
                <p className="text-sm text-gray-600">クリックで詳細表示</p>
              </div>
              
              <div 
                className="mx-auto mb-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(site.blocks_x, 25)}, minmax(0, 1fr))`,
                  gap: '1px',
                  maxWidth: '100%',
                  aspectRatio: `${Math.min(site.blocks_x, 25)} / ${Math.min(site.blocks_y, 20)}`,
                }}
              >
                {displayBlocks.slice(0, 500).map((block, index) => (
                  <div
                    key={`block-${block.x}-${block.y}`}
                    className={`
                      aspect-square rounded-sm cursor-pointer transition-all duration-200
                      ${getBlockColor(block)}
                      flex items-center justify-center text-xs font-bold text-white
                    `}
                    title={`ブロック (${block.x}, ${block.y})${
                      block.hasAnomaly 
                        ? ` - ${block.anomalyType} (${block.anomalyCount}件)`
                        : ' - 正常'
                    }`}
                    onClick={() => handleBlockClick(block.x, block.y)}
                  >
                    {block.hasAnomaly && (
                      <span className="text-xs">
                        {block.anomalyCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded-sm"></div>
                  <span className="text-xs">正常</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded-sm"></div>
                  <span className="text-xs">ホットスポット</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
                  <span className="text-xs">バイパスダイオード</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
                  <span className="text-xs">植生影響</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                  <span className="text-xs">汚れ影響</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <SolarSiteMapView 
                site={site}
                anomalies={anomalies}
                onBlockClick={handleBlockClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF出力
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              詳細レポート
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              レポート共有
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <BlockDetailModal
          block={selectedBlock}
          site={site}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  )
}

export default MegaSolarReportViewer