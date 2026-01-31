'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { kanjiByLevel, JLPTLevel } from '@/data/kanji'
import KanjiCard from './KanjiCard'
import KanjiReadingQuiz, { QuestionCount } from './KanjiReadingQuiz'

interface KanjiStepPageProps {
  step: Exclude<JLPTLevel, 'none'>
  onBack: () => void
}

type PageMode = 'list' | 'quiz-setup' | 'quiz'

export default function KanjiStepPage({ step, onBack }: KanjiStepPageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [pageMode, setPageMode] = useState<PageMode>('list')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)

  const kanjiList = kanjiByLevel[step] || []

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // 퀴즈 모드
  if (pageMode === 'quiz') {
    return (
      <KanjiReadingQuiz
        level={step}
        questionCount={questionCount}
        onExit={() => setPageMode('list')}
      />
    )
  }

  // 퀴즈 설정
  if (pageMode === 'quiz-setup') {
    const questionOptions: { value: QuestionCount; label: string }[] = [
      { value: 10, label: '10문제' },
      { value: 20, label: '20문제' },
      { value: 'all', label: '전체' },
    ]

    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
        <main className="flex-1 max-w-lg mx-auto w-full flex items-center justify-center">
          <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white text-center mb-6">
              {step} 한자 읽기 퀴즈
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">문제 수</p>
                <div className="grid grid-cols-3 gap-2">
                  {questionOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setQuestionCount(opt.value)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                        questionCount === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:border-blue-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                한자의 음독(オン) 또는 훈독(くん)을 맞추는 퀴즈입니다.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setPageMode('list')}
                variant="neutral"
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={() => setPageMode('quiz')}
                variant="primary"
                className="flex-1"
              >
                시작하기
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 리스트 모드
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {step} 한자 ({kanjiList.length}자)
            </h1>
          </div>
          {/* 퀴즈 버튼 */}
          <Button
            onClick={() => setPageMode('quiz-setup')}
            variant="primary"
            fullWidth
          >
            읽기 퀴즈 시작
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full py-4">
        <div className="space-y-3">
          {kanjiList.map((kanji, index) => (
            <KanjiCard
              key={kanji.char}
              kanji={kanji}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
