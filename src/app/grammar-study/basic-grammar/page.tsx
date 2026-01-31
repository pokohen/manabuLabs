'use client'

import { useRouter } from 'next/navigation'
import { NavigationCard } from '@/components/NavigationCard'
import { basicGrammarCategories } from '@/data/grammar'

export default function BasicGrammarPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          기본 문법
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          동사, 조사, 형용사 활용
        </p>

        <div className="w-full space-y-3 mt-4">
          {basicGrammarCategories.map((category) => (
            <NavigationCard
              key={category.id}
              onClick={() => router.push(`/grammar-study/${category.id}`)}
              colorClass={category.color}
            >
              <div className="flex flex-col items-center">
                <span>{category.label}</span>
                <span className="text-sm font-normal opacity-80 mt-1">{category.description}</span>
              </div>
            </NavigationCard>
          ))}
        </div>

      </main>
    </div>
  )
}
