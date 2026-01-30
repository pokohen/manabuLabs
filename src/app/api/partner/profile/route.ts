import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UpdateCategoryProfileSchema } from '@/lib/schemas/partner'

async function getCategoryId(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('partners')
    .select('category_id')
    .eq('user_id', user.id)
    .single()

  return data?.category_id ?? null
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 정보를 찾을 수 없습니다' }, { status: 404 })
  }

  const { data: category, error } = await supabase
    .from('partner_categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error || !category) {
    return NextResponse.json({ error: '단체 정보를 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json(category)
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = UpdateCategoryProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: category, error } = await supabase
    .from('partner_categories')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(category)
}
