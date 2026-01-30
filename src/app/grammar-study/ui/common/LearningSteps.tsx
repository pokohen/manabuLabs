'use client'

import { IconButton } from '@/components/IconButton'
import type { GrammarPattern, GrammarExample, ConjugationItem } from '@/data/grammar'

// 활용형 행 컴포넌트
function ConjugationRow({ label, item }: { label: string; item: string | ConjugationItem }) {
  if (typeof item === 'string') {
    return (
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-black dark:text-white">{item}</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-800 p-2 rounded">
      <div className="flex justify-between items-start">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</span>
        <div className="text-right">
          <p className="text-black dark:text-white font-medium">{item.japanese}</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{item.reading}</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm">{item.korean}</p>
        </div>
      </div>
    </div>
  )
}

interface StepProps {
  pattern: GrammarPattern
}

// Step 1: 패턴 소개
export function IntroStep({ pattern }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="py-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">문법 패턴</p>
        <h2 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
          {pattern.pattern}
        </h2>
        <p className="text-2xl text-black dark:text-white">
          {pattern.meaning}
        </p>
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
        <p className="text-zinc-600 dark:text-zinc-300">
          {pattern.explanation}
        </p>
      </div>
    </div>
  )
}

// Step 2: 형성 규칙
export function FormationStep({ pattern }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">접속법</p>
        <h2 className="text-2xl font-bold text-black dark:text-white">
          {pattern.formation}
        </h2>
      </div>

      {/* 변환 예시 */}
      {pattern.transformations && pattern.transformations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium">변환 예시</p>
          <div className="space-y-4">
            {pattern.transformations.map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-800 p-3 rounded-lg">
                <div className="flex items-center justify-center gap-2 flex-wrap text-lg">
                  <span className="text-black dark:text-white font-medium">{t.original}</span>
                  <span className="text-zinc-400">→</span>
                  {t.steps.map((step, stepIdx) => (
                    <span key={stepIdx} className="flex items-center gap-1">
                      <span className="text-green-600 dark:text-green-400 font-medium">{step}</span>
                      {stepIdx < t.steps.length - 1 && (
                        <span className="text-zinc-400">+</span>
                      )}
                    </span>
                  ))}
                  <span className="text-zinc-400">→</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{t.result}</span>
                </div>
                <div className="text-center mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.resultReading}
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>({t.originalMeaning})</span>
                  <span className="text-zinc-300 dark:text-zinc-600">→</span>
                  <span className="text-blue-500 dark:text-blue-300">({t.resultMeaning})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 활용형 */}
      {pattern.conjugation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">활용</p>
          <div className="grid grid-cols-1 gap-3">
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
    </div>
  )
}

// Step 3: 예문 학습
interface ExamplesStepProps extends StepProps {
  examples: GrammarExample[]
  onSpeak: (text: string, reading?: string) => void
}

export function ExamplesStep({ examples, onSpeak }: ExamplesStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        탭하여 해석을 확인하세요
      </p>
      {examples.map((example, idx) => (
        <div
          key={idx}
          className="w-full text-left bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-lg text-black dark:text-white font-medium">
                {example.japanese}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {example.reading}
              </p>
              <p className="text-blue-600 dark:text-blue-400 mt-2">
                {example.korean}
              </p>
            </div>
            <IconButton
              icon="speaker"
              onClick={() => onSpeak(example.japanese, example.reading)}
              label="음성 재생"
              size="md"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Step 4: 확인 퀴즈
interface QuizStepProps extends StepProps {
  options: { text: string; isCorrect: boolean }[]
  selectedAnswer: number | null
  showResult: boolean
  onSelectAnswer: (index: number) => void
}

export function QuizStep({ pattern, options, selectedAnswer, showResult, onSelectAnswer }: QuizStepProps) {
  const isCorrect = selectedAnswer !== null && options[selectedAnswer]?.isCorrect

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">확인하기</p>
        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
          {pattern.pattern}
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 mt-2">
          이 문법의 의미는?
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option, idx) => {
          let buttonClass = 'w-full p-4 rounded-lg text-left transition-all border-2 '

          if (showResult) {
            if (option.isCorrect) {
              buttonClass += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            } else if (selectedAnswer === idx) {
              buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            } else {
              buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }
          } else {
            buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-black dark:text-white'
          }

          return (
            <button
              key={idx}
              onClick={() => onSelectAnswer(idx)}
              className={buttonClass}
              disabled={showResult}
            >
              <span className="font-medium">{option.text}</span>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className={`text-center p-4 rounded-lg ${
          isCorrect
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {isCorrect ? '정답입니다!' : `오답입니다! 정답은 ${pattern.meaning}`}
        </div>
      )}
    </div>
  )
}
