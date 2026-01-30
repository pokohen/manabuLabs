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

  // 관리자는 비활성 포함 전체 파트너 조회 (카테고리 조인)
  const { data, error } = await supabase
    .from('partners')
    .select('*, partner_categories(name, slug, display_name)')
    .order('created_at', { ascending: false })

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

  const { user_id, category_id } = await request.json()
  if (!user_id || !category_id) {
    return NextResponse.json({ error: 'user_id와 category_id는 필수입니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partners')
    .insert({ user_id, category_id })
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
    return NextResponse.json({ error: '파트너 ID가 필요합니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partners')
    .update({ ...updateData, updated_at: new Date().toISOString() })
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
    return NextResponse.json({ error: '파트너 ID가 필요합니다' }, { status: 400 })
  }

  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
