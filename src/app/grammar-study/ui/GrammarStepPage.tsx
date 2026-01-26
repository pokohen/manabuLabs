'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import {
  getGrammarDataByCategory,
  grammarCategories,
  GrammarCategory,
} from '@/data/grammar'
import GrammarCard from './GrammarCard'
import VerbConjugationCard from './VerbConjugationCard'
import ParticleCard from './ParticleCard'
import AdjectiveCard from './AdjectiveCard'
import StepLearning from './StepLearning'
import VerbStepLearning from './VerbStepLearning'
import GrammarDetailModal from './GrammarDetailModal'
import VerbConjugationDetailModal from './VerbConjugationDetailModal'
import type { GrammarPattern, VerbConjugation } from '@/data/grammar'

interface GrammarStepPageProps {
  category: GrammarCategory
  onBack: () => void
  onQuiz?: () => void
}

type LearningMode = 'select' | 'list' | 'step'

export default function GrammarStepPage({ category, onBack, onQuiz }: GrammarStepPageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [learningMode, setLearningMode] = useState<LearningMode>('select')
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null)
  const [selectedConjugation, setSelectedConjugation] = useState<VerbConjugation | null>(null)

  const { type, data } = getGrammarDataByCategory(category)
  const categoryInfo = grammarCategories.find((c) => c.id === category)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const getItemCount = () => {
    switch (type) {
      case 'patterns':
        return data.patterns.length
      case 'verb':
        return data.conjugations.length
      case 'particles':
        return data.particles.length
      case 'adjectives':
        return data.types.length
      default:
        return 0
    }
  }

  const renderCards = () => {
    switch (type) {
      case 'patterns':
        return data.patterns.map((pattern, index) => (
          <GrammarCard
            key={pattern.id}
            pattern={pattern}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'verb':
        return data.conjugations.map((conjugation, index) => (
          <VerbConjugationCard
            key={conjugation.id}
            conjugation={conjugation}
            verbGroups={data.verbGroups}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'particles':
        return data.particles.map((particle, index) => (
          <ParticleCard
            key={particle.id}
            particle={particle}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'adjectives':
        return data.types.map((adjType, index) => (
          <AdjectiveCard
            key={adjType.id}
            adjectiveType={adjType}
            comparisonTable={data.comparisonTable}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      default:
        return null
    }
  }

  // 단계별 학습 모드 (patterns 타입)
  if (learningMode === 'step' && type === 'patterns') {
    return (
      <StepLearning
        patterns={data.patterns}
        categoryLabel={categoryInfo?.label || data.title}
        onExit={() => setLearningMode('select')}
        onGoToList={() => setLearningMode('list')}
      />
    )
  }

  // 단계별 학습 모드 (verb 타입)
  if (learningMode === 'step' && type === 'verb') {
    return (
      <VerbStepLearning
        conjugations={data.conjugations}
        categoryLabel={categoryInfo?.label || data.title}
        onExit={() => setLearningMode('select')}
        onGoToList={() => setLearningMode('list')}
      />
    )
  }

  // 학습 모드 선택 화면
  if (learningMode === 'select') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
          <h1 className="text-2xl font-bold text-black dark:text-white text-center">
            {categoryInfo?.label || data.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center">
            총 {getItemCount()}개 항목
          </p>

          <div className="w-full space-y-4 mt-4">
            {/* 단계별 학습 (patterns, verb 타입 지원) */}
            {(type === 'patterns' || type === 'verb') && (
              <Button
                onClick={() => setLearningMode('step')}
                className="w-full py-5 px-6 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <span>단계별 학습</span>
                  <span className="text-sm font-normal opacity-80 mt-1">
                    {type === 'patterns' ? '하나씩 집중하며 퀴즈로 확인' : '활용형별로 학습하기'}
                  </span>
                </div>
              </Button>
            )}

            {/* 리스트 보기 */}
            <Button
              onClick={() => setLearningMode('list')}
              className="w-full py-5 px-6 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              <div className="flex flex-col items-center">
                <span>전체 리스트 보기</span>
                <span className="text-sm font-normal opacity-80 mt-1">
                  모든 항목을 한눈에 탐색
                </span>
              </div>
            </Button>

            {/* 문제 풀기 */}
            {onQuiz && (
              <Button
                onClick={onQuiz}
                className="w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <span>문제 풀기</span>
                  <span className="text-sm font-normal opacity-80 mt-1">
                    {type === 'patterns' ? '퍼즐로 예문 맞추기' : '4지선다 퀴즈'}
                  </span>
                </div>
              </Button>
            )}
          </div>

          <Button
            onClick={onBack}
            className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors mt-4"
          >
            뒤로 가기
          </Button>
        </main>
      </div>
    )
  }

  // 리스트 보기 모드
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLearningMode('select')}
              className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">
                {categoryInfo?.label || data.title}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {getItemCount()}개 항목
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full py-4">
        <div className="space-y-2">
          {type === 'patterns' ? (
            // 패턴 타입: 클릭하면 모달로 표시
            data.patterns.map((pattern, index) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className="w-full cursor-pointer bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
              >
                {/* 번호 */}
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
                  {index + 1}
                </div>

                {/* 패턴 */}
                <div className="min-w-20 sm:min-w-[100px]">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {pattern.pattern}
                  </span>
                </div>

                {/* 의미 */}
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-medium text-black dark:text-white truncate">
                    {pattern.meaning}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {pattern.formation}
                  </p>
                </div>

                {/* 화살표 */}
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          ) : type === 'verb' ? (
            // 동사 활용 타입: 클릭하면 모달로 표시
            data.conjugations.map((conjugation, index) => (
              <button
                key={conjugation.id}
                onClick={() => setSelectedConjugation(conjugation)}
                className="w-full cursor-pointer bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
              >
                {/* 번호 */}
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
                  {index + 1}
                </div>

                {/* 활용형 이름 */}
                <div className="min-w-20 sm:min-w-[100px]">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {conjugation.name}
                  </span>
                </div>

                {/* 용법 */}
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-medium text-black dark:text-white truncate">
                    {conjugation.usage}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {conjugation.level}
                  </p>
                </div>

                {/* 화살표 */}
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          ) : (
            // 기타 타입: 기존 아코디언 카드 사용
            renderCards()
          )}
        </div>
      </main>

      {/* 문법 상세 모달 */}
      {selectedPattern && (
        <GrammarDetailModal
          pattern={selectedPattern}
          onClose={() => setSelectedPattern(null)}
        />
      )}

      {/* 동사 활용 상세 모달 */}
      {selectedConjugation && (
        <VerbConjugationDetailModal
          conjugation={selectedConjugation}
          onClose={() => setSelectedConjugation(null)}
        />
      )}
    </div>
  )
}
