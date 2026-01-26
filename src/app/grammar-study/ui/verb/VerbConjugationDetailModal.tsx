'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import type { VerbConjugation } from '@/data/grammar'

interface VerbConjugationDetailModalProps {
  conjugation: VerbConjugation
  onClose: () => void
}

type TabType = 'rules' | 'examples' | 'sentences'

export default function VerbConjugationDetailModal({
  conjugation,
  onClose,
}: VerbConjugationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rules')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const { audio } = await response.json()
      const audioData = `data:audio/mp3;base64,${audio}`
      const audioElement = new Audio(audioData)
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  const getGroupColor = (group: number) => {
    switch (group) {
      case 1:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 2:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 3:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'rules', label: '규칙' },
    { id: 'examples', label: '활용 예시' },
    ...(conjugation.usageExamples && conjugation.usageExamples.length > 0
      ? [{ id: 'sentences' as TabType, label: '예문' }]
      : []),
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 모달 */}
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {conjugation.name}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {conjugation.usage}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded">
                {conjugation.level}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 규칙 탭 */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              {/* 활용 규칙 */}
              <div className="space-y-3">
                {conjugation.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl"
                  >
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">
                      {rule.group}
                    </p>
                    <p className="text-lg text-zinc-900 dark:text-white font-bold">
                      {rule.rule}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      {rule.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* 음편 변화 (て형에만) */}
              {conjugation.soundChanges && conjugation.soundChanges.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                    음편 변화 (1그룹)
                  </h3>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="space-y-2">
                      {conjugation.soundChanges.map((change, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-900 dark:text-white font-medium">{change.ending}</span>
                            <span className="text-zinc-400">→</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{change.change}</span>
                          </div>
                          <span className="text-zinc-500 dark:text-zinc-500 text-xs">{change.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 활용 예시 탭 */}
          {activeTab === 'examples' && (
            <div className="space-y-3">
              {conjugation.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${getGroupColor(example.group)}`}>
                          {example.group}그룹
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                          {example.meaning}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-zinc-900 dark:text-white">
                          {example.dictionary}
                        </span>
                        <span className="text-zinc-400">→</span>
                        <span className="text-xl text-emerald-600 dark:text-emerald-400 font-bold">
                          {example.conjugated}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {example.reading}
                      </p>
                      {example.note && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                          * {example.note}
                        </p>
                      )}
                      {/* ます형의 추가 활용 */}
                      {example.negative && (
                        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-zinc-500 dark:text-zinc-400">부정: </span>
                            <span className="text-zinc-900 dark:text-white">{example.negative}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 dark:text-zinc-400">과거: </span>
                            <span className="text-zinc-900 dark:text-white">{example.past}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => speakJapanese(example.conjugated)}
                      className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0"
                      disabled={isSpeaking}
                    >
                      <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 예문 탭 */}
          {activeTab === 'sentences' && conjugation.usageExamples && (
            <div className="space-y-3">
              {conjugation.usageExamples.map((example, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-lg text-zinc-900 dark:text-white font-medium">
                        {example.japanese}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {example.reading}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        {example.korean}
                      </p>
                    </div>
                    <Button
                      onClick={() => speakJapanese(example.japanese)}
                      className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0"
                      disabled={isSpeaking}
                    >
                      <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </Button>
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
