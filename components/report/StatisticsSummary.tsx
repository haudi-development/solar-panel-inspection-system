'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info, Zap, Thermometer, Shield } from 'lucide-react'
import { AnalysisResult } from '@/types'

interface StatisticsSummaryProps {
  result: AnalysisResult
}

export function StatisticsSummary({ result }: StatisticsSummaryProps) {
  const { summary } = result

  const stats = [
    {
      title: '検出された異常',
      value: summary.total_anomalies,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: '重大',
      value: summary.critical_count,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: '中程度',
      value: summary.moderate_count,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: '軽微',
      value: summary.minor_count,
      icon: <Info className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: '推定電力損失',
      value: `${(summary.estimated_power_loss / 1000).toFixed(1)} kW`,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: '影響パネル数',
      value: `${summary.affected_panels}/48`,
      icon: <Shield className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}