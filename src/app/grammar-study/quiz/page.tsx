'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GrammarQuizSetup, GrammarPuzzleQuiz } from '../ui/patterns'
import type { QuestionCount } from '../ui/patterns'
import { GrammarCategory } from '@/data/grammar'

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 초기 레벨 가져오기
  const initialLevel = searchParams.get('level') as GrammarCategory | null

  const [quizStarted, setQuizStarted] = useState(false)
  const [quizConfig, setQuizConfig] = useState<{
    level: GrammarCategory
    questionCount: QuestionCount
  } | null>(null)

  if (quizStarted && quizConfig) {
    return (
      <GrammarPuzzleQuiz
        level={quizConfig.level}
        questionCount={quizConfig.questionCount}
        onExit={() => router.push('/grammar-study')}
      />
    )
  }

  return (
    <GrammarQuizSetup
      initialLevel={initialLevel || 'n5-patterns'}
      onStart={(config) => {
        setQuizConfig(config)
        setQuizStarted(true)
      }}
      onBack={() => router.push('/grammar-study')}
    />
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">로딩 중...</p>
      </div>
    }>
      <QuizContent />
    </Suspense>
  )
}
