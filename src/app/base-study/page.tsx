'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'

type ViewMode = 'menu' | 'example-sentence'

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          일본어 공부 앱
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          히라가나 / 가타카나 공부와 예시 문장 생성을 통해 일본어 실력을 향상시키세요!
        </p>

        <div className="w-full max-w-md space-y-4 mt-8">

          <Button
            onClick={() => router.push('/monji-study')}
            className="w-full py-6 px-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            히라가나 / 가타카나 공부
          </Button>

          <Button
            onClick={() => router.push('/quiz-setup')}
            className="w-full py-6 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            히라가나 / 가타카나 퀴즈
          </Button>

        </div>
      </main>
    </div>
  )
}