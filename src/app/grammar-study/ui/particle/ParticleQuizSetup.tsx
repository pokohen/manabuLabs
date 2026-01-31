'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

export type QuestionCount = 10 | 20 | 'all'

interface ParticleQuizSetupProps {
  onStart: (config: { questionCount: QuestionCount }) => void
  onBack: () => void
}

export default function ParticleQuizSetup({ onStart, onBack }: ParticleQuizSetupProps) {
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  const questionOptions: { value: QuestionCount; label: string }[] = [
    { value: 10, label: '10문제' },
    { value: 20, label: '20문제' },
    { value: 'all', label: '전체' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          조사 퀴즈
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          조사의 용법을 테스트해보세요
        </p>

        {/* 문제 수 선택 */}
        <div className="w-full">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">문제 수</p>
          <div className="grid grid-cols-3 gap-2">
            {questionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setQuestionCount(option.value)}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  questionCount === option.value
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-orange-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="w-full space-y-3 mt-4">
          <Button
            onClick={() => onStart({ questionCount })}
            variant="warning"
            size="lg"
            fullWidth
          >
            퀴즈 시작
          </Button>
        </div>
      </main>
    </div>
  )
}
