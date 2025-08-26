'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  isUploading?: boolean
}

export function ImageUploader({ 
  onUpload, 
  maxFiles = 10,
  isUploading = false 
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

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

    setFiles(prev => [...prev, ...acceptedFiles])
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
    setFiles(prev => prev.filter((_, i) => i !== index))
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

  return (
    <div className="space-y-4">
      <Card>
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
                  JPEG, PNG形式 (最大{maxFiles}枚)
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
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="font-medium mb-2">
                選択された画像 ({files.length}/{maxFiles})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleUpload}
        disabled={files.length === 0 || isUploading}
        className="w-full"
        size="lg"
      >
        {isUploading ? '処理中...' : `解析を開始 (${files.length}枚)`}
      </Button>
    </div>
  )
}