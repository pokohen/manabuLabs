'use client'

import { useState, useEffect } from 'react'
import type { AdjectiveType } from '@/data/grammar'
import { SpeakerButton } from '../common'

interface AdjectiveDetailModalProps {
  adjectiveType: AdjectiveType
  onClose: () => void
}

type TabType = 'conjugation' | 'words' | 'notes'

export default function AdjectiveDetailModal({ adjectiveType, onClose }: AdjectiveDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('conjugation')
  const [showAllWords, setShowAllWords] = useState(false)

  const isIAdjective = adjectiveType.id === 'i-adjective'
  const accentColor = isIAdjective ? 'pink' : 'teal'

  const displayedWords = showAllWords
    ? adjectiveType.commonWords
    : adjectiveType.commonWords.slice(0, 12)

  // 노트 탭 표시 여부 (불규칙 활용이나 주의사항이 있는 경우)
  const hasNotes = adjectiveType.irregularConjugation || adjectiveType.lookAlikeIAdjectives

  // 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const tabs: { id: TabType; label: string }[] = [
    { id: 'conjugation', label: '활용표' },
    { id: 'words', label: '단어' },
    ...(hasNotes ? [{ id: 'notes' as TabType, label: '주의' }] : [])
  ]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 bg-${accentColor}-50 dark:bg-${accentColor}-900/20`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-3xl font-bold ${isIAdjective ? 'text-pink-600 dark:text-pink-400' : 'text-teal-600 dark:text-teal-400'}`}>
              {adjectiveType.name}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            {adjectiveType.description}
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">
            {adjectiveType.commonWords.length}개의 단어
          </p>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? isIAdjective
                    ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                    : 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 활용표 탭 */}
          {activeTab === 'conjugation' && (
            <div className="space-y-3">
              {adjectiveType.conjugations.map((conj, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {conj.form}
                    </span>
                    <span className={`text-sm font-bold ${isIAdjective ? 'text-pink-600 dark:text-pink-400' : 'text-teal-600 dark:text-teal-400'}`}>
                      {conj.rule}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-zinc-900 dark:text-white">
                        {conj.example.conjugated || conj.example.casual || conj.example.word}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {conj.example.meaning}
                      </p>
                      {conj.formal && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                          정중형: {conj.formal}
                        </p>
                      )}
                    </div>
                    <SpeakerButton
                      text={conj.example.conjugated || conj.example.casual || conj.example.word}
                      className={`p-2 rounded-full transition-colors ${
                        isIAdjective
                          ? 'bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400'
                          : 'bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400'
                      }`}
                      iconClassName="w-5 h-5"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 단어 탭 */}
          {activeTab === 'words' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {displayedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                        {word.word}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {word.reading}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                        {word.meaning}
                      </p>
                      {word.note && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          {word.note}
                        </p>
                      )}
                    </div>
                    <SpeakerButton
                      text={word.word}
                      className={`p-1.5 rounded-full transition-colors flex-shrink-0 ml-2 ${
                        isIAdjective
                          ? 'bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400'
                          : 'bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400'
                      }`}
                      iconClassName="w-4 h-4"
                    />
                  </div>
                ))}
              </div>
              {adjectiveType.commonWords.length > 12 && (
                <button
                  onClick={() => setShowAllWords(!showAllWords)}
                  className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                    isIAdjective
                      ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                      : 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30'
                  }`}
                >
                  {showAllWords ? '접기' : `전체 보기 (${adjectiveType.commonWords.length}개)`}
                </button>
              )}
            </div>
          )}

          {/* 주의사항 탭 */}
          {activeTab === 'notes' && hasNotes && (
            <div className="space-y-4">
              {/* 불규칙 활용 */}
              {adjectiveType.irregularConjugation && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                    <span className="font-bold text-yellow-700 dark:text-yellow-300">
                      불규칙 활용: {adjectiveType.irregularConjugation.word}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    {adjectiveType.irregularConjugation.note}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(adjectiveType.irregularConjugation.forms).map(([key, value]) => (
                      <div key={key} className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          {key === 'present' ? '현재' : key === 'negative' ? '부정' : key === 'past' ? '과거' : key === 'pastNegative' ? '과거부정' : key === 'te' ? 'て형' : '부사형'}
                        </span>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* い로 끝나는 な형용사 */}
              {adjectiveType.lookAlikeIAdjectives && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-600 dark:text-red-400 text-lg">🚨</span>
                    <span className="font-bold text-red-700 dark:text-red-300">
                      주의할 단어
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    {adjectiveType.lookAlikeIAdjectives.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {adjectiveType.lookAlikeIAdjectives.words.map((word, idx) => (
                      <div
                        key={idx}
                        className="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg flex items-center gap-2"
                      >
                        <div>
                          <span className="font-medium text-red-800 dark:text-red-200">{word.word}</span>
                          <span className="text-xs text-red-600 dark:text-red-400 ml-1">({word.meaning})</span>
                        </div>
                        <SpeakerButton
                          text={word.word}
                          className="p-1 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded-full transition-colors text-red-700 dark:text-red-300"
                          iconClassName="w-3 h-3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
