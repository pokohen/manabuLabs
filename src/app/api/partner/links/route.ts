import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreateLinkSchema, UpdateLinkSchema } from '@/lib/schemas/partner'

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
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('partner_links')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = CreateLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partner_links')
    .insert({ ...parsed.data, category_id: categoryId })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = UpdateLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id, ...updateData } = parsed.data
  const { data, error } = await supabase
    .from('partner_links')
    .update(updateData)
    .eq('id', id)
    .eq('category_id', categoryId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: '링크 ID가 필요합니다' }, { status: 400 })
  }

  const { error } = await supabase
    .from('partner_links')
    .delete()
    .eq('id', id)
    .eq('category_id', categoryId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
