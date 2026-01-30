'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import type { Particle, GrammarExample } from '@/data/grammar'
import { LearningCompletionScreen, SpeakerButton } from '../common'

interface ParticleStepLearningProps {
  particles: Particle[]
  categoryLabel: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
  onExit: () => void
  onGoToList?: () => void
}

type LearningStep = 'intro' | 'usages' | 'examples' | 'quiz'

interface QuizOption {
  text: string
  isCorrect: boolean
}

export default function ParticleStepLearning({ particles, categoryLabel, initialIndex = 0, onIndexChange, onExit, onGoToList }: ParticleStepLearningProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentParticle = particles[currentIndex]
  const totalParticles = particles.length
  const progress = (currentIndex / totalParticles) * 100

  // URL 동기화
  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  const steps: LearningStep[] = ['intro', 'usages', 'examples', 'quiz']
  const currentStepIndex = steps.indexOf(currentStep)
  const stepLabels = ['소개', '용법', '예문', '퀴즈']

  // 퀴즈 옵션 생성 (클라이언트에서만)
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([])

  useEffect(() => {
    if (!currentParticle) {
      setQuizOptions([])
      return
    }

    const correctAnswer = currentParticle.mainUsage
    const otherParticles = particles.filter((_, i) => i !== currentIndex)

    const shuffled = [...otherParticles].sort(() => Math.random() - 0.5)
    const wrongAnswers = shuffled.slice(0, 2).map(p => p.mainUsage)

    const options: QuizOption[] = [
      { text: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(text => ({ text, isCorrect: false }))
    ]

    setQuizOptions(options.sort(() => Math.random() - 0.5))
  }, [currentParticle, currentIndex, particles])

  const handleNext = () => {
    if (currentStep === 'quiz') {
      if (currentIndex < totalParticles - 1) {
        setCurrentIndex(prev => prev + 1)
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
    if (currentIndex < totalParticles - 1) {
      setCurrentIndex(prev => prev + 1)
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

  // 모든 예문 가져오기
  const getExamples = (): GrammarExample[] => {
    const examples: GrammarExample[] = []
    currentParticle.usages.forEach(usage => {
      examples.push(...usage.examples)
    })
    return examples.slice(0, 4) // 최대 4개
  }

  const isLastParticle = currentIndex === totalParticles - 1
  const isQuizCorrect = selectedAnswer !== null && quizOptions[selectedAnswer]?.isCorrect

  // 완료 화면
  if (isCompleted) {
    return (
      <LearningCompletionScreen
        categoryLabel={categoryLabel}
        totalPatterns={totalParticles}
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
              {!isLastParticle && (
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
              <span>{currentIndex + 1} / {totalParticles}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
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
                    ? 'bg-orange-500 text-white'
                    : idx < currentStepIndex
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
              >
                <span className="text-sm">{idx + 1}. {stepLabels[idx]}</span>
              </button>
            ))}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex-1 p-6">
            {/* Step 1: 소개 */}
            {currentStep === 'intro' && (
              <div className="space-y-6 text-center">
                <div className="py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">조사</p>
                  <h2 className="text-6xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                    {currentParticle.particle}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    {currentParticle.reading}
                  </p>
                  <p className="text-2xl text-black dark:text-white">
                    {currentParticle.name}
                  </p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {currentParticle.mainUsage}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: 용법 */}
            {currentStep === 'usages' && (
              <div className="space-y-4">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  {currentParticle.particle}의 다양한 용법
                </p>
                {currentParticle.usages.map((usage, idx) => (
                  <div key={idx} className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {usage.usage}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {usage.description}
                    </p>
                    {usage.note && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        * {usage.note}
                      </p>
                    )}
                  </div>
                ))}

                {/* vs 비교 */}
                {currentParticle.vsGa && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {currentParticle.vsGa.description}
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {currentParticle.vsGa.points.slice(0, 2).map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 예문 */}
            {currentStep === 'examples' && (
              <div className="space-y-3">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  예문을 들어보세요
                </p>
                {getExamples().map((example, idx) => (
                  <div key={idx} className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
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
                      <SpeakerButton
                        text={example.japanese}
                        reading={example.reading}
                        className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                        iconClassName="w-5 h-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: 퀴즈 */}
            {currentStep === 'quiz' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">확인하기</p>
                  <h2 className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                    {currentParticle.particle}
                  </h2>
                  <p className="text-lg text-zinc-600 dark:text-zinc-300 mt-2">
                    이 조사의 주요 의미는?
                  </p>
                </div>

                <div className="space-y-3">
                  {quizOptions.map((option, idx) => {
                    let buttonClass = 'w-full p-4 rounded-lg text-left transition-all border-2 '

                    if (showQuizResult) {
                      if (option.isCorrect) {
                        buttonClass += 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      } else if (selectedAnswer === idx) {
                        buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      } else {
                        buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }
                    } else {
                      buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-black dark:text-white'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        className={buttonClass}
                        disabled={showQuizResult}
                      >
                        <span className="font-medium">{option.text}</span>
                      </button>
                    )
                  })}
                </div>

                {showQuizResult && (
                  <div className={`text-center p-4 rounded-lg ${
                    isQuizCorrect
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {isQuizCorrect ? '정답입니다!' : `오답입니다! 정답은 "${currentParticle.mainUsage}"`}
                  </div>
                )}
              </div>
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
                    onClick={isLastParticle ? () => setIsCompleted(true) : handleNext}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLastParticle ? '학습 완료!' : '다음 조사'}
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
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
