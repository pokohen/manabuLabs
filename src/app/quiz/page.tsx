'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/Button'

export default function QuizPage() {
  const router = useRouter()

  const {
    config,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    correctCount,
    isFinished,
    questionTimer,
    totalTimer,
    showResult,
    selectAnswer,
    nextQuestion,
    decrementQuestionTimer,
    decrementTotalTimer,
  } = useQuizStore()

  // config가 없으면 quiz-setup으로 리다이렉트
  useEffect(() => {
    if (!config) {
      router.replace('/quiz-setup')
    }
  }, [config, router])

  // 퀴즈 완료 시 결과 페이지로 이동
  useEffect(() => {
    if (isFinished) {
      router.replace('/quiz-result')
    }
  }, [isFinished, router])

  // 문제당 타이머
  useEffect(() => {
    if (config?.timerMode !== 'per-question' || isFinished || showResult) return

    if (questionTimer <= 0) {
      nextQuestion()
      return
    }

    const timer = setInterval(() => {
      decrementQuestionTimer()
    }, 1000)

    return () => clearInterval(timer)
  }, [config?.timerMode, questionTimer, isFinished, showResult, nextQuestion, decrementQuestionTimer])

  // 타임어택 타이머
  useEffect(() => {
    if (config?.timerMode !== 'time-attack' || isFinished) return

    if (totalTimer <= 0) return

    const timer = setInterval(() => {
      decrementTotalTimer()
    }, 1000)

    return () => clearInterval(timer)
  }, [config?.timerMode, totalTimer, isFinished, decrementTotalTimer])

  // 설정 로딩 중 또는 문제 생성 중
  if (!config || questions.length === 0 || isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                buttonClass += 'cursor-pointer bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }

              return (
                <button
                  key={option}
                  onClick={() => selectAnswer(option)}
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
            <Button
              onClick={nextQuestion}
              variant="primary"
              fullWidth
              className="mt-6"
            >
              {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
