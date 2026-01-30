import { create } from 'zustand'
import type { Partner } from '@/lib/schemas/partner'

interface PartnerState {
  isPartner: boolean
  partner: Partner | null
}

interface PartnerActions {
  setPartner: (partner: Partner | null) => void
  clearPartner: () => void
}

export const usePartnerStore = create<PartnerState & PartnerActions>((set) => ({
  isPartner: false,
  partner: null,

  setPartner: (partner) => set({ partner, isPartner: !!partner }),
  clearPartner: () => set({ partner: null, isPartner: false }),
}))
