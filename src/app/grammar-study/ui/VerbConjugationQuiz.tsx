'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/Button'
import verbConjugationData from '@/data/grammar/verb-conjugation.json'

export type QuestionCount = 10 | 20 | 'all'

interface VerbConjugationQuizProps {
  questionCount: QuestionCount
  onExit: () => void
}

interface QuizQuestion {
  dictionary: string
  conjugated: string
  reading: string
  meaning: string
  conjugationType: string
  conjugationName: string
  group: number
}

interface AnsweredQuestion {
  question: QuizQuestion
  userAnswer: string
  isCorrect: boolean
}

type QuizMode = 'typing' | 'handwriting'
type ResultFilter = 'all' | 'correct' | 'wrong'

// 활용 상세 모달 컴포넌트
function ConjugationDetailModal({
  answeredQuestion,
  onClose
}: {
  answeredQuestion: AnsweredQuestion
  onClose: () => void
}) {
  const { question } = answeredQuestion

  // 해당 활용 타입의 전체 정보 가져오기
  const conjugationInfo = verbConjugationData.conjugations.find(
    c => c.id === question.conjugationType
  )

  // 해당 동사의 전체 활용 정보 가져오기
  const verbExample = conjugationInfo?.examples.find(
    ex => ex.dictionary === question.dictionary
  )

  // body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getGroupName = (group: number) => {
    switch (group) {
      case 1: return '1그룹'
      case 2: return '2그룹'
      case 3: return '3그룹'
      default: return ''
    }
  }

  if (!conjugationInfo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {conjugationInfo.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* 용법 */}
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {conjugationInfo.usage}
            </p>
          </div>

          {/* 이 동사의 활용 */}
          {verbExample && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {verbExample.dictionary}
                </span>
                <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs rounded">
                  {getGroupName(verbExample.group)}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {verbExample.meaning}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">긍정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.conjugated}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">부정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.negative}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">과거</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.past}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">과거부정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.pastNegative}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                {verbExample.reading}
              </p>
            </div>
          )}

          {/* 활용 규칙 */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">활용 규칙</h3>
            <div className="space-y-2">
              {conjugationInfo.rules.map((rule, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${
                    rule.group === getGroupName(question.group)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {rule.group}
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {rule.rule}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 퀴즈 문제 생성
const generateQuestions = (count: QuestionCount): QuizQuestion[] => {
  const allQuestions: QuizQuestion[] = []

  for (const conjugation of verbConjugationData.conjugations) {
    for (const example of conjugation.examples) {
      allQuestions.push({
        dictionary: example.dictionary,
        conjugated: example.conjugated,
        reading: example.reading,
        meaning: example.meaning,
        conjugationType: conjugation.id,
        conjugationName: conjugation.name,
        group: example.group,
      })
    }
  }

  // 셔플
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)

  if (count === 'all') return shuffled
  return shuffled.slice(0, count)
}

export default function VerbConjugationQuiz({ questionCount, onExit }: VerbConjugationQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])
  const [showResult, setShowResult] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<AnsweredQuestion | null>(null)
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')

  // 퀴즈 모드 관련
  const [quizMode, setQuizMode] = useState<QuizMode>('typing')
  const [typingInput, setTypingInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // 캔버스 관련
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedCanvasImage, setSavedCanvasImage] = useState<string | null>(null)

  const questions = useMemo(() => generateQuestions(questionCount), [questionCount])
  const currentQuestion = questions[currentIndex]

  // 정답의 히라가나 추출 (reading에서 → 뒤 부분)
  const correctReading = useMemo(() => {
    const parts = currentQuestion.reading.split(' → ')
    return parts.length > 1 ? parts[1] : ''
  }, [currentQuestion.reading])

  // 원형의 히라가나 추출 (reading에서 → 앞 부분)
  const dictionaryReading = useMemo(() => {
    const parts = currentQuestion.reading.split(' → ')
    return parts.length > 0 ? parts[0] : ''
  }, [currentQuestion.reading])

  // 캔버스 초기화
  useEffect(() => {
    if (!showAnswer && quizMode === 'handwriting' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [showAnswer, quizMode, currentIndex])

  const getGroupName = (group: number) => {
    switch (group) {
      case 1: return '1그룹'
      case 2: return '2그룹'
      case 3: return '3그룹'
      default: return ''
    }
  }

  // 타자 모드: 정답 확인
  const handleTypingCheck = () => {
    const correct = currentQuestion.conjugated
    const normalizedInput = typingInput.trim()
    const isMatch = normalizedInput === correct || normalizedInput === correctReading
    setIsCorrect(isMatch)
    setShowAnswer(true)

    if (isMatch) {
      setCorrectCount(prev => prev + 1)
    }
    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion,
      userAnswer: normalizedInput,
      isCorrect: isMatch
    }])
  }

  // 손글씨 모드: 자가 채점
  const handleSelfGrade = (correct: boolean) => {
    setIsCorrect(correct)

    if (correct) {
      setCorrectCount(prev => prev + 1)
    }
    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion,
      userAnswer: '(손글씨)',
      isCorrect: correct
    }])
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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setTypingInput('')
      setShowAnswer(false)
      setIsCorrect(null)
      setSavedCanvasImage(null)
    } else {
      setShowResult(true)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setTypingInput('')
    setShowAnswer(false)
    setIsCorrect(null)
    setCorrectCount(0)
    setAnsweredQuestions([])
    setShowResult(false)
    setSavedCanvasImage(null)
    setResultFilter('all')
  }

  // 결과 화면
  if (showResult) {
    const accuracy = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex-1 max-w-2xl mx-auto w-full py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              퀴즈 완료!
            </h1>
            <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {accuracy}%
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {questions.length}문제 중 {correctCount}문제 정답
            </p>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setResultFilter('all')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                resultFilter === 'all'
                  ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              전체 ({answeredQuestions.length})
            </button>
            <button
              onClick={() => setResultFilter('correct')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                resultFilter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              정답 ({answeredQuestions.filter(q => q.isCorrect).length})
            </button>
            <button
              onClick={() => setResultFilter('wrong')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                resultFilter === 'wrong'
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              오답 ({answeredQuestions.filter(q => !q.isCorrect).length})
            </button>
          </div>

          {/* 문제 목록 */}
          <div className="mb-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              탭하여 활용 규칙 보기
            </p>
            <div className="space-y-3">
              {answeredQuestions
                .filter(q => {
                  if (resultFilter === 'correct') return q.isCorrect
                  if (resultFilter === 'wrong') return !q.isCorrect
                  return true
                })
                .map((answered, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestion(answered)}
                    className={`w-full text-left rounded-xl border p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors ${
                      answered.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          answered.isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {answered.isCorrect ? '○' : '✕'}
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {answered.question.dictionary}
                        </span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {answered.question.conjugationName}
                        </span>
                      </div>
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">정답: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {answered.question.conjugated}
                        </span>
                      </div>
                      {!answered.isCorrect && (
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">입력: </span>
                          <span className="text-red-500 font-medium">
                            {answered.userAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* 활용 상세 모달 */}
          {selectedQuestion && (
            <ConjugationDetailModal
              answeredQuestion={selectedQuestion}
              onClose={() => setSelectedQuestion(null)}
            />
          )}

          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors"
            >
              다시 풀기
            </Button>
            <Button
              onClick={onExit}
              className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              나가기
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onExit}
            className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {correctCount}점
            </span>
          </div>
        </div>
      </header>

      {/* 문제 */}
      <main className="flex-1 max-w-2xl mx-auto w-full py-6 flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* 문제 정보 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                {currentQuestion.conjugationName}
              </span>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded">
                {getGroupName(currentQuestion.group)}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
              {currentQuestion.dictionary}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-1">
              {dictionaryReading}
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {currentQuestion.meaning}
            </p>
          </div>

          {/* 모드 선택 */}
          {!showAnswer && (
            <div className="flex justify-center gap-2 mb-4">
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
                          {currentQuestion.conjugated}
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
                    {currentQuestion.conjugated}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {currentQuestion.reading}
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
                  {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
