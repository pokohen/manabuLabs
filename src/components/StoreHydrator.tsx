'use client'

import { useRef, useLayoutEffect } from 'react'
import { useAuthStore, type UserRole } from '@/store/authStore'
import { usePartnerStore } from '@/store/partnerStore'
import type { User } from '@supabase/supabase-js'
import type { Partner, PartnerCategory } from '@/lib/schemas/partner'

interface StoreHydratorProps {
  user: User
  role: UserRole
  lastStudiedMenu: string | null
  partner: Partner | null
  category: PartnerCategory | null
}

export function StoreHydrator({ user, role, lastStudiedMenu, partner, category }: StoreHydratorProps) {
  const hydrated = useRef(false)

  useLayoutEffect(() => {
    if (!hydrated.current) {
      useAuthStore.setState({
        user,
        role,
        lastStudiedMenu,
        isLoading: false,
      })
      usePartnerStore.setState({
        partner,
        category,
        isPartner: !!partner,
      })
      hydrated.current = true
    }
  }, [user, role, lastStudiedMenu, partner, category])

  return null
}
