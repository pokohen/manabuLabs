'use client'

import { useEffect } from 'react'
import verbConjugationData from '@/data/grammar/verb-conjugation.json'
import type { AnsweredItem } from '../common'

interface QuizQuestion {
  dictionary: string
  conjugated: string
  reading: string
  meaning: string
  conjugationType: string
  conjugationName: string
  group: number
}

interface ConjugationDetailModalProps {
  answeredQuestion: AnsweredItem<QuizQuestion>
  onClose: () => void
}

export default function ConjugationDetailModal({
  answeredQuestion,
  onClose
}: ConjugationDetailModalProps) {
  const question = answeredQuestion.data

  // 해당 활용 타입의 전체 정보 가져오기
  const conjugationInfo = verbConjugationData.conjugations.find(
    c => c.id === question.conjugationType
  )

  // 해당 동사의 전체 활용 정보 가져오기
  const verbExample = conjugationInfo?.examples.find(
    ex => ex.dictionary === question.dictionary
  ) as {
    dictionary: string
    conjugated: string
    negative: string
    past: string
    pastNegative: string
    reading: string
    meaning: string
    group: number
  } | undefined

  // body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getGroupName = (group: number) => {
    switch (group) {
      case 1: return '1그룹'
      case 2: return '2그룹'
      case 3: return '3그룹'
      default: return ''
    }
  }

  if (!conjugationInfo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {conjugationInfo.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* 용법 */}
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {conjugationInfo.usage}
            </p>
          </div>

          {/* 이 동사의 활용 */}
          {verbExample && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {verbExample.dictionary}
                </span>
                <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs rounded">
                  {getGroupName(verbExample.group)}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {verbExample.meaning}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">긍정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.conjugated}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">부정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.negative}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">과거</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.past}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">과거부정</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{verbExample.pastNegative}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                {verbExample.reading}
              </p>
            </div>
          )}

          {/* 활용 규칙 */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">활용 규칙</h3>
            <div className="space-y-2">
              {conjugationInfo.rules.map((rule, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${
                    rule.group === getGroupName(question.group)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {rule.group}
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {rule.rule}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// QuizQuestion 타입을 export하여 다른 곳에서 재사용
export type { QuizQuestion }
