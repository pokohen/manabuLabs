'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/Button'
import { IconButton } from '@/components/IconButton'
import type { GrammarPattern, GrammarExample, ConjugationItem } from '@/data/grammar'

// 활용형 행 컴포넌트
function ConjugationRow({ label, item }: { label: string; item: string | ConjugationItem }) {
  if (typeof item === 'string') {
    // 기존 문자열 형식
    return (
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-black dark:text-white">{item}</span>
      </div>
    )
  }

  // 새 객체 형식
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

interface StepLearningProps {
  patterns: GrammarPattern[]
  categoryLabel: string
  onExit: () => void
}

type LearningStep = 'intro' | 'formation' | 'examples' | 'quiz'

interface QuizOption {
  text: string
  isCorrect: boolean
}

export default function StepLearning({ patterns, categoryLabel, onExit }: StepLearningProps) {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState<LearningStep>('intro')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const currentPattern = patterns[currentPatternIndex]
  const totalPatterns = patterns.length
  const progress = ((currentPatternIndex) / totalPatterns) * 100

  const steps: LearningStep[] = ['intro', 'formation', 'examples', 'quiz']
  const currentStepIndex = steps.indexOf(currentStep)

  // 퀴즈 옵션 생성
  const quizOptions = useMemo(() => {
    if (!currentPattern) return []

    const correctAnswer = currentPattern.meaning
    const otherPatterns = patterns.filter((_, i) => i !== currentPatternIndex)

    // 랜덤하게 오답 2개 선택
    const shuffled = [...otherPatterns].sort(() => Math.random() - 0.5)
    const wrongAnswers = shuffled.slice(0, 2).map(p => p.meaning)

    const options: QuizOption[] = [
      { text: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(text => ({ text, isCorrect: false }))
    ]

    // 옵션 섞기
    return options.sort(() => Math.random() - 0.5)
  }, [currentPattern, currentPatternIndex, patterns])

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return
    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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
      // 다음 문법으로
      if (currentPatternIndex < totalPatterns - 1) {
        setCurrentPatternIndex(prev => prev + 1)
        setCurrentStep('intro')
        setSelectedAnswer(null)
        setShowQuizResult(false)
      }
    } else {
      // 다음 스텝으로
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

  // 다음 문법으로 스킵
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
    return examples.slice(0, 3) // 최대 3개
  }

  const isLastPattern = currentPatternIndex === totalPatterns - 1
  const isQuizCorrect = selectedAnswer !== null && quizOptions[selectedAnswer]?.isCorrect

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
                  className="py-1 px-3 bg-transparent hover:bg-zinc-700 border-1 border-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
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
          {/* 스텝 인디케이터 (클릭 가능) */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            {steps.map((step, idx) => {
              const stepLabels = ['소개', '규칙', '예문', '퀴즈']
              return (
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
              )
            })}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex-1 p-6">
            {/* Step 1: 패턴 소개 */}
            {currentStep === 'intro' && (
              <div className="space-y-6 text-center">
                <div className="py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">문법 패턴</p>
                  <h2 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
                    {currentPattern.pattern}
                  </h2>
                  <p className="text-2xl text-black dark:text-white">
                    {currentPattern.meaning}
                  </p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {currentPattern.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: 형성 규칙 */}
            {currentStep === 'formation' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">접속법</p>
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {currentPattern.formation}
                  </h2>
                </div>

                {/* 변환 예시 */}
                {currentPattern.transformations && currentPattern.transformations.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-3 font-medium">변환 예시</p>
                    <div className="space-y-4">
                      {currentPattern.transformations.map((t, idx) => (
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
                {currentPattern.conjugation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">활용</p>
                    <div className="grid grid-cols-1 gap-3">
                      {currentPattern.conjugation.present && (
                        <ConjugationRow label="현재" item={currentPattern.conjugation.present} />
                      )}
                      {currentPattern.conjugation.negative && (
                        <ConjugationRow label="부정" item={currentPattern.conjugation.negative} />
                      )}
                      {currentPattern.conjugation.past && (
                        <ConjugationRow label="과거" item={currentPattern.conjugation.past} />
                      )}
                      {currentPattern.conjugation.pastNegative && (
                        <ConjugationRow label="과거부정" item={currentPattern.conjugation.pastNegative} />
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Step 3: 예문 학습 */}
            {currentStep === 'examples' && (
              <div className="space-y-4">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  탭하여 해석을 확인하세요
                </p>
                {getExamples().map((example, idx) => (
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
                        onClick={() => speakJapanese(example.japanese)}
                        label="음성 재생"
                        size="md"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: 확인 퀴즈 */}
            {currentStep === 'quiz' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">확인하기</p>
                  <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {currentPattern.pattern}
                  </h2>
                  <p className="text-lg text-zinc-600 dark:text-zinc-300 mt-2">
                    이 문법의 의미는?
                  </p>
                </div>

                <div className="space-y-3">
                  {quizOptions.map((option, idx) => {
                    let buttonClass = 'w-full p-4 rounded-lg text-left transition-all border-2 '

                    if (showQuizResult) {
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
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {isQuizCorrect ? '정답입니다!' : `오답입니다! 정답은 ${currentPattern.meaning}`}
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
                    onClick={isLastPattern ? onExit : handleNext}
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
