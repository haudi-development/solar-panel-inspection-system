export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          location: string | null
          capacity_mw: number | null
          panel_rows: number
          panel_cols: number
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          capacity_mw?: number | null
          panel_rows?: number
          panel_cols?: number
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          capacity_mw?: number | null
          panel_rows?: number
          panel_cols?: number
          created_at?: string
          user_id?: string | null
        }
      }
      inspections: {
        Row: {
          id: string
          project_id: string
          inspection_date: string
          status: 'uploading' | 'analyzing' | 'completed'
          total_panels: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          inspection_date?: string
          status: 'uploading' | 'analyzing' | 'completed'
          total_panels?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          inspection_date?: string
          status?: 'uploading' | 'analyzing' | 'completed'
          total_panels?: number
          created_at?: string
        }
      }
      images: {
        Row: {
          id: string
          inspection_id: string
          file_url: string
          thermal_url: string | null
          image_type: 'rgb' | 'thermal'
          grid_position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          file_url: string
          thermal_url?: string | null
          image_type: 'rgb' | 'thermal'
          grid_position?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          file_url?: string
          thermal_url?: string | null
          image_type?: 'rgb' | 'thermal'
          grid_position?: number | null
          created_at?: string
        }
      }
      anomalies: {
        Row: {
          id: string
          inspection_id: string
          panel_id: string
          anomaly_type: 'hotspot_single' | 'hotspot_multi' | 'bypass_diode' | 'soiling' | 'vegetation'
          severity: 'critical' | 'moderate' | 'minor'
          iec_class: 'IEC1' | 'IEC2' | 'IEC3' | 'unclassified'
          power_loss_watts: number | null
          temperature_delta: number | null
          coordinates: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          panel_id: string
          anomaly_type: 'hotspot_single' | 'hotspot_multi' | 'bypass_diode' | 'soiling' | 'vegetation'
          severity: 'critical' | 'moderate' | 'minor'
          iec_class: 'IEC1' | 'IEC2' | 'IEC3' | 'unclassified'
          power_loss_watts?: number | null
          temperature_delta?: number | null
          coordinates?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          panel_id?: string
          anomaly_type?: 'hotspot_single' | 'hotspot_multi' | 'bypass_diode' | 'soiling' | 'vegetation'
          severity?: 'critical' | 'moderate' | 'minor'
          iec_class?: 'IEC1' | 'IEC2' | 'IEC3' | 'unclassified'
          power_loss_watts?: number | null
          temperature_delta?: number | null
          coordinates?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}