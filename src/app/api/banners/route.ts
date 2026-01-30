import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get('position')

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (position === 'home') {
    query = query.in('position', ['home', 'both'])
  } else if (position === 'drawer') {
    query = query.in('position', ['drawer', 'both'])
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
