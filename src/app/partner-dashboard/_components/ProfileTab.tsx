'use client'

import { useState } from 'react'
import { usePartnerStore } from '@/store/partnerStore'
import type { PartnerCategory } from '@/lib/schemas/partner'

export default function ProfileTab({ category }: { category: PartnerCategory }) {
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
