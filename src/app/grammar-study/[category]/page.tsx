'use client'

import { useParams, useRouter, notFound } from 'next/navigation'
import { grammarCategories, GrammarCategory } from '@/data/grammar'
import GrammarStepPage from '../ui/GrammarStepPage'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string

  // 유효한 카테고리인지 확인
  const validCategory = grammarCategories.find(c => c.id === category)

  if (!validCategory) {
    notFound()
  }

  return (
    <GrammarStepPage
      category={category as GrammarCategory}
      onBack={() => router.push('/grammar-study')}
      onQuiz={() => router.push(`/grammar-study/quiz?level=${category}`)}
    />
  )
}
