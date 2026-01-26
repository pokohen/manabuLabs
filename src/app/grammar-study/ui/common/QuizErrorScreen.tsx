'use client'

import { Button } from '@/components/Button'

interface QuizErrorScreenProps {
  message: string
  onRetry: () => void
  onExit: () => void
}

export default function QuizErrorScreen({
  message,
  onRetry,
  onExit
}: QuizErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            오류 발생
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              다시 시도
            </Button>
            <Button
              onClick={onExit}
              className="w-full py-3 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg"
            >
              나가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
