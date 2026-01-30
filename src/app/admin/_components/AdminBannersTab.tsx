'use client'

import { useState, useEffect, useCallback } from 'react'
import BannerEditor from '@/components/BannerEditor'
import type { CategoryItem, BannerItem } from './types'

export default function AdminBannersTab() {
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
