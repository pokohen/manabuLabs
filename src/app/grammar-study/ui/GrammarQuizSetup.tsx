'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { GrammarCategory } from '@/data/grammar'

export type QuestionCount = 10 | 20 | 'all'

interface GrammarQuizSetupProps {
  onStart: (config: { level: GrammarCategory; questionCount: QuestionCount }) => void
  onBack: () => void
  initialLevel?: GrammarCategory
}

export default function GrammarQuizSetup({ onStart, onBack, initialLevel }: GrammarQuizSetupProps) {
  const [level, setLevel] = useState<GrammarCategory>(initialLevel || 'n5-patterns')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  const handleStart = () => {
    onStart({ level, questionCount })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          문법 퀴즈
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          예문을 퍼즐처럼 맞춰보세요
        </p>

        <div className="w-full space-y-6">
          {/* 레벨 선택 (initialLevel이 없을 때만 표시) */}
          {!initialLevel && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                문법 레벨
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLevel('n5-patterns')}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors cursor-pointer ${
                    level === 'n5-patterns'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  N5 문형
                </button>
                <button
                  onClick={() => setLevel('n4-patterns')}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors cursor-pointer ${
                    level === 'n4-patterns'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  N4 문형
                </button>
              </div>
            </div>
          )}

          {/* 선택된 레벨 표시 (initialLevel이 있을 때) */}
          {initialLevel && (
            <div className="text-center py-2 px-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                {initialLevel === 'n5-patterns' ? 'N5 문형' : 'N4 문형'} 퀴즈
              </span>
            </div>
          )}

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
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors"
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
