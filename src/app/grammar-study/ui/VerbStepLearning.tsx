'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/Button'
import type { VerbConjugation } from '@/data/grammar'

interface VerbStepLearningProps {
  conjugations: VerbConjugation[]
  categoryLabel: string
  onExit: () => void
  onGoToList?: () => void
}

type LearningStep = 'learn' | 'quiz'
type QuizMode = 'typing' | 'handwriting'

export default function VerbStepLearning({
  conjugations,
  categoryLabel,
  onExit,
  onGoToList,
}: VerbStepLearningProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [step, setStep] = useState<LearningStep>('learn')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // 퀴즈 모드 관련
  const [quizMode, setQuizMode] = useState<QuizMode>('typing')
  const [typingInput, setTypingInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)

  // 캔버스 관련
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedCanvasImage, setSavedCanvasImage] = useState<string | null>(null)

  const currentConjugation = conjugations[currentIndex]

  // 퀴즈용 랜덤 예시 선택 (currentConjugation이 바뀔 때마다 재계산)
  const quizExample = useMemo(() => {
    const examples = currentConjugation.examples
    return examples[Math.floor(Math.random() * examples.length)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConjugation.id])

  // 정답의 히라가나 추출 (reading에서 → 뒤 부분)
  const correctReading = useMemo(() => {
    const parts = quizExample.reading.split(' → ')
    return parts.length > 1 ? parts[1] : ''
  }, [quizExample.reading])

  // 원형의 히라가나 추출 (reading에서 → 앞 부분)
  const dictionaryReading = useMemo(() => {
    const parts = quizExample.reading.split(' → ')
    return parts.length > 0 ? parts[0] : ''
  }, [quizExample.reading])

  // 캔버스 초기화
  useEffect(() => {
    if (step === 'quiz' && quizMode === 'handwriting' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [step, quizMode, currentIndex])

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const { audio } = await response.json()
      const audioData = `data:audio/mp3;base64,${audio}`
      const audioElement = new Audio(audioData)
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  // 타자 모드: 정답 확인
  const handleTypingCheck = () => {
    const correct = quizExample.conjugated
    // 정답 비교 (공백 제거, 히라가나 reading도 허용)
    const normalizedInput = typingInput.trim()
    const isMatch = normalizedInput === correct || normalizedInput === correctReading
    setIsCorrect(isMatch)
    setShowAnswer(true)
  }

  // 손글씨 모드: 자가 채점
  const handleSelfGrade = (correct: boolean) => {
    setIsCorrect(correct)
    setShowAnswer(true)
  }

  // 캔버스 그리기 함수들
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

    setIsDrawing(true)
    const { x, y } = getCanvasPoint(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
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
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // 캔버스 내용을 이미지로 저장하고 정답 보기
  const handleShowAnswer = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const imageData = canvas.toDataURL('image/png')
      setSavedCanvasImage(imageData)
    }
    setShowAnswer(true)
  }

  const handleNext = () => {
    if (currentIndex < conjugations.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setStep('learn')
      setIsCorrect(null)
      setTypingInput('')
      setShowAnswer(false)
      setSavedCanvasImage(null)
    } else {
      setIsCompleted(true)
    }
  }

  const handleSkip = () => {
    if (currentIndex < conjugations.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setStep('learn')
      setIsCorrect(null)
      setTypingInput('')
      setShowAnswer(false)
      setSavedCanvasImage(null)
    } else {
      onExit()
    }
  }

  const getGroupColor = (group: number) => {
    switch (group) {
      case 1:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 2:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 3:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  // 완료 화면
  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              학습 완료!
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {categoryLabel} 전체 학습을 완료했습니다
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            {onGoToList && (
              <Button
                onClick={onGoToList}
                className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-lg transition-colors"
              >
                전체 리스트 보기
              </Button>
            )}
            <Button
              onClick={onExit}
              className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              메뉴로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                {categoryLabel}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentIndex + 1} / {conjugations.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </header>

      {/* 진행 바 */}
      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / conjugations.length) * 100}%` }}
        />
      </div>

      {/* 컨텐츠 */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {step === 'learn' ? (
          // 학습 단계
          <div className="space-y-6">
            {/* 활용형 이름 */}
            <div className="text-center py-6">
              <h2 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {currentConjugation.name}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {currentConjugation.usage}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded">
                {currentConjugation.level}
              </span>
            </div>

            {/* 규칙 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">활용 규칙</h3>
              {currentConjugation.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">
                    {rule.group}
                  </p>
                  <p className="text-lg text-zinc-900 dark:text-white font-bold">
                    {rule.rule}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* 예시 (일부만 표시) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">예시</h3>
              {currentConjugation.examples.slice(0, 4).map((example, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${getGroupColor(example.group)}`}>
                          {example.group}그룹
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                          {example.meaning}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-900 dark:text-white">
                          {example.dictionary}
                        </span>
                        <span className="text-zinc-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                          {example.conjugated}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {example.reading}
                      </p>
                    </div>
                    <Button
                      onClick={() => speakJapanese(example.conjugated)}
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                      disabled={isSpeaking}
                    >
                      <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 퀴즈로 이동 버튼 */}
            <div className="pt-4">
              <Button
                onClick={() => setStep('quiz')}
                className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors"
              >
                확인 퀴즈
              </Button>
            </div>
          </div>
        ) : (
          // 퀴즈 단계
          <div className="space-y-6 py-4">
            {/* 문제 */}
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                {currentConjugation.name}으로 바꾸세요
              </p>
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                {quizExample.dictionary}
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-1">
                {dictionaryReading}
              </p>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                {quizExample.meaning}
              </p>
            </div>

            {/* 모드 선택 */}
            {!showAnswer && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setQuizMode('typing')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quizMode === 'typing'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  타자 입력
                </button>
                <button
                  onClick={() => setQuizMode('handwriting')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quizMode === 'handwriting'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  손글씨
                </button>
              </div>
            )}

            {/* 타자 모드 */}
            {quizMode === 'typing' && !showAnswer && (
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
                  className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white text-lg font-bold rounded-lg transition-colors"
                >
                  확인하기
                </Button>
              </div>
            )}

            {/* 손글씨 모드 */}
            {quizMode === 'handwriting' && !showAnswer && (
              <div className="space-y-4">
                <div className="relative bg-white rounded-xl border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
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
                <div className="flex gap-2">
                  <Button
                    onClick={clearCanvas}
                    className="flex-1 py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
                  >
                    지우기
                  </Button>
                  <Button
                    onClick={handleShowAnswer}
                    className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    정답 보기
                  </Button>
                </div>
              </div>
            )}

            {/* 정답 표시 */}
            {showAnswer && (
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
                            {quizExample.conjugated}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {correctReading}
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
                      {quizExample.conjugated}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {quizExample.reading}
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
                        className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                      >
                        틀렸어요
                      </Button>
                      <Button
                        onClick={() => handleSelfGrade(true)}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
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
                    onClick={handleNext}
                    className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors"
                  >
                    {currentIndex < conjugations.length - 1 ? '다음 활용형' : '완료'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
