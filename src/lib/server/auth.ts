import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/store/authStore'
import type { Partner, PartnerCategory } from '@/lib/schemas/partner'

export interface ServerAuthData {
  user: User
  role: UserRole
  lastStudiedMenu: string | null
  partner: Partner | null
  category: PartnerCategory | null
}

export async function getServerAuthData(currentPath: string): Promise<ServerAuthData> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
  }

  const [prefsResult, partnerResult] = await Promise.all([
    supabase
      .from('user_preferences')
      .select('role, last_studied_menu')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('partners')
      .select('*, partner_categories(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
  ])

  const role = (prefsResult.data?.role as UserRole) ?? 'default'
  const lastStudiedMenu = prefsResult.data?.last_studied_menu ?? null

  let partner: Partner | null = null
  let category: PartnerCategory | null = null

  if (partnerResult.data) {
    const { partner_categories, ...partnerData } = partnerResult.data
    partner = partnerData
    category = partner_categories ?? null
  }

  return { user, role, lastStudiedMenu, partner, category }
}
