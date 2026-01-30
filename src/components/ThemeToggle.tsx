'use client'

import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { SunIcon, MonitorIcon, MoonIcon } from './icons'

const options: { value: ThemeMode; Icon: React.FC<{ className?: string }>; label: string }[] = [
  { value: 'light', Icon: SunIcon, label: '라이트' },
  { value: 'auto', Icon: MonitorIcon, label: '자동' },
  { value: 'dark', Icon: MoonIcon, label: '다크' },
]

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
      {options.map((opt) => {
        const isActive = mode === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            aria-label={opt.label}
            title={opt.label}
          >
            <opt.Icon className="w-4 h-4" />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
