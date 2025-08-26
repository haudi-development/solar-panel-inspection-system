'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle } from 'lucide-react'

interface AnalysisProgressProps {
  progress: number
  message: string
  isComplete: boolean
}

export function AnalysisProgress({ progress, message, isComplete }: AnalysisProgressProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isComplete ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              解析完了
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              画像を解析中...
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          
          {!isComplete && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                AIが画像を解析しています。このプロセスには数分かかる場合があります。
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}