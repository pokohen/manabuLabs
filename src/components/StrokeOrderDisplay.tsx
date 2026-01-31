'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

interface StrokeOrderDisplayProps {
  character: string
  mode: 'animation' | 'steps'
}

interface StrokeData {
  id: string
  d: string
}

// 개별 획 애니메이션 컴포넌트
function AnimatedStroke({
  d,
  isAnimating,
  duration = 400,
  onComplete,
}: {
  d: string
  isAnimating: boolean
  duration?: number
  onComplete?: () => void
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength()
      setPathLength(length)
      setOffset(isAnimating ? length : 0)
    }
  }, [d, isAnimating])

  useEffect(() => {
    if (!isAnimating || pathLength === 0) return

    const startTime = performance.now()
    let animationFrame: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutCubic for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const newOffset = pathLength * (1 - easeProgress)

      setOffset(newOffset)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isAnimating, pathLength, duration, onComplete])

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke="#000000"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      strokeDashoffset={offset}
    />
  )
}

export default function StrokeOrderDisplay({
  character,
  mode,
}: StrokeOrderDisplayProps) {
  const [strokes, setStrokes] = useState<StrokeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animatingStrokeIndex, setAnimatingStrokeIndex] = useState(-1)
  const [hasStarted, setHasStarted] = useState(false)

  // 문자의 유니코드를 5자리 16진수로 변환
  const getUnicodeHex = (char: string) => {
    return char.charCodeAt(0).toString(16).padStart(5, '0')
  }

  // KanjiVG에서 SVG 데이터 가져오기
  useEffect(() => {
    const fetchStrokeData = async () => {
      setLoading(true)
      setError(null)
      setCurrentStroke(0)
      setAnimatingStrokeIndex(-1)
      setHasStarted(false)

      try {
        const unicode = getUnicodeHex(character)
        const response = await fetch(
          `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`
        )

        if (!response.ok) {
          throw new Error('획순 데이터를 찾을 수 없습니다')
        }

        const svgText = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')

        // 모든 path 요소 추출
        const paths = doc.querySelectorAll('path')
        const strokeData: StrokeData[] = []

        paths.forEach((path) => {
          const d = path.getAttribute('d')
          const id = path.getAttribute('id')
          if (d && id) {
            strokeData.push({ id, d })
          }
        })

        setStrokes(strokeData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchStrokeData()
  }, [character])

  // 다음 획으로 넘어가기
  const handleStrokeComplete = useCallback(() => {
    setCurrentStroke((prev) => prev + 1)
    setAnimatingStrokeIndex((prev) => {
      const next = prev + 1
      if (next >= strokes.length) {
        setIsAnimating(false)
        return -1
      }
      return next
    })
  }, [strokes.length])

  // 애니메이션 재생
  const playAnimation = useCallback(() => {
    if (isAnimating || strokes.length === 0) return

    setHasStarted(true)
    setIsAnimating(true)
    setCurrentStroke(0)
    setAnimatingStrokeIndex(0)
  }, [isAnimating, strokes.length])

  // 애니메이션 리셋
  const resetAnimation = () => {
    setHasStarted(false)
    setIsAnimating(false)
    setCurrentStroke(0)
    setAnimatingStrokeIndex(-1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        {error}
      </div>
    )
  }

  // 각 획의 중간점 계산 (번호 표시용)
  const getStrokeMidpoint = (d: string): { x: number; y: number } => {
    // path의 첫 번째 M 명령어에서 시작점 추출
    const match = d.match(/M\s*([\d.]+)[,\s]+([\d.]+)/)
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
    }
    return { x: 50, y: 50 }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* SVG 영역 */}
      <div className="relative w-full aspect-square bg-white rounded-lg border-2 border-zinc-200 dark:border-zinc-700">
        <svg viewBox="0 0 109 109" className="w-full h-full">
          {/* 격자 배경 */}
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

          {mode === 'animation' ? (
            // 애니메이션 모드
            <>
              {!hasStarted ? (
                // 초기 상태: 모든 획을 검은색으로 보여줌
                strokes.map((stroke) => (
                  <path
                    key={stroke.id}
                    d={stroke.d}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))
              ) : (
                <>
                  {/* 회색 밑그림 (모든 획) */}
                  {strokes.map((stroke) => (
                    <path
                      key={stroke.id + '-guide'}
                      d={stroke.d}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* 이미 완료된 획들 (검은색) */}
                  {strokes.slice(0, currentStroke).map((stroke, index) => {
                    // 현재 애니메이션 중인 획인지 확인
                    if (index === animatingStrokeIndex) {
                      return (
                        <AnimatedStroke
                          key={stroke.id}
                          d={stroke.d}
                          isAnimating={true}
                          duration={400}
                          onComplete={handleStrokeComplete}
                        />
                      )
                    }
                    // 이미 완료된 획
                    return (
                      <path
                        key={stroke.id}
                        d={stroke.d}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )
                  })}
                  {/* 현재 애니메이션 중인 획 */}
                  {animatingStrokeIndex >= 0 &&
                    animatingStrokeIndex === currentStroke &&
                    strokes[animatingStrokeIndex] && (
                      <AnimatedStroke
                        key={strokes[animatingStrokeIndex].id + '-animating'}
                        d={strokes[animatingStrokeIndex].d}
                        isAnimating={true}
                        duration={400}
                        onComplete={handleStrokeComplete}
                      />
                    )}
                </>
              )}
            </>
          ) : (
            // 단계별 보기 모드
            <>
              {strokes.map((stroke, index) => {
                const midpoint = getStrokeMidpoint(stroke.d)

                return (
                  <g key={stroke.id}>
                    <path
                      d={stroke.d}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* 획 번호 */}
                    <circle
                      cx={midpoint.x}
                      cy={midpoint.y}
                      r="8"
                      fill="#3b82f6"
                    />
                    <text
                      x={midpoint.x}
                      y={midpoint.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </text>
                  </g>
                )
              })}
            </>
          )}
        </svg>
      </div>

      {/* 컨트롤 버튼 */}
      {mode === 'animation' && (
        <div className="flex gap-2">
          <Button
            onClick={playAnimation}
            disabled={isAnimating}
            variant="primary"
            size="sm"
            className="flex-1 gap-2"
          >
            <Icon name="play" size="sm" />
            {isAnimating ? '재생 중...' : '재생'}
          </Button>
          <Button
            onClick={resetAnimation}
            variant="neutral"
            size="sm"
          >
            초기화
          </Button>
        </div>
      )}

      {/* 획 수 표시 */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        총 {strokes.length}획
      </p>
      
    </div>
  )
}
