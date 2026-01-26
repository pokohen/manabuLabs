'use client'

import { Button } from '@/components/Button'

interface LearningCompletionScreenProps {
  categoryLabel: string
  totalPatterns: number
  onGoToList?: () => void
  onExit: () => void
}

export default function LearningCompletionScreen({
  categoryLabel,
  totalPatterns,
  onGoToList,
  onExit
}: LearningCompletionScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            학습 완료!
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {categoryLabel} {totalPatterns}개 문법을 모두 학습했습니다
          </p>
        </div>

        <div className="w-full space-y-3 mt-4">
          {onGoToList && (
            <Button
              onClick={onGoToList}
              className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-lg transition-colors"
            >
              전체 리스트 보기
            </Button>
          )}
          <Button
            onClick={onExit}
            className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            메뉴로 돌아가기
          </Button>
        </div>
      </main>
    </div>
  )
}
