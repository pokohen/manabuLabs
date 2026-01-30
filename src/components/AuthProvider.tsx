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

  // auth state 리스너 (초기 로드 + 세션 변화 감지를 onAuthStateChange 하나로 처리)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange:', event, { hasSession: !!session, userId: session?.user?.id })

        // StoreHydrator가 이미 서버 데이터를 주입한 경우 초기 fetch 스킵
        if (event === 'INITIAL_SESSION') {
          const state = useAuthStore.getState()
          if (!state.isLoading && state.user !== null) {
            console.log('[AuthProvider] INITIAL_SESSION 스킵 (StoreHydrator)')
            return
          }
          // 세션 없음 → 비로그인 상태 확정
          if (!session) {
            console.log('[AuthProvider] INITIAL_SESSION 세션 없음 → 비로그인')
            setUser(null)
            setLoading(false)
            return
          }
        }

        const user = session?.user ?? null
        setUser(user)
        setLoading(false)

        if (user) {
          await loadUserPreferences(user.id)
          await loadPartnerInfo(user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] SIGNED_OUT → 상태 초기화')
          clearPartner()
          setRole('default')
        }
      }
    )

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
    const { data, error } = await supabase
      .from('user_preferences')
      .select('theme, last_studied_menu, deleted_at, role')
      .eq('user_id', userId)
      .single()

    console.log('[AuthProvider] loadUserPreferences:', { userId, data, error })

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
      .maybeSingle()

    if (data) {
      const { partner_categories, ...partnerData } = data
      setPartner(partnerData, partner_categories ?? null)
    } else {
      setPartner(null)
    }
  }

  return null
}
