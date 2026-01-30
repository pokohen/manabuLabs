'use client'

import { useEffect, useState } from 'react'
import type { Particle, GrammarExample } from '@/data/grammar'
import { SpeakerButton } from '../common'

interface ParticleDetailModalProps {
  particle: Particle
  onClose: () => void
}

export default function ParticleDetailModal({ particle, onClose }: ParticleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'intro' | 'usages' | 'examples'>('intro')

  // body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 모든 예문 수집
  const allExamples: GrammarExample[] = particle.usages.flatMap(u => u.examples)

  const tabs = [
    { id: 'intro', label: '소개' },
    { id: 'usages', label: '용법' },
    { id: 'examples', label: '예문' },
  ] as const

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {particle.particle}
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {particle.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {particle.mainUsage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 소개 탭 */}
          {activeTab === 'intro' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <span className="text-6xl font-bold text-orange-600 dark:text-orange-400">
                  {particle.particle}
                </span>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  읽기: {particle.reading}
                </p>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">의미</p>
                <p className="text-xl font-medium text-zinc-900 dark:text-white">
                  {particle.mainUsage}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2 font-medium">
                  용법 요약
                </p>
                <ul className="space-y-1">
                  {particle.usages.map((usage, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="text-orange-500">•</span>
                      <span>{usage.usage}: {usage.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* は vs が 비교 */}
              {particle.vsGa && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
                    {particle.vsGa.description}
                  </p>
                  <ul className="space-y-1">
                    {particle.vsGa.points.map((point, idx) => (
                      <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-300">
                        • {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 용법 탭 */}
          {activeTab === 'usages' && (
            <div className="space-y-4">
              {particle.usages.map((usage, idx) => (
                <div key={idx} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded">
                      {idx + 1}
                    </span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {usage.usage}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {usage.description}
                  </p>

                  {/* 예문 1개 */}
                  {usage.examples[0] && (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-zinc-900 dark:text-white font-medium">
                            {usage.examples[0].japanese}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {usage.examples[0].reading}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            {usage.examples[0].korean}
                          </p>
                        </div>
                        <SpeakerButton
                          text={usage.examples[0].japanese}
                          reading={usage.examples[0].reading}
                          className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                          iconClassName="w-4 h-4"
                        />
                      </div>
                    </div>
                  )}

                  {/* 참고 사항 */}
                  {usage.note && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      * {usage.note}
                    </p>
                  )}
                  {usage.vsNi && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      💡 {usage.vsNi}
                    </p>
                  )}
                  {usage.vsTo && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      💡 {usage.vsTo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 예문 탭 */}
          {activeTab === 'examples' && (
            <div className="space-y-3">
              {allExamples.map((example, idx) => (
                <div key={idx} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-lg text-zinc-900 dark:text-white font-medium">
                        {example.japanese}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {example.reading}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 mt-2">
                        {example.korean}
                      </p>
                    </div>
                    <SpeakerButton
                      text={example.japanese}
                      reading={example.reading}
                      className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                      iconClassName="w-5 h-5"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
