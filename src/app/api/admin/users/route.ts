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

  // admin_list_users() DB 함수 호출
  const { data, error } = await supabase.rpc('admin_list_users')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const admin = await verifyAdmin(supabase)
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const { user_id, role } = await request.json()
  if (!user_id || !['default', 'admin', 'partner'].includes(role)) {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_preferences')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
