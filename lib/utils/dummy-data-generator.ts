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