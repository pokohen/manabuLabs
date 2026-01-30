import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    .from('banners')
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

  const { title, image_url, link_url, position, sort_order } = await request.json()
  if (!title?.trim() || !image_url?.trim() || !link_url?.trim()) {
    return NextResponse.json({ error: '제목, 이미지 URL, 링크 URL은 필수입니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('banners')
    .insert({
      category_id: categoryId,
      title: title.trim(),
      image_url: image_url.trim(),
      link_url: link_url.trim(),
      position: position || 'both',
      sort_order: sort_order ?? 0,
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
  const categoryId = await getCategoryId(supabase)
  if (!categoryId) {
    return NextResponse.json({ error: '파트너 권한이 없습니다' }, { status: 403 })
  }

  const { id, ...updateData } = await request.json()
  if (!id) {
    return NextResponse.json({ error: '배너 ID가 필요합니다' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('banners')
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
    return NextResponse.json({ error: '배너 ID가 필요합니다' }, { status: 400 })
  }

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)
    .eq('category_id', categoryId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
