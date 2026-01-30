import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'default' | 'admin' | 'partner'

interface AuthState {
  user: User | null
  isLoading: boolean
  lastStudiedMenu: string | null
  role: UserRole
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setLastStudiedMenu: (menu: string | null) => void
  setRole: (role: UserRole) => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: true,
  lastStudiedMenu: null,
  role: 'default',

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastStudiedMenu: (lastStudiedMenu) => set({ lastStudiedMenu }),
  setRole: (role) => set({ role }),
}))
