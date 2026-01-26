'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 아이콘 컴포넌트들
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function HiraganaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="16" fontWeight="bold">あ</text>
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function KanjiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="14" fontWeight="bold">漢</text>
    </svg>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}

// 햄버거 메뉴 아이콘 (애니메이션)
function MenuIcon({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <div className={`${className} relative`}>
      <span
        className={`absolute left-0 h-0.5 w-full bg-current rounded transition-all duration-300 ease-out ${
          isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-1'
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-current rounded transition-all duration-300 ease-out ${
          isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
        }`}
      />
      <span
        className={`absolute left-0 h-0.5 w-full bg-current rounded transition-all duration-300 ease-out ${
          isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-1'
        }`}
      />
    </div>
  )
}

const navItems = [
  { href: '/', label: '홈', Icon: HomeIcon },
  { href: '/base-study', label: '히라가나/가타카나', Icon: HiraganaIcon },
  { href: '/grammar-study', label: '문법', Icon: BookIcon },
  { href: '/kanji-study', label: '한자', Icon: KanjiIcon },
  { href: '/word-sentence', label: '예문', Icon: ChatIcon },
]

export default function Header() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // 서랍 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
            >
              <MenuIcon isOpen={isDrawerOpen} className="w-6 h-6" />
            </button>

            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">🇯🇵</span>
              <span className="font-bold text-lg text-zinc-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                일본어 공부
              </span>
            </Link>

            {/* 빈 공간 (균형용) */}
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* 오버레이 */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 서랍 메뉴 */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 서랍 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-2 group cursor-pointer">
            <span
              className="text-2xl transition-transform duration-500"
              style={{ animation: isDrawerOpen ? 'bounceIn 0.5s ease-out' : 'none' }}
            >
              🇯🇵
            </span>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">
              일본어 공부
            </span>
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:rotate-90 transition-all duration-300 active:scale-90 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="p-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => {
              const Icon = item.Icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    animation: isDrawerOpen ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                  }}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white/20 dark:bg-zinc-900/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 group-hover:scale-110'
                  }`}>
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${
                      active ? '' : 'group-hover:scale-110'
                    }`} />
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 서랍 하단 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            일본어 학습 앱 v1.0
          </p>
        </div>
      </div>
    </>
  )
}
