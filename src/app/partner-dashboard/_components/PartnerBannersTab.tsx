'use client'

import { useState, useEffect, useCallback } from 'react'
import BannerEditor from '@/components/BannerEditor'
import type { Banner } from '@/lib/schemas/partner'

export default function PartnerBannersTab({ categoryId }: { categoryId: string }) {
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
