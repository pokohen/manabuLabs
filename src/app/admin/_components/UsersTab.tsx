'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserItem, CategoryItem, PartnerItem } from './types'

export default function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      setUsers(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const roleLabel = (role: string) => {
    if (role === 'admin') return '관리자'
    if (role === 'partner') return '파트너'
    return '일반'
  }

  const roleBadgeClass = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (role === 'partner') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
  }

  if (loading) return <p className="text-zinc-500 text-sm">로딩 중...</p>

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        총 {users.length}명의 회원
      </p>
      {users.map((u) => (
        <div key={u.user_id} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-200 dark:bg-zinc-700">
            {u.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                {(u.display_name ?? u.email ?? '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
              {u.display_name || '(이름 없음)'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.email}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${roleBadgeClass(u.role)}`}>
            {roleLabel(u.role)}
          </span>
          <button
            onClick={() => setEditingUser(u)}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer shrink-0"
          >
            편집
          </button>
        </div>
      ))}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); loadUsers() }}
        />
      )}
    </div>
  )
}

function UserEditModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserItem
  onClose: () => void
  onSaved: () => void
}) {
  const [role, setRole] = useState(user.role)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [existingPartner, setExistingPartner] = useState<PartnerItem | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [catsRes, partnersRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/partners'),
      ])

      if (catsRes.ok) {
        const cats: CategoryItem[] = await catsRes.json()
        setCategories(cats)
      }

      if (partnersRes.ok) {
        const partners: PartnerItem[] = await partnersRes.json()
        const found = partners.find((p) => p.user_id === user.user_id) ?? null
        setExistingPartner(found)
        if (found) {
          setCategoryId(found.category_id ?? '')
        }
      }

      setLoadingData(false)
    }

    load()
  }, [user.user_id])

  useEffect(() => {
    if (role === 'partner' && !existingPartner) {
      setCategoryId('')
    }
  }, [role, existingPartner])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const roleRes = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, role }),
    })

    if (!roleRes.ok) {
      setError('역할 변경에 실패했습니다.')
      setSaving(false)
      return
    }

    if (role === 'partner') {
      if (!categoryId) {
        setError('카테고리를 선택해주세요.')
        setSaving(false)
        return
      }

      if (existingPartner) {
        const patchRes = await fetch('/api/admin/partners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingPartner.id,
            category_id: categoryId,
          }),
        })
        if (!patchRes.ok) {
          setError('파트너 정보 업데이트에 실패했습니다.')
          setSaving(false)
          return
        }
      } else {
        const createRes = await fetch('/api/admin/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.user_id,
            category_id: categoryId,
          }),
        })
        if (!createRes.ok) {
          const err = await createRes.json()
          setError(err.error || '파트너 생성에 실패했습니다.')
          setSaving(false)
          return
        }
      }
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">멤버 편집</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-200 dark:bg-zinc-700">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-500">
                  {(user.display_name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {user.display_name || '(이름 없음)'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              역할
            </label>
            <div className="flex gap-2">
              {(['default', 'partner', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                    role === r
                      ? r === 'admin'
                        ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : r === 'partner'
                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'border-zinc-400 bg-zinc-100 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {r === 'admin' ? '관리자' : r === 'partner' ? '파트너' : '일반'}
                </button>
              ))}
            </div>
          </div>

          {role === 'partner' && (
            loadingData ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">불러오는 중...</p>
            ) : (
              <div className="space-y-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {existingPartner ? '파트너 정보 수정' : '새 파트너 등록'}
                </p>

                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">카테고리 (필수)</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.display_name})</option>
                    ))}
                  </select>
                </div>
              </div>
            )
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (role === 'partner' && !categoryId)}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
