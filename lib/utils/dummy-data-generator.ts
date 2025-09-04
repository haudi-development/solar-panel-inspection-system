import { Anomaly } from '@/types'

const anomalyTypes: Array<Anomaly['anomaly_type']> = [
  'hotspot_single',
  'hotspot_multi',
  'bypass_diode',
  'soiling',
  'vegetation'
]

const severityLevels: Array<Anomaly['severity']> = ['critical', 'moderate', 'minor']
const iecClasses: Array<Anomaly['iec_class']> = ['IEC1', 'IEC2', 'IEC3', 'unclassified']

export function generateDummyAnomalies(
  inspectionId: string,
  panelRows: number = 4,
  panelCols: number = 12
): Anomaly[] {
  const anomalies: Anomaly[] = []
  const totalPanels = panelRows * panelCols
  const anomalyCount = Math.floor(Math.random() * 8) + 3 // 3-10 anomalies

  const usedPanels = new Set<string>()

  for (let i = 0; i < anomalyCount; i++) {
    let row: number, col: number, panelId: string

    do {
      row = Math.floor(Math.random() * panelRows) + 1
      col = Math.floor(Math.random() * panelCols) + 1
      panelId = `${String.fromCharCode(65 + row - 1)}${col.toString().padStart(2, '0')}`
    } while (usedPanels.has(panelId))

    usedPanels.add(panelId)

    const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)]
    const iecClass = iecClasses[Math.floor(Math.random() * iecClasses.length)]

    // Power loss calculation based on severity
    let powerLoss = 0
    if (severity === 'critical') {
      powerLoss = Math.floor(Math.random() * 150) + 100 // 100-250W
    } else if (severity === 'moderate') {
      powerLoss = Math.floor(Math.random() * 50) + 50 // 50-100W
    } else {
      powerLoss = Math.floor(Math.random() * 30) + 20 // 20-50W
    }

    // Temperature delta for hotspot anomalies
    let temperatureDelta: number | undefined = undefined
    if (anomalyType.includes('hotspot')) {
      if (severity === 'critical') {
        temperatureDelta = Math.floor(Math.random() * 20) + 20 // 20-40°C
      } else if (severity === 'moderate') {
        temperatureDelta = Math.floor(Math.random() * 10) + 10 // 10-20°C
      } else {
        temperatureDelta = Math.floor(Math.random() * 5) + 5 // 5-10°C
      }
    }

    anomalies.push({
      id: `anomaly-${i + 1}`,
      inspection_id: inspectionId,
      panel_id: panelId,
      anomaly_type: anomalyType,
      severity,
      iec_class: iecClass,
      power_loss_watts: powerLoss,
      temperature_delta: temperatureDelta,
      coordinates: { row, col },
      created_at: new Date().toISOString()
    })
  }

  return anomalies
}

export function calculateSummary(anomalies: Anomaly[]) {
  const summary = {
    total_anomalies: anomalies.length,
    critical_count: anomalies.filter(a => a.severity === 'critical').length,
    moderate_count: anomalies.filter(a => a.severity === 'moderate').length,
    minor_count: anomalies.filter(a => a.severity === 'minor').length,
    estimated_power_loss: anomalies.reduce((sum, a) => sum + (a.power_loss_watts || 0), 0),
    affected_panels: anomalies.length
  }

  return summary
}

export async function simulateAnalysisProgress(
  onProgress: (progress: number, message: string) => void
): Promise<void> {
  const steps = [
    { progress: 10, message: '画像をアップロード中...', delay: 500 },
    { progress: 25, message: 'オルソ画像を生成中...', delay: 1500 },
    { progress: 40, message: 'パネルを検出中...', delay: 1200 },
    { progress: 55, message: 'AI解析を実行中...', delay: 1800 },
    { progress: 70, message: 'ホットスポットを検出中...', delay: 1000 },
    { progress: 85, message: '異常を分類中...', delay: 800 },
    { progress: 95, message: 'レポートを生成中...', delay: 600 },
    { progress: 100, message: '解析完了！', delay: 300 }
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay))
    onProgress(step.progress, step.message)
  }
}

// Mega Solar specific dummy data generation
export function generateMegaSolarDummyData(
  siteId: string,
  blocksX: number = 50,
  blocksY: number = 35
): { anomalies: any[] } {
  const totalBlocks = blocksX * blocksY
  const anomalies: any[] = []
  
  // Calculate realistic anomaly count (about 0.1% of total panels)
  const baseAnomalyRate = 0.001 // 0.1% anomaly rate
  const totalPanelsPerBlock = 100 // Assume 100 panels per block
  const totalPanels = totalBlocks * totalPanelsPerBlock
  const targetAnomalies = Math.floor(totalPanels * baseAnomalyRate) + Math.floor(Math.random() * 50)

  // Anomaly type weights for realistic distribution
  const anomalyTypeWeights = [
    { type: 'hotspot_single', category: 'hotspot', weight: 0.35 },
    { type: 'hotspot_multi', category: 'hotspot', weight: 0.15 },
    { type: 'bypass_diode', category: 'bypass_diode', weight: 0.25 },
    { type: 'vegetation', category: 'vegetation', weight: 0.15 },
    { type: 'soiling', category: 'soiling', weight: 0.10 }
  ]

  // Generate weighted random anomaly types
  const getRandomAnomalyType = () => {
    const rand = Math.random()
    let cumWeight = 0
    
    for (const type of anomalyTypeWeights) {
      cumWeight += type.weight
      if (rand <= cumWeight) {
        return type
      }
    }
    return anomalyTypeWeights[0] // fallback
  }

  // Generate temperature based on anomaly type
  const getTemperatureData = (type: string) => {
    const baseTemp = 25 + Math.random() * 15 // 25-40°C base temperature
    
    switch (type) {
      case 'hotspot_single':
      case 'hotspot_multi':
        return {
          temperature: baseTemp + 15 + Math.random() * 25, // +15-40°C
          temperatureDelta: 15 + Math.random() * 25
        }
      case 'bypass_diode':
        return {
          temperature: baseTemp + 8 + Math.random() * 12, // +8-20°C
          temperatureDelta: 8 + Math.random() * 12
        }
      default:
        return {
          temperature: baseTemp + Math.random() * 5, // slight increase
          temperatureDelta: Math.random() * 5
        }
    }
  }

  const usedBlocks = new Set<string>()

  for (let i = 0; i < targetAnomalies; i++) {
    let blockX: number, blockY: number, blockKey: string
    
    // Find unused block position
    do {
      blockX = Math.floor(Math.random() * blocksX)
      blockY = Math.floor(Math.random() * blocksY)
      blockKey = `${blockX}-${blockY}`
    } while (usedBlocks.has(blockKey))
    
    usedBlocks.add(blockKey)

    const anomalyTypeInfo = getRandomAnomalyType()
    const tempData = getTemperatureData(anomalyTypeInfo.type)
    
    // Random panel position within the block
    const panelX = Math.floor(Math.random() * 10) // 0-9 (assuming 10x10 panels per block)
    const panelY = Math.floor(Math.random() * 10)
    
    const anomaly = {
      id: `thermal-${siteId}-${i + 1}`,
      site_id: siteId,
      block_x: blockX,
      block_y: blockY,
      panel_x: panelX,
      panel_y: panelY,
      type: anomalyTypeInfo.type,
      category: anomalyTypeInfo.category,
      severity: tempData.temperatureDelta > 20 ? 'high' : tempData.temperatureDelta > 10 ? 'medium' : 'low',
      temperature: Math.round(tempData.temperature * 10) / 10,
      temperature_delta: Math.round(tempData.temperatureDelta * 10) / 10,
      confidence: 0.8 + Math.random() * 0.2, // 80-100% confidence
      detection_date: new Date().toISOString(),
      description: getAnomalyDescription(anomalyTypeInfo.type, tempData.temperatureDelta),
      coordinates: {
        lat: 35.4983 + (blockY - blocksY/2) * 0.0001,
        lng: 140.1169 + (blockX - blocksX/2) * 0.0001
      }
    }
    
    anomalies.push(anomaly)
  }

  return { anomalies }
}

function getAnomalyDescription(type: string, tempDelta: number): string {
  const descriptions = {
    hotspot_single: `単一セルホットスポット検出 (+${tempDelta.toFixed(1)}°C)`,
    hotspot_multi: `複数セルホットスポット検出 (+${tempDelta.toFixed(1)}°C)`,
    bypass_diode: `バイパスダイオード起動による温度上昇 (+${tempDelta.toFixed(1)}°C)`,
    vegetation: `植生による部分的遮蔽を検出 (+${tempDelta.toFixed(1)}°C)`,
    soiling: `汚れによる発電効率低下を検出 (+${tempDelta.toFixed(1)}°C)`
  }
  
  return descriptions[type as keyof typeof descriptions] || `異常検出 (+${tempDelta.toFixed(1)}°C)`
}
