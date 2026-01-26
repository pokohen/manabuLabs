'use client'

import type { VerbConjugation, VerbGroup } from '@/data/grammar'
import { SpeakerButton } from '../common'

interface VerbConjugationCardProps {
  conjugation: VerbConjugation
  verbGroups: {
    group1: VerbGroup
    group2: VerbGroup
    group3: VerbGroup
  }
  isExpanded: boolean
  onToggle: () => void
}

export default function VerbConjugationCard({
  conjugation,
  isExpanded,
  onToggle,
}: VerbConjugationCardProps) {
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 min-w-[80px]">
          {conjugation.name}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium text-black dark:text-white">
            {conjugation.usage}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {conjugation.level}
          </p>
        </div>
        <span className="text-zinc-400 dark:text-zinc-500 text-xl">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4 space-y-4">
            {/* 규칙 설명 */}
            <div className="space-y-2">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">활용 규칙</p>
              {conjugation.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"
                >
                  <p className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                    {rule.group}
                  </p>
                  <p className="text-black dark:text-white font-medium mt-1">
                    {rule.rule}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* 음편 변화 (て형에만) */}
            {conjugation.soundChanges && conjugation.soundChanges.length > 0 && (
              <div className="space-y-2">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">음편 변화 (1그룹)</p>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {conjugation.soundChanges.map((change, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">{change.ending} →</span>
                        <span className="text-black dark:text-white font-medium">{change.change}</span>
                        <span className="text-zinc-500 dark:text-zinc-500 text-xs">({change.example})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 예시 동사 */}
            <div className="space-y-2">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">예시</p>
              <div className="space-y-2">
                {conjugation.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getGroupColor(example.group)}`}>
                            {example.group}그룹
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                            {example.meaning}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-black dark:text-white">
                            {example.dictionary}
                          </span>
                          <span className="text-zinc-400">→</span>
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            {example.conjugated}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {example.reading}
                        </p>
                        {example.note && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            * {example.note}
                          </p>
                        )}
                        {/* ます형의 추가 활용 */}
                        {example.negative && (
                          <div className="mt-2 text-sm grid grid-cols-2 gap-1">
                            <span className="text-zinc-500">부정: <span className="text-black dark:text-white">{example.negative}</span></span>
                            <span className="text-zinc-500">과거: <span className="text-black dark:text-white">{example.past}</span></span>
                          </div>
                        )}
                      </div>
                      <SpeakerButton
                        text={example.conjugated}
                        className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                        iconClassName="w-5 h-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 예문 (수동/사역형 등) */}
            {conjugation.usageExamples && conjugation.usageExamples.length > 0 && (
              <div className="space-y-2">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">예문</p>
                {conjugation.usageExamples.map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-black dark:text-white font-medium">{example.japanese}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{example.reading}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{example.korean}</p>
                      </div>
                      <SpeakerButton
                        text={example.japanese}
                        className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0 text-zinc-600 dark:text-zinc-400"
                        iconClassName="w-5 h-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
