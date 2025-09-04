import { ThermalAnomaly, MegaSolarSite } from '@/types'

export interface MegaSolarHistoryItem {
  id: string
  site: MegaSolarSite
  anomalies: ThermalAnomaly[]
  uploadInfo: {
    name: string
    totalFiles: number
    estimatedSize: string
    structure: { [key: string]: number }
  }
  timestamp: string
}

const STORAGE_KEY = 'mega-solar-inspection-history'
const MAX_HISTORY_ITEMS = 20

export class MegaSolarHistoryService {
  static getHistory(): MegaSolarHistoryItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const history = JSON.parse(stored)
      return Array.isArray(history) ? history : []
    } catch (error) {
      console.error('Failed to load mega solar history:', error)
      return []
    }
  }

  static addToHistory(item: Omit<MegaSolarHistoryItem, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getHistory()
      const newItem: MegaSolarHistoryItem = {
        ...item,
        id: `mega-solar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }

      // Add new item at the beginning
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save to mega solar history:', error)
    }
  }

  static getHistoryItem(id: string): MegaSolarHistoryItem | null {
    const history = this.getHistory()
    return history.find(item => item.id === id) || null
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  static deleteHistoryItem(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getHistory()
      const updatedHistory = history.filter(item => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to delete mega solar history item:', error)
    }
  }

  static getSummary(anomalies: ThermalAnomaly[]) {
    const summary = {
      total: anomalies.length,
      byCategory: {
        hotspot: anomalies.filter(a => a.category === 'hotspot').length,
        bypass_diode: anomalies.filter(a => a.category === 'bypass_diode').length,
        vegetation: anomalies.filter(a => a.category === 'vegetation').length,
        soiling: anomalies.filter(a => a.category === 'soiling').length,
      }
    }

    return summary
  }
}