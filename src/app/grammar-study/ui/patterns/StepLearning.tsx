'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/Button'
import type { GrammarPattern, GrammarExample } from '@/data/grammar'
import { LearningCompletionScreen, IntroStep, FormationStep, ExamplesStep, QuizStep } from '../common'

interface StepLearningProps {
  patterns: GrammarPattern[]
  categoryLabel: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
  onExit: () => void
  onGoToList?: () => void
}

type LearningStep = 'intro' | 'formation' | 'examples' | 'quiz'

interface QuizOption {
  text: string
  isCorrect: boolean
}

export default function StepLearning({ patterns, categoryLabel, initialIndex = 0, onIndexChange, onExit, onGoToList }: StepLearningProps) {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(initialIndex)
  const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const isInitialMount = useRef(true)
  const currentPattern = patterns[currentPatternIndex]
  const totalPatterns = patterns.length
  const progress = ((currentPatternIndex) / totalPatterns) * 100

  // URL 동기화 (초기 마운트 시에는 건너뛰기)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onIndexChange?.(currentPatternIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPatternIndex])

  const steps: LearningStep[] = ['intro', 'formation', 'examples', 'quiz']
  const currentStepIndex = steps.indexOf(currentStep)
  const stepLabels = ['소개', '규칙', '예문', '퀴즈']

  // 퀴즈 옵션 생성 (클라이언트에서만)
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([])

  useEffect(() => {
    if (!currentPattern) {
      setQuizOptions([])
      return
    }

    const correctAnswer = currentPattern.meaning
    const otherPatterns = patterns.filter((_, i) => i !== currentPatternIndex)

    const shuffled = [...otherPatterns].sort(() => Math.random() - 0.5)
    const wrongAnswers = shuffled.slice(0, 2).map(p => p.meaning)

    const options: QuizOption[] = [
      { text: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(text => ({ text, isCorrect: false }))
    ]

    setQuizOptions(options.sort(() => Math.random() - 0.5))
  }, [currentPattern, currentPatternIndex, patterns])

  const speakJapanese = async (text: string, reading?: string) => {
    if (isSpeaking) return
    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, reading }),
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

  const handleNext = () => {
    if (currentStep === 'quiz') {
      if (currentPatternIndex < totalPatterns - 1) {
        setCurrentPatternIndex(prev => prev + 1)
        setCurrentStep('intro')
        setSelectedAnswer(null)
        setShowQuizResult(false)
      }
    } else {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex])
        setSelectedAnswer(null)
        setShowQuizResult(false)
      }
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
      setSelectedAnswer(null)
      setShowQuizResult(false)
    }
  }

  const handleSkip = () => {
    if (currentPatternIndex < totalPatterns - 1) {
      setCurrentPatternIndex(prev => prev + 1)
      setCurrentStep('intro')
      setSelectedAnswer(null)
      setShowQuizResult(false)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(steps[stepIndex])
      setSelectedAnswer(null)
      setShowQuizResult(false)
    }
  }

  const handleQuizAnswer = (index: number) => {
    if (showQuizResult) return
    setSelectedAnswer(index)
    setShowQuizResult(true)
  }

  const getExamples = (): GrammarExample[] => {
    const examples: GrammarExample[] = []
    if (currentPattern.examples) {
      examples.push(...currentPattern.examples)
    }
    if (currentPattern.usages) {
      currentPattern.usages.forEach(usage => {
        if (usage.example) examples.push(usage.example)
        if (usage.examples) examples.push(...usage.examples)
      })
    }
    return examples.slice(0, 3)
  }

  const isLastPattern = currentPatternIndex === totalPatterns - 1

  // 완료 화면
  if (isCompleted) {
    return (
      <LearningCompletionScreen
        categoryLabel={categoryLabel}
        totalPatterns={totalPatterns}
        onGoToList={onGoToList}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-black dark:text-white">
              {categoryLabel}
            </h1>
            <div className="flex gap-2">
              {!isLastPattern && (
                <Button
                  onClick={handleSkip}
                  className="py-1 px-3 bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-white text-sm font-medium rounded-lg transition-colors"
                >
                  건너뛰기
                </Button>
              )}
              <Button
                onClick={onExit}
                className="py-1 px-3 bg-zinc-500 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                나가기
              </Button>
            </div>
          </div>

          {/* 진행률 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>학습 진행률</span>
              <span>{currentPatternIndex + 1} / {totalPatterns}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-lg mx-auto w-full py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden min-h-[400px] flex flex-col">
          {/* 스텝 인디케이터 */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            {steps.map((step, idx) => (
              <button
                key={step}
                onClick={() => goToStep(idx)}
                className={`flex-1 py-2 text-center text-sm font-medium transition-colors
                  ${idx === currentStepIndex
                    ? 'bg-green-500 text-white'
                    : idx < currentStepIndex
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
              >
                <span className="text-sm">{idx + 1}. {stepLabels[idx]}</span>
              </button>
            ))}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex-1 p-6">
            {currentStep === 'intro' && (
              <IntroStep pattern={currentPattern} />
            )}

            {currentStep === 'formation' && (
              <FormationStep pattern={currentPattern} />
            )}

            {currentStep === 'examples' && (
              <ExamplesStep
                pattern={currentPattern}
                examples={getExamples()}
                onSpeak={speakJapanese}
              />
            )}

            {currentStep === 'quiz' && (
              <QuizStep
                pattern={currentPattern}
                options={quizOptions}
                selectedAnswer={selectedAnswer}
                showResult={showQuizResult}
                onSelectAnswer={handleQuizAnswer}
              />
            )}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <Button
                  onClick={handlePrev}
                  className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-black dark:text-white font-medium rounded-lg transition-colors"
                >
                  이전
                </Button>
              )}

              {currentStep === 'quiz' ? (
                showQuizResult && (
                  <Button
                    onClick={isLastPattern ? () => setIsCompleted(true) : handleNext}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLastPattern ? '학습 완료!' : '다음 문법'}
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  다음
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
