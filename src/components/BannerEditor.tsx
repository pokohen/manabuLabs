'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface BannerEditorProps {
  categoryId: string
  onUploadComplete: (imageUrl: string) => void
  onCancel: () => void
  initialImageUrl?: string
}

type Step = 'upload' | 'crop' | 'text' | 'preview'
type TextPosition = 'top' | 'center' | 'bottom'

const BANNER_WIDTH = 800
const BANNER_HEIGHT = 300
const ASPECT_RATIO = BANNER_WIDTH / BANNER_HEIGHT

export default function BannerEditor({ categoryId, onUploadComplete, onCancel, initialImageUrl }: BannerEditorProps) {
  const [step, setStep] = useState<Step>(initialImageUrl ? 'crop' : 'upload')
  const [imageSrc, setImageSrc] = useState<string>(initialImageUrl ?? '')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [croppedDataUrl, setCroppedDataUrl] = useState<string>('')

  // Text overlay state
  const [overlayText, setOverlayText] = useState('')
  const [fontSize, setFontSize] = useState(32)
  const [textColor, setTextColor] = useState('#ffffff')
  const [textPosition, setTextPosition] = useState<TextPosition>('center')
  const [textStroke, setTextStroke] = useState(true)

  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setStep('crop')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Crop complete -> generate cropped image
  const handleCropDone = useCallback(() => {
    if (!completedCrop || !imgRef.current) return

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    canvas.width = BANNER_WIDTH
    canvas.height = BANNER_HEIGHT

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      BANNER_WIDTH,
      BANNER_HEIGHT,
    )

    setCroppedDataUrl(canvas.toDataURL('image/png'))
    setStep('text')
  }, [completedCrop])

  // Draw preview with text overlay
  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current
    if (!canvas || !croppedDataUrl) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = BANNER_WIDTH
      canvas.height = BANNER_HEIGHT
      ctx.drawImage(img, 0, 0, BANNER_WIDTH, BANNER_HEIGHT)

      if (overlayText.trim()) {
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillStyle = textColor

        let y: number
        if (textPosition === 'top') y = fontSize + 20
        else if (textPosition === 'bottom') y = BANNER_HEIGHT - 20
        else y = BANNER_HEIGHT / 2 + fontSize / 3

        if (textStroke) {
          ctx.strokeStyle = 'rgba(0,0,0,0.7)'
          ctx.lineWidth = 4
          ctx.lineJoin = 'round'
          ctx.strokeText(overlayText, BANNER_WIDTH / 2, y)
        }
        ctx.fillText(overlayText, BANNER_WIDTH / 2, y)
      }
    }
    img.src = croppedDataUrl
  }, [croppedDataUrl, overlayText, fontSize, textColor, textPosition, textStroke])

  useEffect(() => {
    if (step === 'text' || step === 'preview') {
      drawPreview()
    }
  }, [step, drawPreview])

  // Upload to Supabase Storage
  const handleUpload = async () => {
    const canvas = previewCanvasRef.current
    if (!canvas) return

    setUploading(true)
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.8)
      )
      if (!blob) throw new Error('이미지 변환 실패')

      const supabase = createBrowserSupabaseClient()
      const fileName = `${categoryId}/${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, blob, { contentType: 'image/webp', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName)

      onUploadComplete(urlData.publicUrl)
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  // Step 1: Upload
  if (step === 'upload') {
    return (
      <div className="space-y-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-800'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="text-zinc-500 dark:text-zinc-400">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">이미지를 드래그하거나 클릭하여 선택</p>
            <p className="text-xs mt-1">권장 크기: 800x300px 이상</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
        >
          취소
        </button>
      </div>
    )
  }

  // Step 2: Crop
  if (step === 'crop') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          배너 영역을 선택하세요 (800:300 비율)
        </p>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT_RATIO}
            minWidth={100}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="크롭 대상"
              className="max-h-[400px] w-full object-contain"
              onLoad={(e) => {
                const { width, height } = e.currentTarget
                const cropWidth = Math.min(width, height * ASPECT_RATIO)
                const cropHeight = cropWidth / ASPECT_RATIO
                setCrop({
                  unit: 'px',
                  x: (width - cropWidth) / 2,
                  y: (height - cropHeight) / 2,
                  width: cropWidth,
                  height: cropHeight,
                })
              }}
            />
          </ReactCrop>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCropDone}
            disabled={!completedCrop}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            크롭 완료
          </button>
          <button
            onClick={() => { setStep('upload'); setImageSrc('') }}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            다시 선택
          </button>
          <button
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer ml-auto"
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Text overlay
  if (step === 'text') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          텍스트를 추가하세요 (선택 사항)
        </p>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <canvas
            ref={previewCanvasRef}
            className="w-full"
            style={{ aspectRatio: `${BANNER_WIDTH}/${BANNER_HEIGHT}` }}
          />
        </div>

        <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <input
            type="text"
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            placeholder="배너 텍스트 (선택)"
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />

          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">크기</label>
              <input
                type="range"
                min={16}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500 ml-1">{fontSize}px</span>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">색상</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">위치</label>
              <select
                value={textPosition}
                onChange={(e) => setTextPosition(e.target.value as TextPosition)}
                className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
              >
                <option value="top">상단</option>
                <option value="center">중앙</option>
                <option value="bottom">하단</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={textStroke}
                  onChange={(e) => setTextStroke(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-zinc-500">외곽선</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStep('preview')}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
          >
            미리보기
          </button>
          <button
            onClick={() => setStep('crop')}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            다시 크롭
          </button>
          <button
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer ml-auto"
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  // Step 4: Preview + Upload
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        최종 미리보기 (WebP로 업로드됩니다)
      </p>
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <canvas
          ref={previewCanvasRef}
          className="w-full"
          style={{ aspectRatio: `${BANNER_WIDTH}/${BANNER_HEIGHT}` }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {uploading ? '업로드 중...' : '업로드'}
        </button>
        <button
          onClick={() => setStep('text')}
          disabled={uploading}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
        >
          텍스트 수정
        </button>
        <button
          onClick={onCancel}
          disabled={uploading}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer ml-auto disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </div>
  )
}
