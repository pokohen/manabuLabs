'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CategoryItem } from './types'

export default function CategoriesTab() {
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
