'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import StrokeOrderDisplay from './StrokeOrderDisplay'
import { Toggle } from './Toggle'
import { IconButton } from './IconButton'
import { Icon } from './Icon'
import { ToggleGroup } from './ToggleButton'
import { Button } from './Button'

type TabType = 'write' | 'animation' | 'steps'

const tabOptions: { value: TabType; label: string }[] = [
  { value: 'write', label: '쓰기 연습' },
  { value: 'animation', label: '애니메이션' },
  { value: 'steps', label: '단계별' },
]

interface StrokeData {
  id: string
  d: string
}

interface WritingModalProps {
  isOpen: boolean
  onClose: () => void
  character: string
  reading: string
  onPlaySound?: () => void
}

// 문자의 유니코드를 5자리 16진수로 변환
const getUnicodeHex = (char: string) => {
  return char.charCodeAt(0).toString(16).padStart(5, '0')
}

export default function WritingModal({
  isOpen,
  onClose,
  character,
  reading,
  onPlaySound,
}: WritingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('write')
  const prevIsOpenRef = useRef(false)
  const [guideStrokes, setGuideStrokes] = useState<StrokeData[]>([])

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // KanjiVG 가이드 데이터 가져오기
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const unicode = getUnicodeHex(character)
        const response = await fetch(
          `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`
        )

        if (!response.ok) {
          setGuideStrokes([])
          return
        }

        const svgText = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')

        const paths = doc.querySelectorAll('path')
        const strokeData: StrokeData[] = []

        paths.forEach((path) => {
          const d = path.getAttribute('d')
          const id = path.getAttribute('id')
          if (d && id) {
            strokeData.push({ id, d })
          }
        })

        setGuideStrokes(strokeData)
      } catch {
        setGuideStrokes([])
      }
    }

    if (character) {
      fetchGuideData()
    }
  }, [character])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // 모달이 열릴 때 캔버스 초기화
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      clearCanvas()
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, clearCanvas])

  // character가 변경되면 탭 리셋
  useEffect(() => {
    setActiveTab('write')
  }, [character])

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    setIsDrawing(true)
  }

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    draw(e)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {character}
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">
              ({reading})
            </span>
          </h2>
          <IconButton icon="close" label="닫기" size="md" onClick={onClose} />
        </div>

        {/* 탭 네비게이션 */}
        <ToggleGroup
          value={activeTab}
          onChange={setActiveTab}
          options={tabOptions}
          variant="tab"
          size="sm"
          fullWidth
        />

        {/* 탭 컨텐츠 */}
        {activeTab === 'write' && (
          <>
            {/* 캔버스 영역 */}
            <div className="relative w-full aspect-square bg-white rounded-lg border-2 border-zinc-200 dark:border-zinc-700 overflow-hidden">
              {/* 격자 배경 (항상 표시) */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg viewBox="0 0 109 109" className="w-full h-full">
                  <line
                    x1="54.5"
                    y1="0"
                    x2="54.5"
                    y2="109"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="54.5"
                    x2="109"
                    y2="54.5"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="4,4"
                  />
                </svg>
              </div>
              {/* KanjiVG 가이드 */}
              {showGuide && guideStrokes.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  <svg viewBox="0 0 109 109" className="w-full h-full">
                    {guideStrokes.map((stroke) => (
                      <path
                        key={stroke.id}
                        d={stroke.d}
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="relative z-10 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={handleTouchMove}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* 가이드 토글 */}
            <Toggle
              checked={showGuide}
              onChange={setShowGuide}
              label="가이드 문자 보기"
            />

            {/* 버튼들 */}
            <div className="flex gap-2">
              <Button
                onClick={clearCanvas}
                variant="neutral"
                className="flex-1"
              >
                지우기
              </Button>
              {onPlaySound && (
                <Button
                  onClick={onPlaySound}
                  variant="primary"
                  className="flex-1 gap-2"
                >
                  <Icon name="speaker" size="md" />
                  발음 듣기
                </Button>
              )}
            </div>
          </>
        )}

        {activeTab === 'animation' && (
          <StrokeOrderDisplay character={character} mode="animation" />
        )}

        {activeTab === 'steps' && (
          <StrokeOrderDisplay character={character} mode="steps" />
        )}

        {/* KanjiVG 출처 */}
      <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
        획순 데이터:{' '}
        <a
          href="https://kanjivg.tagaini.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-400"
        >
          KanjiVG
        </a>
        {' '}(CC BY-SA 3.0)
      </p>
      </div>
    </div>
  )
}
