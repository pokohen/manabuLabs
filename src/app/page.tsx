'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import Logo from '@/components/Logo'
import BannerCarousel from '@/components/BannerCarousel'
import { useAuthStore } from '@/store/authStore'
import { findStudyMenu } from '@/lib/study-menu'

export default function Home() {
  const router = useRouter()
  const { user, lastStudiedMenu } = useAuthStore()
  const menu = lastStudiedMenu ? findStudyMenu(lastStudiedMenu) : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <Logo size="lg" className="mb-2" />
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          히라가나 / 가타카나 공부와<br />예시 문장 생성을 통해<br />일본어 실력을 향상시키세요!
        </p>

        {user && menu && (
          <button
            onClick={() => router.push(menu.path)}
            className="w-full max-w-md flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
              {"📖"}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">최근 학습</p>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{menu.label}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{menu.description}</p>
            </div>
            <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <BannerCarousel position="home" />

        <div className="w-full max-w-md gap-4 mt-8 grid grid-cols-2">

          <Button
            onClick={() => router.push('/base-study')}
            className="w-full py-6 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            히라가나<br />가타카나
          </Button>

          <Button
            onClick={() => router.push('/grammar-study')}
            className="w-full py-6 px-6 bg-gradient-to-r from-yellow-500 to-lime-600 hover:from-yellow-600 hover:to-lime-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            문법 공부
          </Button>

          <Button
            onClick={() => router.push('/kanji-study')}
            className="w-full py-6 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            한자 공부<br />(beta)
          </Button>

          <Button
            onClick={() => router.push('/word-sentence')}
            className="w-full py-6 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            예시 문장 보기
          </Button>
        </div>
      </main>
    </div>
  )
}
