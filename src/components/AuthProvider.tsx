'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { findStudyMenu } from '@/lib/study-menu'

const supabase = createBrowserSupabaseClient()

export function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setLastStudiedMenu = useAuthStore((s) => s.setLastStudiedMenu)
  const setMode = useThemeStore((s) => s.setMode)
  const pathname = usePathname()

  // 초기 사용자 로드 + auth state 리스너
  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (user) {
        await loadUserPreferences(user.id)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null
        setUser(user)
        setLoading(false)

        if (user) {
          await loadUserPreferences(user.id)
        }
      }
    )

    initAuth()

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // pathname 변경 시 last_studied_menu 저장
  useEffect(() => {
    const user = useAuthStore.getState().user
    if (!user) return

    const menu = findStudyMenu(pathname)
    if (menu) {
      setLastStudiedMenu(menu.path)
      supabase
        .from('user_preferences')
        .upsert(
          { user_id: user.id, last_studied_menu: menu.path, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .then()
    }
  }, [pathname, setLastStudiedMenu])

  async function loadUserPreferences(userId: string) {
    const { data } = await supabase
      .from('user_preferences')
      .select('theme, last_studied_menu')
      .eq('user_id', userId)
      .single()

    if (data?.theme) {
      setMode(data.theme as ThemeMode)
    }
    if (data?.last_studied_menu) {
      setLastStudiedMenu(data.last_studied_menu)
    }
  }

  return null
}
