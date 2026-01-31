'use client'

import { useRouter } from 'next/navigation'
import { NavigationCard } from '@/components/NavigationCard'
import { grammarMenu, isGroupCategory } from '@/data/grammar'

export default function GrammarStudyPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          문법 공부
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          학습할 카테고리를 선택하세요
        </p>

        <div className="w-full space-y-3 mt-4">
          {grammarMenu.map((item) => (
            <NavigationCard
              key={item.id}
              onClick={() => router.push(`/grammar-study/${item.id}`)}
              colorClass={item.color}
            >
              <div className="flex flex-col items-center">
                <span>{item.label}</span>
                <span className="text-sm font-normal opacity-80 mt-1">{item.description}</span>
              </div>
            </NavigationCard>
          ))}
        </div>

      </main>
    </div>
  )
}
