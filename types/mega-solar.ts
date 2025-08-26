// メガソーラー用の拡張型定義

export interface GPSCoordinate {
  latitude: number
  longitude: number
}

export interface SolarSite {
  id: string
  name: string
  location: string
  totalCapacityMW: number
  totalBlocks: number
  totalPanels: number
  centerCoordinate: GPSCoordinate
  boundingBox: {
    northEast: GPSCoordinate
    southWest: GPSCoordinate
  }
  created_at: string
}

export interface SolarBlock {
  id: string
  siteId: string
  blockNumber: string // e.g., "A-1", "B-2"
  coordinate: GPSCoordinate
  panelsPerBlock: number // 通常10枚程度
  rows: number // ブロック内の行数
  cols: number // ブロック内の列数
  rgbImageUrl?: string
  thermalImageUrl?: string
  capturedAt?: string
}

export interface SolarPanel {
  id: string
  blockId: string
  panelNumber: number // ブロック内のパネル番号 (1-10)
  position: {
    row: number // ブロック内の行位置
    col: number // ブロック内の列位置
  }
  status: 'normal' | 'warning' | 'critical' | 'offline'
}

export interface ThermalAnomaly {
  id: string
  blockId: string
  panelIds: string[] // 影響を受けるパネルID（複数可能）
  type: 'hotspot_single' | 'hotspot_multi' | 'bypass_diode' | 'vegetation' | 'soiling'
  category: 'hotspot' | 'bypass_diode' | 'vegetation' | 'soiling' // 表示用カテゴリ
  severity: 'critical' | 'moderate' // 異常度合い（深刻・軽度）
  temperatureC: number
  deltaTemperatureC: number // 周囲との温度差
  area: {
    // ブロック内のピクセル座標
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number // AI検出の信頼度 (0-1)
  description?: string // 日本語の説明
}

export interface BlockAnalysisResult {
  blockId: string
  analyzedAt: string
  thermalImageUrl: string
  rgbImageUrl: string
  anomalies: ThermalAnomaly[]
  temperature: {
    min: number
    max: number
    avg: number
  }
  affectedPanels: number
  estimatedPowerLossKW: number
}

export interface SiteAnalysisReport {
  siteId: string
  inspectionDate: string
  analyzedBlocks: number
  totalBlocks: number
  blockResults: BlockAnalysisResult[]
  summary: {
    totalAnomalies: number
    criticalCount: number // 深刻な異常の数
    moderateCount: number // 軽度の異常の数
    hotspotCount: number
    bypassDiodeCount: number
    vegetationCount: number
    soilingCount: number
    affectedBlocks: number
    affectedPanels: number
    estimatedTotalLossKW: number
    recommendedActions: string[]
  }
}

export interface ThermalImageMetadata {
  captureDevice: string
  captureDate: string
  temperature: {
    min: number
    max: number
    avg: number
    unit: 'C' | 'F'
  }
  emissivity: number
  distance: number // meters
  humidity: number // percentage
  ambientTemperature: number
}