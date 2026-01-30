import { create } from 'zustand'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

async function syncThemeToDB(mode: ThemeMode) {
  try {
    const supabase = createBrowserSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('user_preferences')
      .upsert(
        { user_id: user.id, theme: mode, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
  } catch {
    // DB 동기화 실패 시 무시 (localStorage가 기본)
  }
}

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  mode: 'auto',
  resolvedTheme: 'light',

  setMode: (mode) => {
    const resolved = mode === 'auto' ? getSystemTheme() : mode
    applyTheme(resolved)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', mode)
    }
    set({ mode, resolvedTheme: resolved })
    syncThemeToDB(mode)
  },

  setResolvedTheme: (theme) => {
    applyTheme(theme)
    set({ resolvedTheme: theme })
  },
}))
