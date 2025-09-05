'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Layers, Satellite, Map as MapIcon, Maximize2, Minimize2,
  Filter, RotateCcw, MapPin, Thermometer
} from 'lucide-react'
import { ThermalAnomaly, MegaSolarSite } from '@/types'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Rectangle = dynamic(() => import('react-leaflet').then(mod => mod.Rectangle), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false })

interface SolarSiteMapViewProps {
  site: MegaSolarSite
  anomalies: ThermalAnomaly[]
  onBlockClick: (blockX: number, blockY: number) => void
  isModalOpen?: boolean
}

// Custom marker component for anomaly blocks
function AnomalyMarker({ anomaly, onBlockClick }: { anomaly: ThermalAnomaly; onBlockClick: (x: number, y: number) => void }) {
  const getMarkerColor = (category: string, severity: string) => {
    const baseColors = {
      hotspot: severity === 'high' ? '#dc2626' : '#ef4444',
      bypass_diode: severity === 'high' ? '#ea580c' : '#f97316',
      vegetation: severity === 'high' ? '#15803d' : '#16a34a',
      soiling: severity === 'high' ? '#ca8a04' : '#eab308'
    }
    return baseColors[category as keyof typeof baseColors] || '#6b7280'
  }

  const markerHtml = `
    <div style="
      background-color: ${getMarkerColor(anomaly.category, anomaly.severity)};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `

  const customIcon = typeof window !== 'undefined' ? new (window as any).L.DivIcon({
    html: markerHtml,
    className: 'custom-anomaly-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  }) : null

  if (!customIcon) return null

  return (
    <Marker
      position={[anomaly.coordinates.lat, anomaly.coordinates.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => onBlockClick(anomaly.block_x, anomaly.block_y)
      }}
    >
      <Popup>
        <div className="p-2">
          <h4 className="font-bold text-sm">ブロック ({anomaly.block_x}, {anomaly.block_y})</h4>
          <p className="text-xs mt-1">
            <strong>異常タイプ:</strong> {anomaly.type}<br/>
            <strong>カテゴリ:</strong> {anomaly.category}<br/>
            <strong>重要度:</strong> {anomaly.severity}<br/>
            <strong>温度:</strong> {anomaly.temperature.toFixed(1)}°C (+{anomaly.temperature_delta.toFixed(1)}°C)<br/>
            <strong>信頼度:</strong> {(anomaly.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs mt-2 text-gray-600">{anomaly.description}</p>
        </div>
      </Popup>
    </Marker>
  )
}

function SolarSiteMapView({ site, anomalies, onBlockClick, isModalOpen = false }: SolarSiteMapViewProps) {
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite')
  const [showAnomalies, setShowAnomalies] = useState(true)
  const [showSiteGrid, setShowSiteGrid] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hotspot' | 'bypass_diode' | 'vegetation' | 'soiling'>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const isMobile = useIsMobile()

  // Calculate site boundaries (rough estimation)
  const siteBounds = useMemo(() => {
    const centerLat = site.coordinate.lat
    const centerLng = site.coordinate.lng
    
    // Estimate site size based on capacity (rough calculation)
    const siteAreaKm2 = site.capacity_mw * 0.004 // ~4 hectares per MW
    const siteSize = Math.sqrt(siteAreaKm2) / 111 // Convert to degrees (rough)
    
    return {
      north: centerLat + siteSize / 2,
      south: centerLat - siteSize / 2,
      east: centerLng + siteSize / 2,
      west: centerLng - siteSize / 2
    }
  }, [site])

  // Filter anomalies
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => filter === 'all' || anomaly.category === filter)
  }, [anomalies, filter])

  // Generate block rectangles based on actual block data (like overview dashboard)
  const blockRectangles = useMemo(() => {
    if (!showSiteGrid) return []
    
    const rectangles = []
    // Use the same coordinate calculation as in dummy data generator
    const blockSize = 0.0001 // Size per block in degrees
    
    // Show all blocks, but color them based on anomaly status like overview dashboard
    for (let y = 0; y < site.blocks_y; y++) {
      for (let x = 0; x < site.blocks_x; x++) {
        // Calculate block center coordinates using same logic as anomaly generation
        const blockCenterLat = site.coordinate.lat + (y - site.blocks_y/2) * blockSize
        const blockCenterLng = site.coordinate.lng + (x - site.blocks_x/2) * blockSize
        
        // Create rectangle around the block center
        const lat1 = blockCenterLat - blockSize/2
        const lat2 = blockCenterLat + blockSize/2  
        const lng1 = blockCenterLng - blockSize/2
        const lng2 = blockCenterLng + blockSize/2
        
        // Check for anomalies in this block
        const blockAnomalies = anomalies.filter(a => a.block_x === x && a.block_y === y)
        const hasAnomaly = blockAnomalies.length > 0
        const primaryAnomaly = blockAnomalies[0]
        
        // Determine block color based on anomaly (same as overview dashboard)
        let fillColor = '#22c55e' // green-500 (normal)
        let fillOpacity = 0.3
        
        if (hasAnomaly) {
          fillOpacity = 0.7
          switch (primaryAnomaly?.category) {
            case 'hotspot':
              fillColor = '#dc2626' // red-600
              break
            case 'bypass_diode':
              fillColor = '#ea580c' // orange-600
              break
            case 'vegetation':
              fillColor = '#15803d' // green-700
              break
            case 'soiling':
              fillColor = '#ca8a04' // yellow-600
              break
            default:
              fillColor = '#6b7280' // gray-500
          }
        }
        
        rectangles.push({
          id: `block-${x}-${y}`,
          bounds: [[lat1, lng1], [lat2, lng2]] as [[number, number], [number, number]],
          fillColor,
          fillOpacity,
          hasAnomaly,
          anomalyCount: blockAnomalies.length,
          anomalyType: primaryAnomaly?.category || null,
          blockX: x,
          blockY: y
        })
      }
    }
    
    return rectangles
  }, [siteBounds, site.blocks_x, site.blocks_y, showSiteGrid, anomalies])

  useEffect(() => {
    // Import Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
      
      // Set map ready after a short delay
      setTimeout(() => setIsMapReady(true), 500)
      
      return () => {
        document.head.removeChild(link)
      }
    }
  }, [])

  if (!isMapReady) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''} ${isModalOpen ? 'pointer-events-none' : ''}`}>
      {/* Controls */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium text-sm sm:text-base">地図ビュー</span>
          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">({site.name})</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          {/* Filter */}
          <div className="flex items-center gap-2 order-2 sm:order-1 sm:mr-2">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-2 py-1 border rounded text-xs sm:text-sm"
              aria-label="異常フィルター"
            >
              <option value="all">すべて ({anomalies.length})</option>
              <option value="hotspot">ホット ({anomalies.filter(a => a.category === 'hotspot').length})</option>
              <option value="bypass_diode">ダイオード ({anomalies.filter(a => a.category === 'bypass_diode').length})</option>
              <option value="vegetation">植生 ({anomalies.filter(a => a.category === 'vegetation').length})</option>
              <option value="soiling">汚れ ({anomalies.filter(a => a.category === 'soiling').length})</option>
            </select>
          </div>

          {/* Map Controls */}
          <div className="flex gap-1 sm:gap-2 order-1 sm:order-2">
            <Button
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => setMapType('satellite')}
            >
              <Satellite className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">衛星</span>
            </Button>
            
            <Button
              variant={mapType === 'street' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => setMapType('street')}
            >
              <MapIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">地図</span>
            </Button>
            
            <Button
              variant={showAnomalies ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => setShowAnomalies(!showAnomalies)}
            >
              <Thermometer className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">異常</span>
            </Button>
            
            <Button
              variant={showSiteGrid ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => setShowSiteGrid(!showSiteGrid)}
            >
              <Layers className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">グリッド</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm">
        <div>表示異常: <span className="font-bold text-red-600">{filteredAnomalies.length}</span></div>
        <div className="hidden sm:block">サイト面積: <span className="font-bold">約{(site.capacity_mw * 4).toFixed(1)} ha</span></div>
        <div className="hidden md:block">座標: <span className="font-bold">{site.coordinate.lat.toFixed(4)}, {site.coordinate.lng.toFixed(4)}</span></div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            style={{ 
              height: isFullscreen ? 'calc(100vh - 200px)' : isMobile ? '300px' : '500px',
              pointerEvents: isModalOpen ? 'none' : 'auto',
              position: 'relative',
              zIndex: isModalOpen ? 1 : 'auto'
            }}
          >
            <MapContainer
              center={[site.coordinate.lat, site.coordinate.lng]}
              zoom={isMobile ? 14 : 15}
              style={{ height: '100%', width: '100%' }}
              touchZoom={true}
              doubleClickZoom={true}
              scrollWheelZoom={true}
              boxZoom={false}
              keyboard={false}
            >
              {/* Base Tile Layers */}
              {mapType === 'satellite' ? (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
              ) : (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              )}

              {/* Block Rectangles (like overview dashboard) */}
              {showSiteGrid && blockRectangles.map((rect) => (
                <Rectangle
                  key={rect.id}
                  bounds={rect.bounds}
                  pathOptions={{
                    fillColor: rect.fillColor,
                    fillOpacity: rect.fillOpacity,
                    color: rect.hasAnomaly ? '#ffffff' : '#e5e7eb',
                    weight: rect.hasAnomaly ? 2 : 0.5
                  }}
                  eventHandlers={{
                    click: () => onBlockClick(rect.blockX, rect.blockY)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold text-sm">ブロック ({rect.blockX}, {rect.blockY})</h4>
                      <p className="text-xs mt-1">
                        {rect.hasAnomaly ? (
                          <>
                            <strong>状態:</strong> 異常あり ({rect.anomalyCount}件)<br/>
                            <strong>タイプ:</strong> {rect.anomalyType}<br/>
                            <strong>クリック:</strong> 詳細表示
                          </>
                        ) : (
                          <>
                            <strong>状態:</strong> 正常<br/>
                            <strong>推定パネル:</strong> 100枚
                          </>
                        )}
                      </p>
                    </div>
                  </Popup>
                </Rectangle>
              ))}

              {/* Site Center Marker */}
              <Marker position={[site.coordinate.lat, site.coordinate.lng]}>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold">{site.name}</h4>
                    <p className="text-sm">
                      発電容量: {site.capacity_mw} MW<br/>
                      総パネル数: {site.total_panels.toLocaleString()}枚<br/>
                      ブロック数: {site.blocks_x} × {site.blocks_y}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Anomaly Markers */}
              {showAnomalies && filteredAnomalies.map((anomaly) => (
                <AnomalyMarker
                  key={anomaly.id}
                  anomaly={anomaly}
                  onBlockClick={onBlockClick}
                />
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-2 border-t">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border border-white"></div>
          <span className="text-xs sm:text-sm">ホット</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full border border-white"></div>
          <span className="text-xs sm:text-sm hidden sm:inline">バイパスダイオード</span>
          <span className="text-xs sm:hidden">ダイオード</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full border border-white"></div>
          <span className="text-xs sm:text-sm">植生</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full border border-white"></div>
          <span className="text-xs sm:text-sm">汚れ</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-sm border border-white"></div>
          <span className="text-xs sm:text-sm hidden sm:inline">サイト境界</span>
          <span className="text-xs sm:hidden">境界</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center">
        <span className="hidden sm:inline">💡 マーカーをクリックで詳細表示、ホイールでズーム、ドラッグで移動</span>
        <span className="sm:hidden">💡 タップで詳細、ピンチでズーム</span>
      </div>
    </div>
  )
}

export default SolarSiteMapView