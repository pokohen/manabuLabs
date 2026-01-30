'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createBrowserSupabaseClient()

export default function ProfileClient({ user: initialUser }: { user: User }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user) ?? initialUser

  const [displayName, setDisplayName] = useState(user.user_metadata?.full_name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      })

      const json = await res.json()

      if (!res.ok) {
        setSaveMessage({ type: 'error', text: json.error || '이름 변경에 실패했습니다.' })
      } else {
        setSaveMessage({ type: 'success', text: '이름이 변경되었습니다.' })
        if (json.user) useAuthStore.getState().setUser(json.user)
      }
    } catch {
      setSaveMessage({ type: 'error', text: '이름 변경에 실패했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== '회원탈퇴') return
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { user_id: user.id, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )

      if (error) {
        setSaveMessage({ type: 'error', text: '회원 탈퇴에 실패했습니다.' })
        return
      }

      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ])
      useAuthStore.getState().setUser(null)
      router.replace('/')
    } catch {
      setSaveMessage({ type: 'error', text: '회원 탈퇴에 실패했습니다.' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-2xl font-bold text-black dark:text-white text-center">프로필 설정</h1>

        {/* 프로필 정보 */}
        <div className="space-y-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* 아바타 + 이메일 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shrink-0">
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt="프로필"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-lg font-bold text-white">
                  {(user.user_metadata?.full_name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* 이름 변경 */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              표시 이름
            </label>
            <div className="flex gap-2">
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 p-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="이름 입력"
              />
              <Button
                onClick={handleSaveName}
                disabled={!displayName.trim() || displayName.trim() === (user.user_metadata?.full_name ?? '')}
                isLoading={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm"
              >
                저장
              </Button>
            </div>
          </div>

          {saveMessage && (
            <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {saveMessage.text}
            </p>
          )}
        </div>

        {/* 회원 탈퇴 */}
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900/50">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">회원 탈퇴</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            탈퇴 요청 후 7일 이내에 다시 로그인하면 탈퇴가 취소됩니다.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            7일이 지나면 계정 및 모든 데이터가 영구 삭제됩니다.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              회원 탈퇴하기
            </button>
          ) : (
            <div className="space-y-3 pt-2 border-t border-red-100 dark:border-red-900/30">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                확인을 위해 &quot;회원탈퇴&quot;를 입력해 주세요.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full p-2.5 border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="회원탈퇴"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  취소
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== '회원탈퇴' || isDeleting}
                  className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer px-2"
                >
                  {isDeleting ? '처리 중...' : '탈퇴 확인'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
