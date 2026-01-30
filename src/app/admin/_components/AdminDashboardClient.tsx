'use client'

import { useState, useEffect, useCallback } from 'react'
import BannerEditor from '@/components/BannerEditor'
import type { Banner } from '@/lib/schemas/partner'

type Tab = 'users' | 'categories' | 'partners' | 'banners'

interface UserItem {
  user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

interface CategoryItem {
  id: string
  name: string
  description: string | null
  slug: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface PartnerItem {
  id: string
  user_id: string
  category_id: string
  is_active: boolean
  created_at: string
  partner_categories?: { name: string; slug: string; display_name: string } | null
}

interface BannerItem extends Banner {
  partner_categories?: { display_name: string; slug: string }
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<Tab>('users')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'users', label: '회원' },
    { key: 'categories', label: '카테고리' },
    { key: 'partners', label: '파트너' },
    { key: 'banners', label: '배너' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">관리자 대시보드</h1>

        <div className="flex gap-1 mb-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'partners' && <PartnersTab />}
        {activeTab === 'banners' && <BannersTab />}
      </div>
    </div>
  )
}

// ========== 회원 관리 탭 ==========
function UsersTab() {
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

// ========== 멤버 편집 모달 ==========
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

  // role이 바뀔 때 partner 필드 초기화
  useEffect(() => {
    if (role === 'partner' && !existingPartner) {
      setCategoryId('')
    }
  }, [role, existingPartner])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    // 1. role 변경
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

    // 2. partner role인 경우 파트너 레코드 생성 또는 업데이트
    if (role === 'partner') {
      if (!categoryId) {
        setError('카테고리를 선택해주세요.')
        setSaving(false)
        return
      }

      if (existingPartner) {
        // 기존 파트너 → 카테고리만 업데이트
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
        // 새 파트너 생성 (user_id + category_id만 필요)
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
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/50" />

      {/* 모달 */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
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

        {/* 본문 */}
        <div className="p-5 space-y-5">
          {/* 사용자 정보 */}
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

          {/* 역할 선택 */}
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

          {/* 파트너 추가 필드 */}
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

        {/* 푸터 */}
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

// ========== 카테고리 관리 탭 ==========
function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDisplayName, setFormDisplayName] = useState('')
  const [formBio, setFormBio] = useState('')
  const [formSort, setFormSort] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories')
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormSlug('')
    setFormDisplayName('')
    setFormBio('')
    setFormSort(0)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formSlug.trim() || !formDisplayName.trim()) return

    const body = {
      name: formName.trim(),
      description: formDesc.trim() || null,
      slug: formSlug.trim(),
      display_name: formDisplayName.trim(),
      bio: formBio.trim() || null,
      sort_order: formSort,
      ...(editingId ? { id: editingId } : {}),
    }

    const res = await fetch('/api/admin/categories', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      resetForm()
      loadCategories()
    } else {
      const err = await res.json()
      alert(err.error || '저장 실패')
    }
  }

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormDesc(cat.description ?? '')
    setFormSlug(cat.slug)
    setFormDisplayName(cat.display_name)
    setFormBio(cat.bio ?? '')
    setFormSort(cat.sort_order)
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n\n이 카테고리에 속한 모든 파트너가 삭제되고, 해당 회원은 일반 고객으로 변경됩니다.`)) return
    await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadCategories()
  }

  if (loading) return <p className="text-zinc-500 text-sm">로딩 중...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">총 {categories.length}개의 카테고리</p>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true) }}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
        >
          {showForm ? '취소' : '카테고리 추가'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            {editingId ? '카테고리 수정' : '새 카테고리'}
          </h3>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="카테고리 이름"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <input
            type="text"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="슬러그 (URL용, 예: my-org)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <input
            type="text"
            value={formDisplayName}
            onChange={(e) => setFormDisplayName(e.target.value)}
            placeholder="표시 이름"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <input
            type="text"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="설명 (선택)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <textarea
            value={formBio}
            onChange={(e) => setFormBio(e.target.value)}
            placeholder="소개 (선택)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none resize-none"
          />
          <div className="w-24">
            <label className="block text-xs text-zinc-500 mb-1">순서</label>
            <input
              type="number"
              value={formSort}
              onChange={(e) => setFormSort(Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!formName.trim() || !formSlug.trim() || !formDisplayName.trim()}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {editingId ? '수정' : '등록'}
          </button>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{cat.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                {cat.is_active ? '활성' : '비활성'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {cat.display_name} &middot; /partner/{cat.slug}
            </p>
            {cat.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{cat.description}</p>}
            {cat.bio && <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{cat.bio}</p>}
            <p className="text-xs text-zinc-400 dark:text-zinc-600">순서: {cat.sort_order}</p>
          </div>
          <div className="flex gap-2 shrink-0 ml-3">
            <button onClick={() => startEdit(cat)} className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
              수정
            </button>
            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ========== 파트너 관리 탭 ==========
function PartnersTab() {
  const [partners, setPartners] = useState<PartnerItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formUserId, setFormUserId] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')

  const loadPartners = useCallback(async () => {
    const [partnersRes, catsRes] = await Promise.all([
      fetch('/api/admin/partners'),
      fetch('/api/admin/categories'),
    ])
    if (partnersRes.ok) setPartners(await partnersRes.json())
    if (catsRes.ok) setCategories(await catsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadPartners() }, [loadPartners])

  const handleCreate = async () => {
    if (!formUserId.trim() || !formCategoryId) return

    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: formUserId.trim(),
        category_id: formCategoryId,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormUserId('')
      setFormCategoryId('')
      loadPartners()
    } else {
      const err = await res.json()
      alert(err.error || '생성 실패')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch('/api/admin/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentActive }),
    })
    loadPartners()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 파트너를 삭제하시겠습니까?')) return
    await fetch('/api/admin/partners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadPartners()
  }

  if (loading) return <p className="text-zinc-500 text-sm">로딩 중...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          총 {partners.length}개의 파트너
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
        >
          {showForm ? '취소' : '파트너 추가'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">새 파트너 등록</h3>
          <input
            type="text"
            value={formUserId}
            onChange={(e) => setFormUserId(e.target.value)}
            placeholder="User ID (UUID)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <select
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
          >
            <option value="">카테고리 선택 (필수)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.display_name})</option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={!formUserId.trim() || !formCategoryId}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            등록
          </button>
        </div>
      )}

      {partners.map((p) => (
        <div key={p.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {p.partner_categories?.display_name ?? '(단체 없음)'}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                  {p.is_active ? '활성' : '비활성'}
                </span>
              </div>
              {p.partner_categories?.slug && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">/partner/{p.partner_categories.slug}</p>
              )}
              {p.partner_categories?.name && (
                <span className="inline-block text-xs px-2 py-0.5 mt-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {p.partner_categories.name}
                </span>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">User: {p.user_id}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              <button
                onClick={() => handleToggleActive(p.id, p.is_active)}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                {p.is_active ? '비활성화' : '활성화'}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ========== 배너 관리 탭 ==========
function BannersTab() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formLinkUrl, setFormLinkUrl] = useState('')
  const [formPosition, setFormPosition] = useState('both')
  const [formSortOrder, setFormSortOrder] = useState(0)
  const [showEditor, setShowEditor] = useState(false)

  const loadData = useCallback(async () => {
    const [bannersRes, catsRes] = await Promise.all([
      fetch('/api/admin/banners'),
      fetch('/api/admin/categories'),
    ])
    if (bannersRes.ok) setBanners(await bannersRes.json())
    if (catsRes.ok) setCategories(await catsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!formCategoryId || !formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()) return

    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: formCategoryId,
        title: formTitle.trim(),
        image_url: formImageUrl.trim(),
        link_url: formLinkUrl.trim(),
        position: formPosition,
        sort_order: formSortOrder,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setShowEditor(false)
      setFormCategoryId('')
      setFormTitle('')
      setFormImageUrl('')
      setFormLinkUrl('')
      setFormPosition('both')
      setFormSortOrder(0)
      loadData()
    } else {
      const err = await res.json()
      alert(err.error || '생성 실패')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentActive }),
    })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return
    await fetch('/api/admin/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadData()
  }

  const positionLabel = (pos: string) => {
    if (pos === 'both') return '홈 + 서랍'
    if (pos === 'home') return '홈'
    return '서랍'
  }

  if (loading) return <p className="text-zinc-500 text-sm">로딩 중...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          총 {banners.length}개의 배너
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
        >
          {showForm ? '취소' : '배너 추가'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">새 배너 등록</h3>
          <select
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
          >
            <option value="">카테고리 선택</option>
            {categories.filter((c) => c.is_active).map((c) => (
              <option key={c.id} value={c.id}>{c.display_name} ({c.slug})</option>
            ))}
          </select>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="배너 제목"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          {/* 배너 이미지 에디터 */}
          {formImageUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">배너 이미지:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formImageUrl}
                alt="배너 미리보기"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
                style={{ aspectRatio: '800/300', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => { setFormImageUrl(''); setShowEditor(true) }}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                이미지 변경
              </button>
            </div>
          ) : showEditor && formCategoryId ? (
            <BannerEditor
              categoryId={formCategoryId}
              onUploadComplete={(url) => { setFormImageUrl(url); setShowEditor(false) }}
              onCancel={() => setShowEditor(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!formCategoryId) { alert('카테고리를 먼저 선택하세요'); return }
                setShowEditor(true)
              }}
              className="w-full px-3 py-4 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-colors"
            >
              이미지 에디터 열기
            </button>
          )}
          <input
            type="text"
            value={formLinkUrl}
            onChange={(e) => setFormLinkUrl(e.target.value)}
            placeholder="클릭 시 이동 URL (예: /partner/slug)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">위치</label>
              <select
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
              >
                <option value="both">홈 + 서랍</option>
                <option value="home">홈</option>
                <option value="drawer">서랍</option>
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs text-zinc-500 mb-1">순서</label>
              <input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!formCategoryId || !formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            등록
          </button>
        </div>
      )}

      {banners.map((b) => (
        <div key={b.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image_url}
              alt={b.title}
              className="w-32 h-20 object-cover rounded-lg shrink-0 bg-zinc-200 dark:bg-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{b.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${b.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                  {b.is_active ? '활성' : '비활성'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                단체: {b.partner_categories?.display_name ?? '-'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">위치: {positionLabel(b.position)}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate">링크: {b.link_url}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleToggleActive(b.id, b.is_active)}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  {b.is_active ? '비활성화' : '활성화'}
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
