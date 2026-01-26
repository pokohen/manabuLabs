'use client'

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

export interface HandwritingCanvasRef {
  clear: () => void
  getImage: () => string | null
}

interface HandwritingCanvasProps {
  width?: number
  height?: number
  onDrawStart?: () => void
}

const HandwritingCanvas = forwardRef<HandwritingCanvasRef, HandwritingCanvasProps>(
  function HandwritingCanvas({ width = 300, height = 150, onDrawStart }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawingRef = useRef(false)

    // 캔버스 초기화
    useEffect(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx && canvas) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }, [])

    // 외부에서 사용할 메서드 노출
    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (ctx && canvas) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      },
      getImage: () => {
        const canvas = canvasRef.current
        return canvas ? canvas.toDataURL('image/png') : null
      }
    }))

    const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      isDrawingRef.current = true
      onDrawStart?.()
      const { x, y } = getCanvasPoint(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      const { x, y } = getCanvasPoint(e)
      ctx.lineTo(x, y)
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    const stopDrawing = () => {
      isDrawingRef.current = false
    }

    return (
      <div className="relative bg-white rounded-xl border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    )
  }
)

export default HandwritingCanvas
