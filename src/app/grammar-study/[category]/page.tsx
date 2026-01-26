'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation'
import { grammarCategories, GrammarCategory } from '@/data/grammar'
import GrammarStepPage from '../ui/GrammarStepPage'

function CategoryContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = params.category as string

  // 유효한 카테고리인지 확인
  const validCategory = grammarCategories.find(c => c.id === category)

  if (!validCategory) {
    notFound()
  }

  // URL에서 mode와 index 읽기
  const mode = searchParams.get('mode') as 'select' | 'step' | 'list' | null
  const index = searchParams.get('index')

  const handleModeChange = (newMode: 'select' | 'step' | 'list', newIndex?: number) => {
    const params = new URLSearchParams()
    if (newMode !== 'select') {
      params.set('mode', newMode)
    }
    if (newIndex !== undefined && newIndex > 0) {
      params.set('index', String(newIndex))
    }
    const queryString = params.toString()
    router.push(`/grammar-study/${category}${queryString ? `?${queryString}` : ''}`)
  }

  const handleQuiz = () => {
    if (category === 'verb-conjugation') {
      router.push('/grammar-study/verb-quiz')
    } else if (category === 'particles') {
      router.push('/grammar-study/particle-quiz')
    } else if (category === 'adjectives') {
      router.push('/grammar-study/adjective-quiz')
    } else {
      router.push(`/grammar-study/quiz?level=${category}`)
    }
  }

  return (
    <GrammarStepPage
      category={category as GrammarCategory}
      mode={mode || 'select'}
      initialIndex={index ? parseInt(index, 10) : 0}
      onModeChange={handleModeChange}
      onBack={() => router.push('/grammar-study')}
      onQuiz={handleQuiz}
    />
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  )
}
