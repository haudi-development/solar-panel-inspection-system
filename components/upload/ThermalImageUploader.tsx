'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Thermometer, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ImageFile {
  file: File
  type: 'rgb' | 'thermal'
  preview: string
  blockId?: string
}

interface ThermalImageUploaderProps {
  onUpload: (files: ImageFile[]) => void
  maxFiles?: number
  isUploading?: boolean
}

export function ThermalImageUploader({ 
  onUpload, 
  maxFiles = 20,
  isUploading = false 
}: ThermalImageUploaderProps) {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'grid' | 'thermal'>('grid')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      setError('一部のファイルが無効です。JPEG/PNG画像のみアップロード可能です。')
      return
    }

    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`最大${maxFiles}枚までアップロード可能です。`)
      return
    }

    const newFiles = acceptedFiles.map(file => {
      const imageFile: ImageFile = {
        file,
        type: file.name.toLowerCase().includes('thermal') || file.name.toLowerCase().includes('ir') 
          ? 'thermal' 
          : 'rgb',
        preview: URL.createObjectURL(file),
        blockId: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      return imageFile
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
    setError(null)
  }

  const handleUpload = () => {
    if (files.length === 0) {
      setError('画像を選択してください。')
      return
    }
    onUpload(files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // サーマル画像のダミー温度スケール
  const TemperatureScale = () => (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium">温度スケール:</div>
      <div className="flex items-center gap-1">
        <div className="w-20 h-4 bg-gradient-to-r from-blue-600 via-yellow-500 to-red-600 rounded" />
        <div className="text-xs">20°C - 80°C</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>画像アップロード（RGB/サーマル）</span>
            {files.length > 0 && <TemperatureScale />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
              isUploading && "opacity-50 cursor-not-allowed",
              files.length >= maxFiles && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">ドロップして画像をアップロード</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  クリックまたはドラッグ&ドロップで画像を選択
                </p>
                <p className="text-sm text-gray-500">
                  RGB画像・サーマル画像 (最大{maxFiles}枚)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  ※ファイル名に"thermal"または"ir"が含まれる場合、サーマル画像として認識されます
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <p className="font-medium">
                選択された画像 ({files.length}/{maxFiles})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(previewMode === 'grid' ? 'thermal' : 'grid')}
                >
                  {previewMode === 'grid' ? (
                    <>
                      <Thermometer className="h-4 w-4 mr-2" />
                      サーマルビュー
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      グリッドビュー
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {previewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((imageFile, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={imageFile.preview}
                        alt={`Preview ${index + 1}`}
                        className={cn(
                          "w-full h-full object-cover",
                          imageFile.type === 'thermal' && "opacity-90"
                        )}
                        style={imageFile.type === 'thermal' ? {
                          filter: 'hue-rotate(200deg) saturate(2) contrast(1.2)'
                        } : {}}
                      />
                      {imageFile.type === 'thermal' && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          <Thermometer className="h-3 w-3 inline mr-1" />
                          サーマル
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium truncate">{imageFile.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(imageFile.file.size)}</p>
                      <p className="text-xs text-gray-400">区画: {imageFile.blockId?.slice(0, 10)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-2">
                  サーマル画像プレビュー（温度差を可視化）
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.filter(f => f.type === 'thermal').map((imageFile, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative">
                        <img
                          src={imageFile.preview}
                          alt={`Thermal ${index + 1}`}
                          className="w-full rounded-lg"
                          style={{
                            filter: 'hue-rotate(200deg) saturate(3) contrast(1.5) brightness(1.1)'
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white p-2 rounded text-xs">
                          <div>Max: 75.3°C</div>
                          <div>Min: 23.1°C</div>
                          <div>Avg: 42.7°C</div>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{imageFile.file.name}</p>
                    </div>
                  ))}
                  {files.filter(f => f.type === 'thermal').length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      サーマル画像が選択されていません
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="flex-1"
          size="lg"
        >
          {isUploading ? '処理中...' : `解析を開始 (${files.length}枚)`}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setFiles([])}
          disabled={files.length === 0 || isUploading}
        >
          クリア
        </Button>
      </div>
    </div>
  )
}