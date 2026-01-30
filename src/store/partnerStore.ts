import { create } from 'zustand'
import type { Partner, PartnerCategory } from '@/lib/schemas/partner'

interface PartnerState {
  isPartner: boolean
  partner: Partner | null
  category: PartnerCategory | null
}

interface PartnerActions {
  setPartner: (partner: Partner | null, category?: PartnerCategory | null) => void
  setCategory: (category: PartnerCategory | null) => void
  clearPartner: () => void
}

export const usePartnerStore = create<PartnerState & PartnerActions>((set) => ({
  isPartner: false,
  partner: null,
  category: null,

  setPartner: (partner, category) => set({
    partner,
    isPartner: !!partner,
    ...(category !== undefined ? { category } : {}),
  }),
  setCategory: (category) => set({ category }),
  clearPartner: () => set({ partner: null, category: null, isPartner: false }),
}))
