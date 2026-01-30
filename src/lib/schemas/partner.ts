import { z } from 'zod'

// 파트너 카테고리
export const PartnerCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sort_order: z.number(),
  created_at: z.string(),
})
export type PartnerCategory = z.infer<typeof PartnerCategorySchema>

// 파트너 프로필
export const PartnerSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  slug: z.string(),
  display_name: z.string(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  category_id: z.string().uuid().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Partner = z.infer<typeof PartnerSchema>

// 파트너 프로필 수정 요청
export const UpdatePartnerProfileSchema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요').max(50).optional(),
  bio: z.string().max(200).optional(),
  avatar_url: z.string().url().optional().nullable(),
})
export type UpdatePartnerProfile = z.infer<typeof UpdatePartnerProfileSchema>

// 파트너 링크
export const PartnerLinkSchema = z.object({
  id: z.string().uuid(),
  partner_id: z.string().uuid(),
  title: z.string(),
  url: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
})
export type PartnerLink = z.infer<typeof PartnerLinkSchema>

// 링크 추가 요청
export const CreateLinkSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  url: z.string().url('올바른 URL을 입력해주세요'),
  sort_order: z.number().int().min(0).default(0),
})
export type CreateLink = z.infer<typeof CreateLinkSchema>

// 링크 수정 요청
export const UpdateLinkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})
export type UpdateLink = z.infer<typeof UpdateLinkSchema>

// 배너
export const BannerSchema = z.object({
  id: z.string().uuid(),
  partner_id: z.string().uuid(),
  title: z.string(),
  image_url: z.string(),
  link_url: z.string(),
  position: z.enum(['home', 'drawer', 'both']),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
})
export type Banner = z.infer<typeof BannerSchema>
