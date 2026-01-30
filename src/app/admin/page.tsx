'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
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
  sort_order: number
  created_at: string
}

interface PartnerItem {
  id: string
  user_id: string
  slug: string
  display_name: string
  bio: string | null
  category_id: string | null
  is_active: boolean
  created_at: string
  partner_categories?: { name: string } | null
}

interface BannerItem extends Banner {
  partners?: { display_name: string; slug: string }
}

export default function AdminDashboard() {
  const { isLoading, role } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('users')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500 dark:text-zinc-400">로딩 중...</p>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">관리자 전용 페이지</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            이 페이지는 관리자만 이용할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

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

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      setUsers(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    })
    if (res.ok) loadUsers()
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
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="default">default</option>
            <option value="admin">admin</option>
            <option value="partner">partner</option>
          </select>
        </div>
      ))}
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
    setFormSort(0)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) return

    const body = {
      name: formName.trim(),
      description: formDesc.trim() || null,
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
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="설명 (선택)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
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
            disabled={!formName.trim()}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {editingId ? '수정' : '등록'}
          </button>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{cat.name}</p>
            {cat.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{cat.description}</p>}
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
  const [formSlug, setFormSlug] = useState('')
  const [formName, setFormName] = useState('')
  const [formBio, setFormBio] = useState('')
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
    if (!formUserId.trim() || !formSlug.trim() || !formName.trim()) return

    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: formUserId.trim(),
        slug: formSlug.trim(),
        display_name: formName.trim(),
        bio: formBio.trim() || null,
        category_id: formCategoryId || null,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormUserId('')
      setFormSlug('')
      setFormName('')
      setFormBio('')
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
    if (!confirm('이 파트너를 삭제하시겠습니까? 관련 링크와 배너도 함께 삭제됩니다.')) return
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
          <input
            type="text"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="슬러그 (URL용, 예: my-partner)"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="표시 이름"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <textarea
            value={formBio}
            onChange={(e) => setFormBio(e.target.value)}
            placeholder="소개 (선택)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none resize-none"
          />
          <select
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
          >
            <option value="">카테고리 선택 (선택)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={!formUserId.trim() || !formSlug.trim() || !formName.trim()}
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
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{p.display_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                  {p.is_active ? '활성' : '비활성'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">/partner/{p.slug}</p>
              {p.partner_categories?.name && (
                <span className="inline-block text-xs px-2 py-0.5 mt-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {p.partner_categories.name}
                </span>
              )}
              {p.bio && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{p.bio}</p>}
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
  const [partners, setPartners] = useState<PartnerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formPartnerId, setFormPartnerId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formLinkUrl, setFormLinkUrl] = useState('')
  const [formPosition, setFormPosition] = useState('both')
  const [formSortOrder, setFormSortOrder] = useState(0)

  const loadData = useCallback(async () => {
    const [bannersRes, partnersRes] = await Promise.all([
      fetch('/api/admin/banners'),
      fetch('/api/admin/partners'),
    ])
    if (bannersRes.ok) setBanners(await bannersRes.json())
    if (partnersRes.ok) setPartners(await partnersRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!formPartnerId || !formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()) return

    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_id: formPartnerId,
        title: formTitle.trim(),
        image_url: formImageUrl.trim(),
        link_url: formLinkUrl.trim(),
        position: formPosition,
        sort_order: formSortOrder,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormPartnerId('')
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
            value={formPartnerId}
            onChange={(e) => setFormPartnerId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm cursor-pointer focus:outline-none"
          >
            <option value="">파트너 선택</option>
            {partners.filter((p) => p.is_active).map((p) => (
              <option key={p.id} value={p.id}>{p.display_name} ({p.slug})</option>
            ))}
          </select>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="배너 제목"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
          <input
            type="url"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            placeholder="이미지 URL"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
          />
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
            disabled={!formPartnerId || !formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()}
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
                파트너: {b.partners?.display_name ?? '-'}
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
