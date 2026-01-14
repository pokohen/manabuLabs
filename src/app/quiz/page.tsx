'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { hiragana, katakana, KanaData, KanaType, QuestionCount, TimerMode } from '@/data/kana'

interface Question {
  kana: KanaData
  options: string[]
  correctAnswer: string
}

interface QuizConfig {
  kanaType: KanaType
  questionCount: QuestionCount
  timerMode: TimerMode
}

export default function QuizPage() {
  const router = useRouter()

  const [config, setConfig] = useState<QuizConfig | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [questionTimer, setQuestionTimer] = useState(10)
  const [totalTimer, setTotalTimer] = useState(20 * 60) // 20분 = 1200초
  const [showResult, setShowResult] = useState(false)

  // localStorage에서 설정 읽기
  useEffect(() => {
    const savedConfig = localStorage.getItem('quizConfig')

    if (!savedConfig) {
      // 설정이 없으면 quiz-setup으로 리다이렉트
      router.replace('/quiz-setup')
      return
    }

    try {
      const parsed = JSON.parse(savedConfig) as QuizConfig
      setConfig(parsed)
      // 사용 후 삭제 (새로고침 시 quiz-setup으로 가도록)
      localStorage.removeItem('quizConfig')
    } catch {
      router.replace('/quiz-setup')
    }
  }, [router])

  // 문제 생성 함수
  const generateQuestions = useCallback(() => {
    if (!config) return

    const kanaData = config.kanaType === 'hiragana' ? hiragana : katakana
    const count = config.questionCount === 'all' ? kanaData.length : config.questionCount

    // 랜덤하게 섞기
    const shuffled = [...kanaData].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    // 각 문제에 대해 4개의 선택지 생성
    const generatedQuestions: Question[] = selected.map((kana) => {
      const correctAnswer = kana.romaji
      const wrongAnswers = kanaData
        .filter((k) => k.romaji !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((k) => k.romaji)

      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)

      return {
        kana,
        options,
        correctAnswer,
      }
    })

    setQuestions(generatedQuestions)
  }, [config])

  useEffect(() => {
    if (config) {
      generateQuestions()
    }
  }, [config, generateQuestions])

  // 문제당 타이머
  useEffect(() => {
    if (config?.timerMode === 'per-question' && !isFinished && !showResult) {
      if (questionTimer <= 0) {
        handleNextQuestion()
        return
      }

      const timer = setInterval(() => {
        setQuestionTimer((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [config?.timerMode, questionTimer, isFinished, showResult])

  // 타임어택 타이머
  useEffect(() => {
    if (config?.timerMode === 'time-attack' && !isFinished) {
      if (totalTimer <= 0) {
        setIsFinished(true)
        return
      }

      const timer = setInterval(() => {
        setTotalTimer((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [config?.timerMode, totalTimer, isFinished])

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showResult) return

    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setQuestionTimer(10)
    } else {
      setIsFinished(true)
    }
  }

  const handleRestart = () => {
    router.push('/quiz-setup')
  }

  // 설정 로딩 중 또는 문제 생성 중
  if (!config || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">퀴즈 완료!</h1>
          <div className="mb-6">
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {correctCount} / {questions.length}
            </p>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              정답률: {Math.round((correctCount / questions.length) * 100)}%
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md">
        {/* 타이머 표시 */}
        <div className="mb-4 text-center">
          {config.timerMode === 'per-question' && (
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {questionTimer}초
            </div>
          )}
          {config.timerMode === 'time-attack' && (
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              남은 시간: {formatTime(totalTimer)}
            </div>
          )}
        </div>

        {/* 진행 상황 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            <span>문제 {currentQuestionIndex + 1} / {questions.length}</span>
            <span>정답: {correctCount}</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              이 문자의 발음은?
            </p>
            <p className="text-8xl font-bold text-black dark:text-white mb-4">
              {currentQuestion.kana.char}
            </p>
          </div>

          {/* 선택지 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              let buttonClass = 'w-full py-4 px-4 text-lg font-medium rounded-lg transition-colors '

              if (showResult) {
                if (option === currentQuestion.correctAnswer) {
                  buttonClass += 'bg-green-500 text-white'
                } else if (option === selectedAnswer) {
                  buttonClass += 'bg-red-500 text-white'
                } else {
                  buttonClass += 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                }
              } else {
                buttonClass += 'bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {/* 다음 문제 버튼 */}
          {showResult && (
            <button
              onClick={handleNextQuestion}
              className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
