'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface PresenceUser {
  user_id: string
  display_name: string
  avatar_url: string | null
}

interface PresenceIndicatorProps {
  categoryId: string
  currentUser: PresenceUser
}

export default function PresenceIndicator({ categoryId, currentUser }: PresenceIndicatorProps) {
  const [otherEditors, setOtherEditors] = useState<PresenceUser[]>([])

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const channel = supabase.channel(`category-editor:${categoryId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: PresenceUser[] = []

        for (const key of Object.keys(state)) {
          for (const presence of state[key]) {
            const p = presence as unknown as PresenceUser
            if (p.user_id !== currentUser.user_id) {
              users.push(p)
            }
          }
        }

        // 중복 제거
        const unique = users.filter(
          (u, i, arr) => arr.findIndex((a) => a.user_id === u.user_id) === i
        )
        setOtherEditors(unique)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.user_id,
            display_name: currentUser.display_name,
            avatar_url: currentUser.avatar_url,
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [categoryId, currentUser.user_id, currentUser.display_name, currentUser.avatar_url])

  if (otherEditors.length === 0) return null

  return (
    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
      <div className="flex -space-x-2">
        {otherEditors.slice(0, 5).map((editor) => (
          <div
            key={editor.user_id}
            className="w-7 h-7 rounded-full overflow-hidden border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 shrink-0"
            title={editor.display_name}
          >
            {editor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={editor.avatar_url}
                alt={editor.display_name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                {editor.display_name[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-700 dark:text-blue-400">
        {otherEditors.map((e) => e.display_name).join(', ')}님이 편집 중
      </p>
    </div>
  )
}
