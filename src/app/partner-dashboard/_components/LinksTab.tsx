'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PartnerLink } from '@/lib/schemas/partner'

export default function LinksTab({ categoryId }: { categoryId: string }) {
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
