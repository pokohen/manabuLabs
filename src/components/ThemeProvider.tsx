'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function ThemeProvider() {
  const setMode = useThemeStore((s) => s.setMode)
  const setResolvedTheme = useThemeStore((s) => s.setResolvedTheme)

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null
    setMode(stored ?? 'auto')
  }, [setMode])

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (useThemeStore.getState().mode === 'auto') {
        const resolved = e.matches ? 'dark' : 'light'
        setResolvedTheme(resolved)
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setResolvedTheme])

  return null
}
