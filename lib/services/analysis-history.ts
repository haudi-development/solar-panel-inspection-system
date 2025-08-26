import { AnalysisResult, Project, Inspection } from '@/types'

export interface AnalysisHistoryItem {
  id: string
  project: Project
  inspection: Inspection
  result: AnalysisResult
  uploadedFiles: {
    name: string
    size: number
    count: number
  }
  timestamp: string
}

const STORAGE_KEY = 'solar-panel-analysis-history'
const MAX_HISTORY_ITEMS = 50

export class AnalysisHistoryService {
  static getHistory(): AnalysisHistoryItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const history = JSON.parse(stored)
      return Array.isArray(history) ? history : []
    } catch (error) {
      console.error('Failed to load history:', error)
      return []
    }
  }

  static addToHistory(item: Omit<AnalysisHistoryItem, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getHistory()
      const newItem: AnalysisHistoryItem = {
        ...item,
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }

      // Add new item at the beginning
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save to history:', error)
    }
  }

  static getHistoryItem(id: string): AnalysisHistoryItem | null {
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
      console.error('Failed to delete history item:', error)
    }
  }
}