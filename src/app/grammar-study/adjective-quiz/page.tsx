'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdjectiveQuizSetup, AdjectiveConjugationQuiz } from '../ui/adjective'
import type { AdjectiveQuestionCount as QuestionCount } from '../ui/adjective'

type PageMode = 'setup' | 'quiz'

export default function AdjectiveQuizPage() {
  const router = useRouter()
  const [pageMode, setPageMode] = useState<PageMode>('setup')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  if (pageMode === 'quiz') {
    return (
      <AdjectiveConjugationQuiz
        questionCount={questionCount}
        onExit={() => router.push('/grammar-study/adjectives')}
      />
    )
  }

  return (
    <AdjectiveQuizSetup
      onStart={(config) => {
        setQuestionCount(config.questionCount)
        setPageMode('quiz')
      }}
      onBack={() => router.push('/grammar-study/adjectives')}
    />
  )
}
