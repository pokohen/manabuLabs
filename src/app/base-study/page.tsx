'use client'

import { useRouter } from 'next/navigation'
import { NavigationCard } from '@/components/NavigationCard'

type ViewMode = 'menu' | 'example-sentence'

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <h1 className="text-4xl font-bold text-black dark:text-white text-center">
          히라가나 / 가타카나<br/>공부하기
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          히라가나 및 가타카나 문자를<br />
          적으면서 공부하거나 퀴즈를 풀어보세요
        </p>

        <div className="w-full max-w-md grid gap-4 grid-cols-2 mt-8">

          <NavigationCard
            onClick={() => router.push('/monji-study')}
            colorClass="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            className="py-6 rounded-xl hover:shadow-xl hover:scale-[1.02]"
          >
            문자 공부하기
          </NavigationCard>

          <NavigationCard
            onClick={() => router.push('/quiz-setup')}
            colorClass="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            className="py-6 rounded-xl hover:shadow-xl hover:scale-[1.02]"
          >
            문자 퀴즈 풀기
          </NavigationCard>

        </div>
      </main>
    </div>
  )
}
