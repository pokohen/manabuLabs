'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CategoryItem, PartnerItem } from './types'

export default function PartnersTab() {
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
