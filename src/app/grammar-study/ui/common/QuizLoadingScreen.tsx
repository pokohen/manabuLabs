'use client'

import { Button } from '@/components/Button'

interface QuizLoadingScreenProps {
  progress: number
  title?: string
  description?: string
  onCancel: () => void
}

export default function QuizLoadingScreen({
  progress,
  title = '문제 출제중입니다',
  description = 'AI가 문장을 분석하고 있어요',
  onCancel
}: QuizLoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-spin"
                style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
              ></div>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {description}
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {progress}%
          </p>
        </div>

        <Button
          onClick={onCancel}
          className="mt-4 py-2 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
        >
          취소
        </Button>
      </div>
    </div>
  )
}
