'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { QuestionCount } from './AdjectiveConjugationQuiz'

interface AdjectiveQuizSetupProps {
  onStart: (config: { questionCount: QuestionCount }) => void
  onBack: () => void
}

export default function AdjectiveQuizSetup({ onStart, onBack }: AdjectiveQuizSetupProps) {
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  const handleStart = () => {
    onStart({ questionCount })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          형용사 활용 퀴즈
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          い형용사와 な형용사의 활용형을 맞춰보세요
        </p>

        <div className="w-full space-y-6">
          {/* 선택된 레벨 표시 */}
          <div className="text-center py-2 px-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <span className="text-orange-700 dark:text-orange-300 font-medium">
              형용사 활용 퀴즈
            </span>
          </div>

          {/* 문제 수 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              문제 수
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setQuestionCount(10)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors cursor-pointer ${
                  questionCount === 10
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                10문제
              </button>
              <button
                onClick={() => setQuestionCount(20)}
                className={`py-4 px-4 font-medium rounded-lg transition-colors cursor-pointer ${
                  questionCount === 20
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                20문제
              </button>
              <button
                onClick={() => setQuestionCount('all')}
                className={`py-4 px-4 font-medium rounded-lg transition-colors cursor-pointer ${
                  questionCount === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                전체
              </button>
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleStart}
              className="w-full py-4 px-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-lg transition-colors"
            >
              퀴즈 시작하기
            </Button>
            <Button
              onClick={onBack}
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
