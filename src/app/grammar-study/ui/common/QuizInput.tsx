'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/Button'
import HandwritingCanvas, { HandwritingCanvasRef } from './HandwritingCanvas'

export type QuizMode = 'typing' | 'handwriting'

interface QuizInputProps {
  correctAnswer: string
  correctReading: string
  displayAnswer: string // 정답 표시용 (한자 포함)
  displayReading: string // 읽기 표시용
  onResult: (isCorrect: boolean, userAnswer: string) => void
  onComplete: () => void
  completeButtonText?: string
  quizMode: QuizMode
  onQuizModeChange: (mode: QuizMode) => void
}

export default function QuizInput({
  correctAnswer,
  correctReading,
  displayAnswer,
  displayReading,
  onResult,
  onComplete,
  completeButtonText = '다음',
  quizMode,
  onQuizModeChange,
}: QuizInputProps) {
  const [typingInput, setTypingInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [savedCanvasImage, setSavedCanvasImage] = useState<string | null>(null)

  const canvasRef = useRef<HandwritingCanvasRef>(null)

  // 타자 모드: 정답 확인
  const handleTypingCheck = () => {
    const normalizedInput = typingInput.trim()
    const isMatch = normalizedInput === correctAnswer || normalizedInput === correctReading
    setIsCorrect(isMatch)
    setShowAnswer(true)
    onResult(isMatch, normalizedInput)
  }

  // 손글씨 모드: 정답 보기
  const handleShowAnswer = () => {
    const image = canvasRef.current?.getImage()
    if (image) {
      setSavedCanvasImage(image)
    }
    setShowAnswer(true)
  }

  // 손글씨 모드: 자가 채점
  const handleSelfGrade = (correct: boolean) => {
    setIsCorrect(correct)
    onResult(correct, '(손글씨)')
  }

  const handleClearCanvas = () => {
    canvasRef.current?.clear()
  }

  if (!showAnswer) {
    return (
      <div className="space-y-4">
        {/* 모드 선택 */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onQuizModeChange('typing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              quizMode === 'typing'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            타자 입력
          </button>
          <button
            onClick={() => onQuizModeChange('handwriting')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              quizMode === 'handwriting'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            손글씨
          </button>
        </div>

        {/* 타자 모드 */}
        {quizMode === 'typing' && (
          <div className="space-y-4">
            <input
              type="text"
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typingInput && handleTypingCheck()}
              placeholder="정답을 입력하세요"
              className="w-full p-4 text-2xl text-center bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-900 dark:text-white"
              autoFocus
            />
            <Button
              onClick={handleTypingCheck}
              disabled={!typingInput}
              variant="success"
              size="lg"
              fullWidth
            >
              확인하기
            </Button>
          </div>
        )}

        {/* 손글씨 모드 */}
        {quizMode === 'handwriting' && (
          <div className="space-y-4">
            <HandwritingCanvas ref={canvasRef} />
            <div className="flex gap-2">
              <Button
                onClick={handleClearCanvas}
                variant="secondary"
                className="flex-1"
              >
                지우기
              </Button>
              <Button
                onClick={handleShowAnswer}
                variant="primary"
                className="flex-1"
              >
                정답 보기
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 정답 표시
  return (
    <div className="space-y-4">
      {/* 손글씨 모드: 내가 쓴 것과 정답 비교 */}
      {quizMode === 'handwriting' && (
        <div className="grid grid-cols-2 gap-3">
          {/* 내가 쓴 답 */}
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 text-center">내가 쓴 답</p>
            <div className="bg-white rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
              {savedCanvasImage ? (
                <img
                  src={savedCanvasImage}
                  alt="내가 쓴 답"
                  className="w-full"
                />
              ) : (
                <div className="w-full h-[100px] flex items-center justify-center text-zinc-400">
                  이미지 없음
                </div>
              )}
            </div>
          </div>
          {/* 정답 */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 text-center">정답</p>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {displayAnswer}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {displayReading}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 타자 모드: 정답 표시 */}
      {quizMode === 'typing' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">정답</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {displayAnswer}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {displayReading}
          </p>
        </div>
      )}

      {/* 타자 모드 결과 */}
      {quizMode === 'typing' && isCorrect !== null && (
        <div className={`text-center py-3 rounded-lg ${
          isCorrect
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          <p className="text-lg font-bold">
            {isCorrect ? '정답입니다!' : '오답입니다'}
          </p>
          {!isCorrect && (
            <p className="text-sm mt-1">입력: {typingInput}</p>
          )}
        </div>
      )}

      {/* 손글씨 모드 자가 채점 */}
      {quizMode === 'handwriting' && isCorrect === null && (
        <div className="space-y-2">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            작성한 답이 맞았나요?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSelfGrade(false)}
              variant="danger"
              className="flex-1"
            >
              틀렸어요
            </Button>
            <Button
              onClick={() => handleSelfGrade(true)}
              variant="success"
              className="flex-1"
            >
              맞았어요
            </Button>
          </div>
        </div>
      )}

      {/* 손글씨 모드 결과 */}
      {quizMode === 'handwriting' && isCorrect !== null && (
        <div className={`text-center py-3 rounded-lg ${
          isCorrect
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          <p className="text-lg font-bold">
            {isCorrect ? '잘했어요!' : '다음엔 맞춰봐요!'}
          </p>
        </div>
      )}

      {/* 다음 버튼 */}
      {isCorrect !== null && (
        <Button
          onClick={onComplete}
          variant="success"
          size="lg"
          fullWidth
        >
          {completeButtonText}
        </Button>
      )}
    </div>
  )
}
