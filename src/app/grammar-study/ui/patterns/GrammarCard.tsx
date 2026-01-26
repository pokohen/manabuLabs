'use client'

import type { GrammarPattern, GrammarExample, ConjugationItem } from '@/data/grammar'
import { SpeakerButton } from '../common'

// 활용형 텍스트 변환 헬퍼
function formatConjugation(item: string | ConjugationItem): string {
  if (typeof item === 'string') return item
  return `${item.japanese} (${item.reading}) - ${item.korean}`
}

interface GrammarCardProps {
  pattern: GrammarPattern
  isExpanded: boolean
  onToggle: () => void
}

function ExampleItem({ example }: { example: GrammarExample }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
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
  )
}

export default function GrammarCard({ pattern, isExpanded, onToggle }: GrammarCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-2xl font-bold text-green-600 dark:text-green-400 min-w-[100px]">
          {pattern.pattern}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium text-black dark:text-white">
            {pattern.meaning}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {pattern.formation}
          </p>
        </div>
        <span className="text-zinc-400 dark:text-zinc-500 text-xl">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4 space-y-4">
            {/* 설명 */}
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">설명</p>
              <p className="text-black dark:text-white">{pattern.explanation}</p>
            </div>

            {/* 접속법 */}
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">접속법</p>
              <p className="text-black dark:text-white font-medium">{pattern.formation}</p>
            </div>

            {/* 활용형 (있는 경우) */}
            {pattern.conjugation && (
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-2">활용</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {pattern.conjugation.present && (
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">현재: </span>
                      <span className="text-black dark:text-white">{formatConjugation(pattern.conjugation.present)}</span>
                    </div>
                  )}
                  {pattern.conjugation.negative && (
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">부정: </span>
                      <span className="text-black dark:text-white">{formatConjugation(pattern.conjugation.negative)}</span>
                    </div>
                  )}
                  {pattern.conjugation.past && (
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">과거: </span>
                      <span className="text-black dark:text-white">{formatConjugation(pattern.conjugation.past)}</span>
                    </div>
                  )}
                  {pattern.conjugation.pastNegative && (
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">과거부정: </span>
                      <span className="text-black dark:text-white">{formatConjugation(pattern.conjugation.pastNegative)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 용법 (있는 경우) */}
            {pattern.usages && pattern.usages.length > 0 && (
              <div className="space-y-3">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">용법</p>
                {pattern.usages.map((usage, idx) => (
                  <div key={idx} className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-1">
                      {usage.usage}
                    </p>
                    {usage.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        {usage.description}
                      </p>
                    )}
                    {usage.example && (
                      <ExampleItem example={usage.example} />
                    )}
                    {usage.examples && usage.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="mt-2">
                        <ExampleItem example={ex} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* 예문 */}
            {pattern.examples && pattern.examples.length > 0 && (
              <div className="space-y-2">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">예문</p>
                {pattern.examples.map((example, idx) => (
                  <ExampleItem key={idx} example={example} />
                ))}
              </div>
            )}

            {/* 노트 (있는 경우) */}
            {pattern.notes && pattern.notes.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mb-1">참고</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {pattern.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 캐주얼 표현 (있는 경우) */}
            {pattern.casualForms && pattern.casualForms.length > 0 && (
              <div className="bg-pink-50 dark:bg-pink-900/30 p-3 rounded-lg">
                <p className="text-pink-600 dark:text-pink-400 text-xs mb-1">캐주얼 표현</p>
                <p className="text-sm text-pink-700 dark:text-pink-300">
                  {pattern.casualForms.join(', ')}
                </p>
              </div>
            )}

            {/* 관련 표현 (있는 경우) */}
            {pattern.relatedPatterns && pattern.relatedPatterns.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-blue-600 dark:text-blue-400 text-xs mb-2">관련 표현</p>
                {pattern.relatedPatterns.map((related, idx) => (
                  <div key={idx} className="text-sm mb-1">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">{related.pattern}</span>
                    <span className="text-zinc-600 dark:text-zinc-400"> - {related.meaning}</span>
                    {related.note && (
                      <span className="text-zinc-500 dark:text-zinc-500"> ({related.note})</span>
                    )}
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
