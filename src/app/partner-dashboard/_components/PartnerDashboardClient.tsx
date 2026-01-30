'use client'

import { useState } from 'react'
import { usePartnerStore } from '@/store/partnerStore'
import { useAuthStore } from '@/store/authStore'
import PresenceIndicator from '@/components/PresenceIndicator'
import ProfileTab from './ProfileTab'
import LinksTab from './LinksTab'
import PartnerBannersTab from './PartnerBannersTab'
import type { Partner, PartnerCategory } from '@/lib/schemas/partner'

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
        {activeTab === 'banners' && <PartnerBannersTab categoryId={category.id} />}
      </div>
    </div>
  )
}
