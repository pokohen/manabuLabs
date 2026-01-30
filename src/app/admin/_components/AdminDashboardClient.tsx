'use client'

import { useState } from 'react'
import UsersTab from './UsersTab'
import CategoriesTab from './CategoriesTab'
import PartnersTab from './PartnersTab'
import AdminBannersTab from './AdminBannersTab'

type Tab = 'users' | 'categories' | 'partners' | 'banners'

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
        {activeTab === 'banners' && <AdminBannersTab />}
      </div>
    </div>
  )
}
