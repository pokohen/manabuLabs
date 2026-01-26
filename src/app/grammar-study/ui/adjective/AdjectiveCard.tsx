'use client'

import { useState } from 'react'
import type { AdjectiveType, ComparisonForm } from '@/data/grammar'
import { SpeakerButton } from '../common'

interface AdjectiveCardProps {
  adjectiveType: AdjectiveType
  comparisonTable: {
    title: string
    forms: ComparisonForm[]
  }
  isExpanded: boolean
  onToggle: () => void
}

export default function AdjectiveCard({
  adjectiveType,
  isExpanded,
  onToggle,
}: AdjectiveCardProps) {
  const [showAllWords, setShowAllWords] = useState(false)

  const isIAdjective = adjectiveType.id === 'i-adjective'

  const displayedWords = showAllWords
    ? adjectiveType.commonWords
    : adjectiveType.commonWords.slice(0, 10)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className={`text-3xl font-bold ${isIAdjective ? 'text-pink-600 dark:text-pink-400' : 'text-teal-600 dark:text-teal-400'} min-w-[80px]`}>
          {adjectiveType.name}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium text-black dark:text-white">
            {adjectiveType.description}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {adjectiveType.commonWords.length}개의 단어
          </p>
        </div>
        <span className="text-zinc-400 dark:text-zinc-500 text-xl">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4 space-y-4">
            {/* 활용표 */}
            <div className="space-y-2">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">활용표</p>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isIAdjective ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                      <th className="py-2 px-3 text-left text-zinc-700 dark:text-zinc-300">활용형</th>
                      <th className="py-2 px-3 text-left text-zinc-700 dark:text-zinc-300">규칙</th>
                      <th className="py-2 px-3 text-left text-zinc-700 dark:text-zinc-300">예시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjectiveType.conjugations.map((conj, idx) => (
                      <tr key={idx} className="border-t border-zinc-200 dark:border-zinc-700">
                        <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{conj.form}</td>
                        <td className={`py-2 px-3 font-medium ${isIAdjective ? 'text-pink-600 dark:text-pink-400' : 'text-teal-600 dark:text-teal-400'}`}>
                          {conj.rule}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-black dark:text-white">
                              {conj.example.conjugated || conj.example.casual || conj.example.word}
                            </span>
                            <SpeakerButton
                              text={conj.example.conjugated || conj.example.casual || conj.example.word}
                              className="p-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                              iconClassName="w-4 h-4"
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{conj.example.meaning}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 불규칙 활용 (い형용사의 いい) */}
            {adjectiveType.irregularConjugation && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <p className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">
                  불규칙 활용: {adjectiveType.irregularConjugation.word}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  {adjectiveType.irregularConjugation.note}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-500">현재: </span>
                    <span className="text-black dark:text-white">{adjectiveType.irregularConjugation.forms.present}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">부정: </span>
                    <span className="text-black dark:text-white">{adjectiveType.irregularConjugation.forms.negative}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">과거: </span>
                    <span className="text-black dark:text-white">{adjectiveType.irregularConjugation.forms.past}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">て형: </span>
                    <span className="text-black dark:text-white">{adjectiveType.irregularConjugation.forms.te}</span>
                  </div>
                </div>
              </div>
            )}

            {/* い로 끝나는 な형용사 주의 */}
            {adjectiveType.lookAlikeIAdjectives && (
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                  {adjectiveType.lookAlikeIAdjectives.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {adjectiveType.lookAlikeIAdjectives.words.map((word, idx) => (
                    <span
                      key={idx}
                      className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm"
                    >
                      {word.word} ({word.meaning})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 자주 쓰는 단어 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">자주 쓰는 단어</p>
                {adjectiveType.commonWords.length > 10 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAllWords(!showAllWords)
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAllWords ? '접기' : `전체 보기 (${adjectiveType.commonWords.length}개)`}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {displayedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-black dark:text-white font-medium">{word.word}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {word.reading} - {word.meaning}
                      </p>
                      {word.note && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {word.note}
                        </p>
                      )}
                    </div>
                    <SpeakerButton
                      text={word.word}
                      className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0 text-zinc-600 dark:text-zinc-400"
                      iconClassName="w-4 h-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
