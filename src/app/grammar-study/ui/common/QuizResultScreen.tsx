'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'

type ResultFilter = 'all' | 'correct' | 'wrong'

export interface AnsweredItem<T> {
  data: T
  isCorrect: boolean
  userAnswer?: string
}

interface QuizResultScreenProps<T> {
  totalCount: number
  correctCount: number
  answeredItems: AnsweredItem<T>[]
  onRetry: () => void
  onExit: () => void
  renderItem: (item: AnsweredItem<T>, index: number) => React.ReactNode
  itemClickHint?: string
}

export default function QuizResultScreen<T>({
  totalCount,
  correctCount,
  answeredItems,
  onRetry,
  onExit,
  renderItem,
  itemClickHint = '탭하여 상세 보기'
}: QuizResultScreenProps<T>) {
  const [filter, setFilter] = useState<ResultFilter>('all')

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const wrongCount = totalCount - correctCount

  const filteredItems = answeredItems.filter(item => {
    if (filter === 'correct') return item.isCorrect
    if (filter === 'wrong') return !item.isCorrect
    return true
  })

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex-1 max-w-2xl mx-auto w-full py-8">
        {/* 결과 요약 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 text-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            퀴즈 완료!
          </h2>

          <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
            {accuracy}%
          </div>

          {/* 전체 / 정답 / 오답 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCount}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">전체</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">정답</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{wrongCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400">오답</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              다시 풀기
            </Button>
            <Button
              onClick={onExit}
              className="w-full py-3 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg"
            >
              나가기
            </Button>
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            전체 ({answeredItems.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            정답 ({answeredItems.filter(q => q.isCorrect).length})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              filter === 'wrong'
                ? 'bg-red-500 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            오답 ({answeredItems.filter(q => !q.isCorrect).length})
          </button>
        </div>

        {/* 문제 목록 */}
        <div className="mb-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            {itemClickHint}
          </p>
          <div className="space-y-3">
            {filteredItems.map((item, index) => renderItem(item, index))}
          </div>
        </div>
      </main>
    </div>
  )
}
