export interface Project {
  id: string
  name: string
  location?: string
  capacity_mw?: number
  panel_rows: number
  panel_cols: number
  created_at: string
  user_id?: string
}

export interface Inspection {
  id: string
  project_id: string
  inspection_date: string
  status: 'uploading' | 'analyzing' | 'completed'
  total_panels: number
  created_at: string
}

export interface InspectionImage {
  id: string
  inspection_id: string
  file_url: string
  thermal_url?: string
  image_type: 'rgb' | 'thermal'
  grid_position?: number
  created_at: string
}

export interface Anomaly {
  id: string
  inspection_id: string
  panel_id: string
  anomaly_type: 'hotspot_single' | 'hotspot_multi' | 'bypass_diode' | 'soiling' | 'vegetation'
  severity: 'critical' | 'moderate' | 'minor'
  iec_class: 'IEC1' | 'IEC2' | 'IEC3' | 'unclassified'
  power_loss_watts?: number
  temperature_delta?: number
  coordinates?: {
    row: number
    col: number
  }
  created_at: string
}

export interface AnalysisResult {
  inspection_id: string
  anomalies: Anomaly[]
  summary: {
    total_anomalies: number
    critical_count: number
    moderate_count: number
    minor_count: number
    estimated_power_loss: number
    affected_panels: number
  }
}