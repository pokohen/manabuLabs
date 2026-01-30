import type { Banner } from '@/lib/schemas/partner'

export interface UserItem {
  user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

export interface CategoryItem {
  id: string
  name: string
  description: string | null
  slug: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PartnerItem {
  id: string
  user_id: string
  category_id: string
  is_active: boolean
  created_at: string
  partner_categories?: { name: string; slug: string; display_name: string } | null
}

export interface BannerItem extends Banner {
  partner_categories?: { display_name: string; slug: string }
}
