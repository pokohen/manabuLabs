'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VerbConjugationQuizSetup from '../ui/VerbConjugationQuizSetup'
import VerbConjugationQuiz, { QuestionCount } from '../ui/VerbConjugationQuiz'

type PageMode = 'setup' | 'quiz'

export default function VerbQuizPage() {
  const router = useRouter()
  const [pageMode, setPageMode] = useState<PageMode>('setup')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  if (pageMode === 'quiz') {
    return (
      <VerbConjugationQuiz
        questionCount={questionCount}
        onExit={() => router.push('/grammar-study/verb-conjugation')}
      />
    )
  }

  return (
    <VerbConjugationQuizSetup
      onStart={(config) => {
        setQuestionCount(config.questionCount)
        setPageMode('quiz')
      }}
      onBack={() => router.push('/grammar-study/verb-conjugation')}
    />
  )
}
