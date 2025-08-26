import { 
  SolarBlock, 
  ThermalAnomaly, 
  BlockAnalysisResult, 
  SiteAnalysisReport,
  SolarSite
} from '@/types/mega-solar'

// メガソーラー用のダミー解析データ生成（実際のサイト形状に基づく）
export function generateMegaSolarDummyData(): {
  site: SolarSite
  blocks: SolarBlock[]
  anomalies: Map<string, ThermalAnomaly[]>
} {
  // サイト情報
  const site: SolarSite = {
    id: 'site-mega-1',
    name: 'オリックス・メガソーラー発電所',
    location: '千葉県市原市',
    totalCapacityMW: 50,
    totalBlocks: 1000,
    totalPanels: 100000, // 10万パネル
    centerCoordinate: {
      latitude: 35.5494,
      longitude: 140.1195
    },
    boundingBox: {
      northEast: { latitude: 35.5519, longitude: 140.1220 },
      southWest: { latitude: 35.5469, longitude: 140.1170 }
    },
    created_at: new Date().toISOString()
  }

  // 実際のメガソーラーサイトの不規則な形状を定義
  // エリアごとにブロックの配置を定義（実際のサイトマップに基づく）
  const siteLayout = [
    // エリアA（北西部）: 大規模エリア
    { startRow: 0, endRow: 15, startCol: 3, endCol: 18, density: 0.95 },
    // エリアB（北東部）: 中規模エリア
    { startRow: 0, endRow: 12, startCol: 19, endCol: 28, density: 0.90 },
    // エリアC（中央西部）: 大規模エリア
    { startRow: 16, endRow: 35, startCol: 0, endCol: 15, density: 0.93 },
    // エリアD（中央部）: メインエリア
    { startRow: 16, endRow: 40, startCol: 16, endCol: 30, density: 0.97 },
    // エリアE（南西部）: 中規模エリア
    { startRow: 36, endRow: 48, startCol: 2, endCol: 12, density: 0.88 },
    // エリアF（南東部）: 小規模エリア
    { startRow: 41, endRow: 50, startCol: 13, endCol: 22, density: 0.85 },
    // エリアG（南端）: 三角形エリア
    { startRow: 45, endRow: 50, startCol: 23, endCol: 28, density: 0.75 }
  ]

  const blocks: SolarBlock[] = []
  const rows = 50
  const cols = 35 // 横幅を広げる
  
  // ブロック生成（不規則な配置）
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
      const hasData = Math.random() > 0.05 // 95%のブロックにデータあり（実際の運用に近い）
      
      blocks.push({
        id: blockId,
        siteId: site.id,
        blockNumber: `${String.fromCharCode(65 + Math.floor(row / 10))}${row % 10}-${col + 1}`,
        coordinate: {
          latitude: site.centerCoordinate.latitude + (row - rows/2) * 0.00005,
          longitude: site.centerCoordinate.longitude + (col - cols/2) * 0.00006
        },
        panelsPerBlock: 100, // 1ブロックあたり100パネル（10×10）
        rows: 10,
        cols: 10,
        rgbImageUrl: hasData ? `/dummy-rgb-${blockId}.jpg` : undefined,
        thermalImageUrl: hasData ? `/dummy-thermal-${blockId}.jpg` : undefined,
        capturedAt: hasData ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      })
    }
  }

  // 異常データ生成（より現実的な発生率）
  const anomalies = new Map<string, ThermalAnomaly[]>()
  
  // 10万パネルで異常は全体の0.1%程度（100パネル程度）が現実的
  // 1000ブロック中、異常があるのは20-30ブロック程度
  const anomalyBlockCount = Math.floor(20 + Math.random() * 10)
  const selectedBlocks = blocks
    .filter(b => b.thermalImageUrl)
    .sort(() => Math.random() - 0.5)
    .slice(0, anomalyBlockCount)
  
  selectedBlocks.forEach(block => {
    const blockAnomalies: ThermalAnomaly[] = []
    
    // 1ブロックに1-2個の異常（まれに3個）
    const anomalyCount = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3
    
    for (let i = 0; i < anomalyCount; i++) {
      const anomalyInfo = getRandomAnomalyType()
      
      blockAnomalies.push({
        id: `anomaly-${block.id}-${i}`,
        blockId: block.id,
        panelIds: generateAffectedPanels(Math.min(3, block.panelsPerBlock)), // 影響パネルは1-3枚程度
        type: anomalyInfo.type,
        category: anomalyInfo.category,
        severity: anomalyInfo.severity,
        description: anomalyInfo.description,
        temperatureC: generateTemperature(anomalyInfo.category, anomalyInfo.severity),
        deltaTemperatureC: generateDeltaTemperature(anomalyInfo.category, anomalyInfo.severity),
        area: {
          x: Math.floor(Math.random() * 400),
          y: Math.floor(Math.random() * 300),
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 80) + 40
        },
        confidence: Math.random() * 0.2 + 0.8 // 0.8-1.0
      })
    }
    
    if (blockAnomalies.length > 0) {
      anomalies.set(block.id, blockAnomalies)
    }
  })
  
  return { site, blocks, anomalies }
}

// 影響を受けるパネルIDを生成
function generateAffectedPanels(totalPanels: number): string[] {
  const affectedCount = Math.min(Math.floor(Math.random() * 3) + 1, totalPanels)
  const panelIds: string[] = []
  const usedIndexes = new Set<number>()
  
  while (panelIds.length < affectedCount) {
    const index = Math.floor(Math.random() * totalPanels)
    if (!usedIndexes.has(index)) {
      usedIndexes.add(index)
      panelIds.push(`panel-${index + 1}`)
    }
  }
  
  return panelIds
}

// ランダムな異常タイプを取得
function getRandomAnomalyType(): { 
  type: ThermalAnomaly['type']
  category: ThermalAnomaly['category']
  severity: ThermalAnomaly['severity']
  description: string 
} {
  const types = [
    { 
      type: 'hotspot_single' as const, 
      category: 'hotspot' as const,
      severity: Math.random() > 0.6 ? 'critical' as const : 'moderate' as const,
      description: '1セルがホットスポットになったモジュール'
    },
    { 
      type: 'hotspot_multi' as const, 
      category: 'hotspot' as const,
      severity: 'critical' as const, // 複数セルは常に深刻
      description: '複数セルがホットスポットになったモジュール'
    },
    { 
      type: 'bypass_diode' as const, 
      category: 'bypass_diode' as const,
      severity: Math.random() > 0.7 ? 'critical' as const : 'moderate' as const,
      description: 'バイパスダイオード起動モジュール'
    },
    { 
      type: 'vegetation' as const, 
      category: 'vegetation' as const,
      severity: 'moderate' as const, // 植生は通常軽度
      description: '植生の成長によるホットスポットの発生'
    },
    { 
      type: 'soiling' as const, 
      category: 'soiling' as const,
      severity: 'moderate' as const, // 汚れは通常軽度
      description: '汚れによるホットスポットの発生'
    }
  ]
  
  // より現実的な分布
  const weights = [0.3, 0.2, 0.15, 0.2, 0.15] // ホットスポット系が多め
  const random = Math.random()
  let sum = 0
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i]
    if (random < sum) {
      return types[i]
    }
  }
  
  return types[0]
}

// カテゴリと深刻度に基づく温度を生成
function generateTemperature(category: ThermalAnomaly['category'], severity: ThermalAnomaly['severity']): number {
  const severityMultiplier = severity === 'critical' ? 1.2 : 0.8
  
  switch (category) {
    case 'hotspot':
      return (Math.random() * 20 + 65) * severityMultiplier // 52-102°C
    case 'bypass_diode':
      return (Math.random() * 15 + 55) * severityMultiplier // 44-84°C
    case 'vegetation':
      return (Math.random() * 15 + 45) * severityMultiplier // 36-72°C
    case 'soiling':
      return (Math.random() * 10 + 40) * severityMultiplier // 32-60°C
    default:
      return 35
  }
}

// カテゴリと深刻度に基づく温度差を生成
function generateDeltaTemperature(category: ThermalAnomaly['category'], severity: ThermalAnomaly['severity']): number {
  const severityMultiplier = severity === 'critical' ? 1.3 : 0.7
  
  switch (category) {
    case 'hotspot':
      return (Math.random() * 15 + 20) * severityMultiplier // 14-45.5°C
    case 'bypass_diode':
      return (Math.random() * 10 + 15) * severityMultiplier // 10.5-32.5°C
    case 'vegetation':
      return (Math.random() * 10 + 10) * severityMultiplier // 7-26°C
    case 'soiling':
      return (Math.random() * 5 + 5) * severityMultiplier // 3.5-13°C
    default:
      return 0
  }
}

// ブロック解析結果を生成
export function analyzeBlock(
  block: SolarBlock, 
  anomalies: ThermalAnomaly[]
): BlockAnalysisResult {
  const temperatures = anomalies.map(a => a.temperatureC)
  const normalTemp = 35 // 通常温度
  
  return {
    blockId: block.id,
    analyzedAt: new Date().toISOString(),
    thermalImageUrl: block.thermalImageUrl || '',
    rgbImageUrl: block.rgbImageUrl || '',
    anomalies,
    temperature: {
      min: temperatures.length > 0 ? Math.min(...temperatures, normalTemp) : normalTemp,
      max: temperatures.length > 0 ? Math.max(...temperatures) : normalTemp,
      avg: temperatures.length > 0 
        ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length 
        : normalTemp
    },
    affectedPanels: anomalies.reduce((sum, a) => sum + a.panelIds.length, 0),
    estimatedPowerLossKW: calculatePowerLoss(anomalies)
  }
}

// 電力損失を計算
function calculatePowerLoss(anomalies: ThermalAnomaly[]): number {
  return anomalies.reduce((total, anomaly) => {
    const baseLoss = anomaly.panelIds.length * 0.3 // パネルあたり0.3kW
    const categoryMultiplier = 
      anomaly.category === 'hotspot' ? 3 :
      anomaly.category === 'bypass_diode' ? 2.5 :
      anomaly.category === 'vegetation' ? 1.5 : 
      anomaly.category === 'soiling' ? 1 : 1
    
    return total + (baseLoss * categoryMultiplier)
  }, 0)
}

// サイト全体の解析レポートを生成
export function generateSiteReport(
  site: SolarSite,
  blocks: SolarBlock[],
  anomaliesMap: Map<string, ThermalAnomaly[]>
): SiteAnalysisReport {
  const analyzedBlocks = blocks.filter(b => b.thermalImageUrl)
  const blockResults: BlockAnalysisResult[] = []
  
  let totalAnomalies = 0
  let criticalCount = 0
  let moderateCount = 0
  let hotspotCount = 0
  let bypassDiodeCount = 0
  let vegetationCount = 0
  let soilingCount = 0
  let affectedPanels = 0
  let totalLoss = 0
  
  analyzedBlocks.forEach(block => {
    const anomalies = anomaliesMap.get(block.id) || []
    if (anomalies.length > 0) {
      const result = analyzeBlock(block, anomalies)
      blockResults.push(result)
      
      totalAnomalies += anomalies.length
      criticalCount += anomalies.filter(a => a.severity === 'critical').length
      moderateCount += anomalies.filter(a => a.severity === 'moderate').length
      hotspotCount += anomalies.filter(a => a.category === 'hotspot').length
      bypassDiodeCount += anomalies.filter(a => a.category === 'bypass_diode').length
      vegetationCount += anomalies.filter(a => a.category === 'vegetation').length
      soilingCount += anomalies.filter(a => a.category === 'soiling').length
      affectedPanels += result.affectedPanels
      totalLoss += result.estimatedPowerLossKW
    }
  })
  
  const recommendedActions: string[] = []
  if (hotspotCount > 10) {
    recommendedActions.push('緊急: 多数のホットスポットが検出されました。パネルの交換が必要な可能性があります。')
  }
  if (bypassDiodeCount > 5) {
    recommendedActions.push('警告: バイパスダイオード起動が複数検出されています。電気系統の点検を推奨します。')
  }
  if (vegetationCount > 0) {
    recommendedActions.push('注意: 植生による影響が検出されました。除草作業を推奨します。')
  }
  if (soilingCount > 0) {
    recommendedActions.push('情報: パネルの汚れが検出されました。清掃作業を計画してください。')
  }
  if (totalLoss > 100) {
    recommendedActions.push(`注意: 推定電力損失が${totalLoss.toFixed(1)}kWに達しています。`)
  }
  if (analyzedBlocks.length < blocks.length * 0.8) {
    recommendedActions.push('情報: 未撮影のブロックがあります。完全な診断のため追加撮影を推奨します。')
  }
  
  return {
    siteId: site.id,
    inspectionDate: new Date().toISOString(),
    analyzedBlocks: analyzedBlocks.length,
    totalBlocks: blocks.length,
    blockResults,
    summary: {
      totalAnomalies,
      criticalCount,
      moderateCount,
      hotspotCount,
      bypassDiodeCount,
      vegetationCount,
      soilingCount,
      affectedBlocks: blockResults.length,
      affectedPanels,
      estimatedTotalLossKW: totalLoss,
      recommendedActions
    }
  }
}

// 解析進捗のシミュレーション
export async function simulateMegaSolarAnalysis(
  onProgress: (progress: number, message: string) => void
): Promise<void> {
  const steps = [
    { progress: 5, message: '画像データを読み込み中...', delay: 500 },
    { progress: 15, message: 'GPS座標を解析中...', delay: 800 },
    { progress: 25, message: 'サーマル画像を処理中...', delay: 1200 },
    { progress: 35, message: 'ブロック単位で区画を識別中...', delay: 1000 },
    { progress: 45, message: 'AIモデルを初期化中...', delay: 800 },
    { progress: 55, message: 'ホットスポットを検出中...', delay: 1500 },
    { progress: 65, message: '温度異常を分析中...', delay: 1200 },
    { progress: 75, message: 'パネル単位で異常を特定中...', delay: 1000 },
    { progress: 85, message: '電力損失を計算中...', delay: 800 },
    { progress: 95, message: 'レポートを生成中...', delay: 600 },
    { progress: 100, message: '解析完了！', delay: 300 }
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay))
    onProgress(step.progress, step.message)
  }
}