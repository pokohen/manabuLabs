'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePartnerStore } from '@/store/partnerStore'
import { useAuthStore } from '@/store/authStore'
import BannerEditor from '@/components/BannerEditor'
import PresenceIndicator from '@/components/PresenceIndicator'
import type { Partner, PartnerCategory, PartnerLink, Banner } from '@/lib/schemas/partner'

type Tab = 'profile' | 'links' | 'banners'

interface Props {
  partner: Partner
  category: PartnerCategory
}

export default function PartnerDashboardClient({ partner: initialPartner, category: initialCategory }: Props) {
  const storePartner = usePartnerStore((s) => s.partner)
  const storeCategory = usePartnerStore((s) => s.category)
  const partner = storePartner ?? initialPartner
  const category = storeCategory ?? initialCategory
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: '프로필' },
    { key: 'links', label: '링크 관리' },
    { key: 'banners', label: '배너' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">파트너 대시보드</h1>

        {/* Presence Indicator */}
        {user && (
          <PresenceIndicator
            categoryId={category.id}
            currentUser={{
              user_id: user.id,
              display_name: user.user_metadata?.display_name ?? user.email ?? '',
              avatar_url: user.user_metadata?.avatar_url ?? null,
            }}
          />
        )}

        {/* 탭 */}
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

        {activeTab === 'profile' && <ProfileTab category={category} />}
        {activeTab === 'links' && <LinksTab categoryId={category.id} />}
        {activeTab === 'banners' && <BannersTab categoryId={category.id} />}
      </div>
    </div>
  )
}

// 프로필 탭
function ProfileTab({ category }: { category: PartnerCategory }) {
  const setCategory = usePartnerStore((s) => s.setCategory)
  const [displayName, setDisplayName] = useState(category.display_name)
  const [bio, setBio] = useState(category.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/partner/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, bio: bio || null }),
    })

    if (res.ok) {
      const updated = await res.json()
      setCategory(updated)
      setMessage('저장되었습니다')
    } else {
      setMessage('저장에 실패했습니다')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          표시 이름
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          소개
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none resize-none"
        />
        <p className="text-xs text-zinc-500 mt-1">{bio.length}/200</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          슬러그
        </label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          /partner/{category.slug}
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {saving ? '저장 중...' : '저장'}
      </button>

      {message && (
        <p className={`text-sm ${message.includes('실패') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

// 링크 관리 탭
function LinksTab({ categoryId }: { categoryId: string }) {
  const [links, setLinks] = useState<PartnerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editSortOrder, setEditSortOrder] = useState(0)

  const loadLinks = useCallback(async () => {
    const res = await fetch('/api/partner/links')
    if (res.ok) {
      const data = await res.json()
      setLinks(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return

    const res = await fetch('/api/partner/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        url: newUrl.trim(),
        sort_order: links.length,
      }),
    })

    if (res.ok) {
      setNewTitle('')
      setNewUrl('')
      loadLinks()
    }
  }

  const handleUpdate = async (id: string) => {
    const res = await fetch('/api/partner/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        title: editTitle,
        url: editUrl,
        sort_order: editSortOrder,
      }),
    })

    if (res.ok) {
      setEditingId(null)
      loadLinks()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 링크를 삭제하시겠습니까?')) return

    const res = await fetch('/api/partner/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      loadLinks()
    }
  }

  const startEdit = (link: PartnerLink) => {
    setEditingId(link.id)
    setEditTitle(link.title)
    setEditUrl(link.url)
    setEditSortOrder(link.sort_order)
  }

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400 text-sm">로딩 중...</p>
  }

  return (
    <div className="space-y-6">
      {/* 새 링크 추가 */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">새 링크 추가</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="링크 제목"
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
        />
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim() || !newUrl.trim()}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          추가
        </button>
      </div>

      {/* 링크 목록 */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
            등록된 링크가 없습니다
          </p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              {editingId === link.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                  />
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">순서:</label>
                    <input
                      type="number"
                      value={editSortOrder}
                      onChange={(e) => setEditSortOrder(Number(e.target.value))}
                      min={0}
                      className="w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(link.id)}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-lg hover:opacity-90 cursor-pointer"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{link.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{link.url}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">순서: {link.sort_order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => startEdit(link)}
                      className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 배너 관리 탭
function BannersTab({ categoryId }: { categoryId: string }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formLinkUrl, setFormLinkUrl] = useState('')
  const [formPosition, setFormPosition] = useState('both')
  const [formSortOrder, setFormSortOrder] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const loadBanners = useCallback(async () => {
    const res = await fetch('/api/partner/banners')
    if (res.ok) {
      setBanners(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadBanners() }, [loadBanners])

  const resetForm = () => {
    setFormTitle('')
    setFormImageUrl('')
    setFormLinkUrl('')
    setFormPosition('both')
    setFormSortOrder(0)
    setEditingId(null)
    setShowForm(false)
    setShowEditor(false)
  }

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()) return

    const body = {
      title: formTitle.trim(),
      image_url: formImageUrl.trim(),
      link_url: formLinkUrl.trim(),
      position: formPosition,
      sort_order: formSortOrder,
      ...(editingId ? { id: editingId } : {}),
    }

    const res = await fetch('/api/partner/banners', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      resetForm()
      loadBanners()
    } else {
      const err = await res.json()
      alert(err.error || '저장 실패')
    }
  }

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setFormTitle(banner.title)
    setFormImageUrl(banner.image_url)
    setFormLinkUrl(banner.link_url)
    setFormPosition(banner.position)
    setFormSortOrder(banner.sort_order)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return
    const res = await fetch('/api/partner/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) loadBanners()
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch('/api/partner/banners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentActive }),
    })
    loadBanners()
  }

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400 text-sm">로딩 중...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          내 배너 {banners.length}개
        </p>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true) }}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
        >
          {showForm ? '취소' : '배너 추가'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            {editingId ? '배너 수정' : '새 배너 등록'}
          </h3>
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
          ) : showEditor ? (
            <BannerEditor
              categoryId={categoryId}
              onUploadComplete={(url) => { setFormImageUrl(url); setShowEditor(false) }}
              onCancel={() => setShowEditor(false)}
              initialImageUrl={editingId ? formImageUrl || undefined : undefined}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowEditor(true)}
              className="w-full px-3 py-4 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-colors"
            >
              이미지 에디터 열기
            </button>
          )}
          <input
            type="text"
            value={formLinkUrl}
            onChange={(e) => setFormLinkUrl(e.target.value)}
            placeholder="클릭 시 이동 URL"
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
            onClick={handleSubmit}
            disabled={!formTitle.trim() || !formImageUrl.trim() || !formLinkUrl.trim()}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {editingId ? '수정' : '등록'}
          </button>
        </div>
      )}

      {banners.length === 0 && !showForm ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
          등록된 배너가 없습니다
        </p>
      ) : (
        banners.map((banner) => (
          <div key={banner.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-28 h-20 object-cover rounded-lg shrink-0 bg-zinc-200 dark:bg-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{banner.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${banner.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                    {banner.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  위치: {banner.position === 'both' ? '홈 + 서랍' : banner.position === 'home' ? '홈' : '서랍'}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate">링크: {banner.link_url}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => startEdit(banner)}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleToggleActive(banner.id, banner.is_active)}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    {banner.is_active ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
