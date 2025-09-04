'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ZoomIn, ZoomOut, RotateCcw, Filter, Search,
  Maximize2, Minimize2, Grid, MapPin
} from 'lucide-react'
import { ThermalAnomaly, MegaSolarSite } from '@/types'

interface DetailedGridViewProps {
  site: MegaSolarSite
  anomalies: ThermalAnomaly[]
  onBlockClick: (blockX: number, blockY: number) => void
}

interface BlockData {
  x: number
  y: number
  hasAnomaly: boolean
  anomalyType: string | null
  anomalyCount: number
  temperature?: number
  maxSeverity: 'high' | 'medium' | 'low' | null
}

function DetailedGridView({ site, anomalies, onBlockClick }: DetailedGridViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.6)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollX: 0, scrollY: 0 })
  const [filter, setFilter] = useState<'all' | 'anomaly' | 'hotspot' | 'bypass_diode' | 'vegetation' | 'soiling'>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Constants
  const BLOCK_SIZE = 16
  const GAP = 1
  const MIN_ZOOM = 0.2
  const MAX_ZOOM = 3.0

  // Generate block data
  const blockData = useMemo(() => {
    const blocks: BlockData[] = []
    
    for (let y = 0; y < site.blocks_y; y++) {
      for (let x = 0; x < site.blocks_x; x++) {
        const blockAnomalies = anomalies.filter(a => a.block_x === x && a.block_y === y)
        const hasAnomaly = blockAnomalies.length > 0
        const primaryAnomaly = blockAnomalies[0]
        
        // Determine max severity
        let maxSeverity: 'high' | 'medium' | 'low' | null = null
        if (hasAnomaly) {
          const severities = blockAnomalies.map(a => a.severity)
          if (severities.includes('high')) maxSeverity = 'high'
          else if (severities.includes('medium')) maxSeverity = 'medium'
          else maxSeverity = 'low'
        }

        blocks.push({
          x,
          y,
          hasAnomaly,
          anomalyType: primaryAnomaly?.category || null,
          anomalyCount: blockAnomalies.length,
          temperature: primaryAnomaly?.temperature,
          maxSeverity
        })
      }
    }
    
    return blocks
  }, [site.blocks_x, site.blocks_y, anomalies])

  // Filter blocks
  const filteredBlocks = useMemo(() => {
    return blockData.filter(block => {
      if (filter === 'all') return true
      if (filter === 'anomaly') return block.hasAnomaly
      return block.anomalyType === filter
    })
  }, [blockData, filter])

  // Calculate grid dimensions
  const gridWidth = site.blocks_x * (BLOCK_SIZE + GAP) - GAP
  const gridHeight = site.blocks_y * (BLOCK_SIZE + GAP) - GAP
  const scaledWidth = gridWidth * zoom
  const scaledHeight = gridHeight * zoom

  // Get block color based on anomaly
  const getBlockColor = (block: BlockData): string => {
    if (!block.hasAnomaly) return '#22c55e' // green-500
    
    switch (block.anomalyType) {
      case 'hotspot': 
        return block.maxSeverity === 'high' ? '#dc2626' : '#ef4444' // red-600/red-500
      case 'bypass_diode': 
        return block.maxSeverity === 'high' ? '#ea580c' : '#f97316' // orange-600/orange-500
      case 'vegetation': 
        return block.maxSeverity === 'high' ? '#15803d' : '#16a34a' // green-700/green-600
      case 'soiling': 
        return block.maxSeverity === 'high' ? '#ca8a04' : '#eab308' // yellow-600/yellow-500
      default: 
        return '#6b7280' // gray-500
    }
  }

  // Handle zoom
  const handleZoom = (delta: number, centerX?: number, centerY?: number) => {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta))
    setZoom(newZoom)
  }

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = e.clientX - rect.left
        const centerY = e.clientY - rect.top
        handleZoom(e.deltaY > 0 ? -0.1 : 0.1, centerX, centerY)
      }
    }
  }

  // Handle mouse/touch drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollX: containerRef.current?.scrollLeft || 0,
      scrollY: containerRef.current?.scrollTop || 0
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      scrollX: containerRef.current?.scrollLeft || 0,
      scrollY: containerRef.current?.scrollTop || 0
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    containerRef.current.scrollLeft = dragStart.scrollX - deltaX
    containerRef.current.scrollTop = dragStart.scrollY - deltaY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    containerRef.current.scrollLeft = dragStart.scrollX - deltaX
    containerRef.current.scrollTop = dragStart.scrollY - deltaY
    e.preventDefault() // Prevent default touch scrolling
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Reset view
  const resetView = () => {
    setZoom(0.6)
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', handleMouseUpGlobal)
      return () => window.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [])

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-between sm:items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm sm:text-base">詳細グリッドビュー</span>
          <span className="text-xs sm:text-sm text-gray-500">
            ({site.blocks_x} × {site.blocks_y} ブロック)
          </span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {/* Filter Controls */}
          <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4 flex-shrink-0">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-1 py-1 border rounded text-xs sm:text-sm min-w-0"
            >
              <option value="all">すべて ({blockData.length})</option>
              <option value="anomaly">異常のみ ({blockData.filter(b => b.hasAnomaly).length})</option>
              <option value="hotspot">ホットスポット ({blockData.filter(b => b.anomalyType === 'hotspot').length})</option>
              <option value="bypass_diode">バイパスダイオード ({blockData.filter(b => b.anomalyType === 'bypass_diode').length})</option>
              <option value="vegetation">植生影響 ({blockData.filter(b => b.anomalyType === 'vegetation').length})</option>
              <option value="soiling">汚れ影響 ({blockData.filter(b => b.anomalyType === 'soiling').length})</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <Button variant="outline" size="sm" onClick={() => handleZoom(-0.2)} className="flex-shrink-0 px-2">
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-mono w-8 sm:w-12 text-center flex-shrink-0">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={() => handleZoom(0.2)} className="flex-shrink-0 px-2">
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={resetView} className="flex-shrink-0 px-2">
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="flex-shrink-0 px-2">
            {isFullscreen ? <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm">
        <div>表示中: <span className="font-bold">{filteredBlocks.length}</span> / {blockData.length}</div>
        <div>ズーム: <span className="font-bold">{Math.round(zoom * 100)}%</span></div>
        <div>異常: <span className="font-bold text-red-600">{blockData.filter(b => b.hasAnomaly).length}</span></div>
      </div>

      {/* Grid Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative overflow-auto cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y"
            style={{ 
              height: isFullscreen ? 'calc(100vh - 200px)' : '400px',
              width: '100%'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Grid SVG */}
            <svg
              width={Math.max(scaledWidth, 800)}
              height={Math.max(scaledHeight, 600)}
              className="block"
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width={BLOCK_SIZE * zoom} height={BLOCK_SIZE * zoom} patternUnits="userSpaceOnUse">
                  <path d={`M ${BLOCK_SIZE * zoom} 0 L 0 0 0 ${BLOCK_SIZE * zoom}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Render visible blocks */}
              {filteredBlocks.map((block) => {
                const x = block.x * (BLOCK_SIZE + GAP) * zoom
                const y = block.y * (BLOCK_SIZE + GAP) * zoom
                const size = BLOCK_SIZE * zoom
                
                return (
                  <g key={`block-${block.x}-${block.y}`}>
                    <rect
                      x={x}
                      y={y}
                      width={size}
                      height={size}
                      fill={getBlockColor(block)}
                      stroke={block.hasAnomaly ? '#ffffff' : '#e5e7eb'}
                      strokeWidth={block.hasAnomaly ? 1 : 0.5}
                      className="cursor-pointer hover:stroke-2 transition-all"
                      onClick={() => onBlockClick(block.x, block.y)}
                    >
                      <title>
                        {`ブロック (${block.x}, ${block.y})\n${
                          block.hasAnomaly 
                            ? `異常: ${block.anomalyType} (${block.anomalyCount}件)\n重要度: ${block.maxSeverity}\n温度: ${block.temperature?.toFixed(1)}°C`
                            : '状態: 正常'
                        }`}
                      </title>
                    </rect>
                    
                    {/* Show anomaly count */}
                    {block.hasAnomaly && zoom > 0.4 && (
                      <text
                        x={x + size / 2}
                        y={y + size / 2 + 2}
                        textAnchor="middle"
                        fill="white"
                        fontSize={Math.max(8, 10 * zoom)}
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        {block.anomalyCount}
                      </text>
                    )}
                  </g>
                )
              })}
              
              {/* Row/Column Labels */}
              {zoom > 0.3 && (
                <g>
                  {/* Row labels */}
                  {Array.from({ length: Math.min(site.blocks_y, 50) }, (_, i) => (
                    <text
                      key={`row-${i}`}
                      x={-8}
                      y={i * (BLOCK_SIZE + GAP) * zoom + (BLOCK_SIZE * zoom / 2)}
                      textAnchor="end"
                      fontSize={Math.max(8, 10 * zoom)}
                      fill="#6b7280"
                      className="select-none pointer-events-none"
                    >
                      {i}
                    </text>
                  ))}
                  
                  {/* Column labels */}
                  {Array.from({ length: Math.min(site.blocks_x, 50) }, (_, i) => (
                    <text
                      key={`col-${i}`}
                      x={i * (BLOCK_SIZE + GAP) * zoom + (BLOCK_SIZE * zoom / 2)}
                      y={-4}
                      textAnchor="middle"
                      fontSize={Math.max(8, 10 * zoom)}
                      fill="#6b7280"
                      className="select-none pointer-events-none"
                    >
                      {i}
                    </text>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-2 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span className="text-sm">正常</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span className="text-sm">ホットスポット</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
          <span className="text-sm">バイパスダイオード</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
          <span className="text-sm">植生影響</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
          <span className="text-sm">汚れ影響</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        💡 Ctrl+ホイールでズーム、ドラッグで移動、ブロッククリックで詳細表示
      </div>
    </div>
  )
}

export default DetailedGridView