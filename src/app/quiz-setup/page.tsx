'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KanaType, QuestionCount, TimerMode } from '@/data/kana'

export default function QuizSetup() {
  const router = useRouter()
  const [kanaType, setKanaType] = useState<KanaType>('hiragana')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [timerMode, setTimerMode] = useState<TimerMode>('none')

  const handleStartQuiz = () => {
    // localStorage에 퀴즈 설정 저장
    localStorage.setItem('quizConfig', JSON.stringify({
      kanaType,
      questionCount,
      timerMode,
    }))
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
              <button
                onClick={() => setKanaType('hiragana')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  kanaType === 'hiragana'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                히라가나 (あ)
              </button>
              <button
                onClick={() => setKanaType('katakana')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  kanaType === 'katakana'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                카타카나 (ア)
              </button>
            </div>
          </div>

          {/* 문제 수 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              문제 수
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setQuestionCount(10)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 10
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                10문제
              </button>
              <button
                onClick={() => setQuestionCount(20)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 20
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                20문제
              </button>
              <button
                onClick={() => setQuestionCount('all')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                  questionCount === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                전체
              </button>
            </div>
          </div>

          {/* 타이머 모드 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              타이머 설정
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setTimerMode('none')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'none'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                <div className="font-bold">타이머 없음</div>
                <div className="text-sm opacity-80">편안하게 풀기</div>
              </button>
              <button
                onClick={() => setTimerMode('per-question')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'per-question'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                <div className="font-bold">문제당 10초</div>
                <div className="text-sm opacity-80">각 문제마다 10초 제한</div>
              </button>
              <button
                onClick={() => setTimerMode('time-attack')}
                className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                  timerMode === 'time-attack'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                }`}
              >
                <div className="font-bold">타임어택 (20분)</div>
                <div className="text-sm opacity-80">전체 20분 안에 모든 문제 풀기</div>
              </button>
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg transition-colors"
            >
              퀴즈 시작하기
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
