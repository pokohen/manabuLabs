import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_preferences')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (data?.role !== 'admin') return null
  return user
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('partner_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { name, description, sort_order, slug, display_name, bio, avatar_url } = await request.json()
  if (!name?.trim() || !slug?.trim() || !display_name?.trim()) {
    return NextResponse.json({ error: '카테고리 이름, 슬러그, 표시 이름은 필수입니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partner_categories')
    .insert({
      name: name.trim(),
      description: description || null,
      sort_order: sort_order ?? 0,
      slug: slug.trim(),
      display_name: display_name.trim(),
      bio: bio || null,
      avatar_url: avatar_url || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id, ...updateData } = await request.json()
  if (!id) {
    return NextResponse.json({ error: '카테고리 ID가 필요합니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partner_categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: '카테고리 ID가 필요합니다' }, { status: 400 })
  }

  // CASCADE로 파트너 삭제 → 트리거가 role을 'default'로 리셋
  const { error } = await supabase
    .from('partner_categories')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
