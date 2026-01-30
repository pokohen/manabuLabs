'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore, type UserRole } from '@/store/authStore'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { usePartnerStore } from '@/store/partnerStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { findStudyMenu } from '@/lib/study-menu'

const supabase = createBrowserSupabaseClient()

export function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setLastStudiedMenu = useAuthStore((s) => s.setLastStudiedMenu)
  const setRole = useAuthStore((s) => s.setRole)
  const setMode = useThemeStore((s) => s.setMode)
  const setPartner = usePartnerStore((s) => s.setPartner)
  const clearPartner = usePartnerStore((s) => s.clearPartner)
  const pathname = usePathname()

  // 초기 사용자 로드 + auth state 리스너
  useEffect(() => {
    const initAuth = async () => {
      // StoreHydrator가 이미 서버 데이터를 주입한 경우 초기 fetch 스킵
      const state = useAuthStore.getState()
      if (!state.isLoading && state.user !== null) {
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (user) {
        await loadUserPreferences(user.id)
        await loadPartnerInfo(user.id)
      } else {
        clearPartner()
        setRole('default')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION에서 일시적으로 session이 null일 수 있음 (토큰 갱신 중)
        // 이 경우 StoreHydrator가 이미 세팅한 role을 'default'로 덮어쓰는 것을 방지
        if (event === 'INITIAL_SESSION' && !session) {
          return
        }

        const user = session?.user ?? null
        setUser(user)
        setLoading(false)

        if (user) {
          await loadUserPreferences(user.id)
          await loadPartnerInfo(user.id)
        } else if (event === 'SIGNED_OUT') {
          clearPartner()
          setRole('default')
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
      .select('theme, last_studied_menu, deleted_at, role')
      .eq('user_id', userId)
      .single()

    // 소프트 삭제 복구: 7일 이내 재로그인 시 deleted_at 해제
    if (data?.deleted_at) {
      const deletedAt = new Date(data.deleted_at)
      const daysSince = (Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        await supabase
          .from('user_preferences')
          .update({ deleted_at: null, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      }
    }

    if (data?.theme) {
      setMode(data.theme as ThemeMode)
    }
    if (data?.last_studied_menu) {
      setLastStudiedMenu(data.last_studied_menu)
    }
    if (data?.role) {
      setRole(data.role as UserRole)
    }
  }

  async function loadPartnerInfo(userId: string) {
    const { data } = await supabase
      .from('partners')
      .select('*, partner_categories(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (data) {
      const { partner_categories, ...partnerData } = data
      setPartner(partnerData, partner_categories ?? null)
    } else {
      setPartner(null)
    }
  }

  return null
}
