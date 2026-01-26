'use client'

import { useState, useEffect } from 'react'
import { IconButton } from '@/components/IconButton'
import type { GrammarPattern, GrammarExample, ConjugationItem } from '@/data/grammar'

// 활용형 행 컴포넌트
function ConjugationRow({ label, item }: { label: string; item: string | ConjugationItem }) {
  if (typeof item === 'string') {
    return (
      <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</span>
        <span className="text-zinc-900 dark:text-white font-medium">{item}</span>
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
      <div className="flex justify-between items-start">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</span>
        <div className="text-right">
          <p className="text-zinc-900 dark:text-white font-medium">{item.japanese}</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{item.reading}</p>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-0.5">{item.korean}</p>
        </div>
      </div>
    </div>
  )
}

interface GrammarDetailModalProps {
  pattern: GrammarPattern
  onClose: () => void
}

type ModalTab = 'intro' | 'formation' | 'examples'

export default function GrammarDetailModal({ pattern, onClose }: GrammarDetailModalProps) {
  const [currentTab, setCurrentTab] = useState<ModalTab>('intro')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  const tabs: { key: ModalTab; label: string }[] = [
    { key: 'intro', label: '소개' },
    { key: 'formation', label: '규칙' },
    { key: 'examples', label: '예문' },
  ]

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return
    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (response.ok) {
        const { audio } = await response.json()
        const audioElement = new Audio(`data:audio/mp3;base64,${audio}`)
        audioElement.play()
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  const getExamples = (): GrammarExample[] => {
    const examples: GrammarExample[] = []
    if (pattern.examples) {
      examples.push(...pattern.examples)
    }
    if (pattern.usages) {
      pattern.usages.forEach(usage => {
        if (usage.example) examples.push(usage.example)
        if (usage.examples) examples.push(...usage.examples)
      })
    }
    return examples
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-md sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col sm:rounded-2xl rounded-t-2xl shadow-2xl">

        {/* 헤더 */}
        <div className="relative bg-zinc-100 dark:bg-zinc-800 p-5 pb-14 border-b border-zinc-200 dark:border-zinc-700">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 패턴 정보 */}
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">문법 패턴</p>
            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {pattern.pattern}
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-lg">
              {pattern.meaning}
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="relative -mt-6 mx-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-1.5 flex gap-1 border border-zinc-200 dark:border-zinc-700">
            {tabs.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`flex-1 py-2.5 px-3 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200
                  ${tab.key === currentTab
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
              >
                {idx + 1}. {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 pt-5">
          {/* Tab 1: 소개 */}
          {currentTab === 'intro' && (
            <div className="space-y-4">
              {/* 설명 카드 */}
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">설명</p>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {pattern.explanation}
                </p>
              </div>

              {/* 접속법 카드 */}
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">접속법</p>
                <p className="text-zinc-900 dark:text-white font-semibold text-lg">
                  {pattern.formation}
                </p>
              </div>

            </div>
          )}

          {/* Tab 2: 규칙 */}
          {currentTab === 'formation' && (
            <div className="space-y-4">
              {/* 변환 예시 */}
              {pattern.transformations && pattern.transformations.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">변환 예시</p>
                  {pattern.transformations.map((t, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="bg-white dark:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-white font-medium border border-zinc-200 dark:border-zinc-600">
                          {t.original}
                        </span>
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {t.steps.map((step, stepIdx) => (
                          <span key={stepIdx} className="flex items-center gap-1">
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{step}</span>
                            {stepIdx < t.steps.length - 1 && (
                              <span className="text-zinc-400">+</span>
                            )}
                          </span>
                        ))}
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg font-bold">
                          {t.result}
                        </span>
                      </div>
                      <div className="text-center mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {t.resultReading}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">{t.originalMeaning}</span>
                        <span>→</span>
                        <span className="bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 px-2 py-0.5 rounded">{t.resultMeaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 활용형 */}
              {pattern.conjugation && (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-medium">활용</p>
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                    {pattern.conjugation.present && (
                      <ConjugationRow label="현재" item={pattern.conjugation.present} />
                    )}
                    {pattern.conjugation.negative && (
                      <ConjugationRow label="부정" item={pattern.conjugation.negative} />
                    )}
                    {pattern.conjugation.past && (
                      <ConjugationRow label="과거" item={pattern.conjugation.past} />
                    )}
                    {pattern.conjugation.pastNegative && (
                      <ConjugationRow label="과거부정" item={pattern.conjugation.pastNegative} />
                    )}
                  </div>
                </div>
              )}

              {/* 변환이나 활용이 없는 경우 */}
              {!pattern.transformations?.length && !pattern.conjugation && (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                  <p>추가 규칙 정보가 없습니다.</p>
                  <p className="text-sm mt-1">소개 탭의 접속법을 참고하세요.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: 예문 */}
          {currentTab === 'examples' && (
            <div className="space-y-3">
              {getExamples().length > 0 ? (
                getExamples().map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg text-zinc-900 dark:text-white font-medium leading-relaxed">
                            {example.japanese}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {example.reading}
                          </p>
                        </div>
                        <IconButton
                          icon="speaker"
                          onClick={() => speakJapanese(example.japanese)}
                          label="음성 재생"
                          size="md"
                          className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-700 rounded-full p-2"
                        />
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                        {example.korean}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                  <p>예문이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 안전 영역 (모바일) */}
        <div className="h-safe-area-inset-bottom bg-white dark:bg-zinc-900" />
      </div>
    </div>
  )
}
