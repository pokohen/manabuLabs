'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ParticleQuizSetup, ParticleQuiz } from '../ui/particle'
import type { ParticleQuestionCount as QuestionCount } from '../ui/particle'

type PageMode = 'setup' | 'quiz'

export default function ParticleQuizPage() {
  const router = useRouter()
  const [pageMode, setPageMode] = useState<PageMode>('setup')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  if (pageMode === 'quiz') {
    return (
      <ParticleQuiz
        questionCount={questionCount}
        onExit={() => router.push('/grammar-study/particles')}
      />
    )
  }

  return (
    <ParticleQuizSetup
      onStart={(config) => {
        setQuestionCount(config.questionCount)
        setPageMode('quiz')
      }}
      onBack={() => router.push('/grammar-study/particles')}
    />
  )
}
