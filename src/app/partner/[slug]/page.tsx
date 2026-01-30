import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: category } = await supabase
    .from('partner_categories')
    .select('display_name, bio')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return { title: '파트너를 찾을 수 없습니다' }
  }

  return {
    title: `${category.display_name} | MANABU LABS`,
    description: category.bio || `${category.display_name}의 파트너 페이지`,
  }
}

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: category } = await supabase
    .from('partner_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  const { data: links } = await supabase
    .from('partner_links')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <main className="flex w-full max-w-md flex-col items-center gap-6 py-16 px-4">
        {/* 아바타 */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800">
          {category.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.avatar_url}
              alt={category.display_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500 dark:text-zinc-400">
              {category.display_name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {category.display_name}
        </h1>

        {/* 소개 */}
        {category.bio && (
          <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            {category.bio}
          </p>
        )}

        {/* 링크 목록 */}
        {links && links.length > 0 && (
          <div className="w-full flex flex-col gap-3 mt-4">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-[1.02] transition-all shadow-sm"
              >
                {link.title}
              </a>
            ))}
          </div>
        )}

        {/* 푸터 */}
        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-600">
          Powered by MANABU LABS
        </p>
      </main>
    </div>
  )
}
