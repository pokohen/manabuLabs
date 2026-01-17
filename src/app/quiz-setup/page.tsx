'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KanaType, QuestionCount, TimerMode } from '@/data/kana'
import { Button } from '@/components/Button'
import { useQuizStore } from '@/store/quizStore'

export default function QuizSetup() {
  const router = useRouter()
  const setConfig = useQuizStore((state) => state.setConfig)

  const [kanaType, setKanaType] = useState<KanaType>('hiragana')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [timerMode, setTimerMode] = useState<TimerMode>('none')

  const handleStartQuiz = () => {
    setConfig({ kanaType, questionCount, timerMode })
    router.push('/quiz')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          퀴즈 설정
        </h1>

        <div className="w-full max-w-md space-y-6">
          {/* 문자 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              문자 종류
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setKanaType('hiragana')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  kanaType === 'hiragana'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                히라가나 (あ)
              </Button>
              <Button
                onClick={() => setKanaType('katakana')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  kanaType === 'katakana'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                가타카나 (ア)
              </Button>
            </div>
          </div>

          {/* 문제 수 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              문제 수
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setQuestionCount(10)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 10
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                10문제
              </Button>
              <Button
                onClick={() => setQuestionCount(20)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 20
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                20문제
              </Button>
              <Button
                onClick={() => setQuestionCount('all')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                전체
              </Button>
            </div>
          </div>

          {/* 타이머 모드 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              타이머 설정
            </label>
            <div className="space-y-3">
              <Button
                onClick={() => setTimerMode('none')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'none'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                <div className="font-bold">타이머 없음&nbsp;</div>
                <div className="text-sm opacity-80">편안하게 풀기</div>
              </Button>
              <Button
                onClick={() => setTimerMode('per-question')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'per-question'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                <div className="font-bold">문제당 10초&nbsp;</div>
                <div className="text-sm opacity-80">각 문제마다 10초 제한</div>
              </Button>
              <Button
                onClick={() => setTimerMode('time-attack')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'time-attack'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                <div className="font-bold">타임어택 (20분)&nbsp;</div>
                <div className="text-sm opacity-80">전체 20분 안에 모든 문제 풀기</div>
              </Button>
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleStartQuiz}
              className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg transition-colors"
            >
              퀴즈 시작하기
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              뒤로 가기
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
