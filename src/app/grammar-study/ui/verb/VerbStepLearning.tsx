'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import type { VerbConjugation } from '@/data/grammar'
import { QuizInput } from '../common'

interface VerbStepLearningProps {
  conjugations: VerbConjugation[]
  categoryLabel: string
  initialIndex?: number
  onIndexChange?: (index: number) => void
  onExit: () => void
  onGoToList?: () => void
}

type LearningStep = 'learn' | 'quiz'

export default function VerbStepLearning({
  conjugations,
  categoryLabel,
  initialIndex = 0,
  onIndexChange,
  onExit,
  onGoToList,
}: VerbStepLearningProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [step, setStep] = useState<LearningStep>('learn')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [quizKey, setQuizKey] = useState(0) // QuizInput 리셋용

  const currentConjugation = conjugations[currentIndex]

  // URL 동기화
  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  // 퀴즈용 랜덤 예시 (클라이언트에서만 생성)
  const [quizExample, setQuizExample] = useState(currentConjugation.examples[0])

  useEffect(() => {
    const examples = currentConjugation.examples
    setQuizExample(examples[Math.floor(Math.random() * examples.length)])
  }, [currentConjugation])

  // 정답의 히라가나 추출 (reading에서 → 뒤 부분)
  const correctReading = quizExample ? (() => {
    const parts = quizExample.reading.split(' → ')
    return parts.length > 1 ? parts[1] : ''
  })() : ''

  // 원형의 히라가나 추출 (reading에서 → 앞 부분)
  const dictionaryReading = quizExample ? (() => {
    const parts = quizExample.reading.split(' → ')
    return parts.length > 0 ? parts[0] : ''
  })() : ''

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const { audio } = await response.json()
      const audioData = `data:audio/mp3;base64,${audio}`
      const audioElement = new Audio(audioData)
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleQuizComplete = () => {
    if (currentIndex < conjugations.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setStep('learn')
      setQuizKey(prev => prev + 1) // QuizInput 리셋
    } else {
      setIsCompleted(true)
    }
  }

  const handleSkip = () => {
    if (currentIndex < conjugations.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setStep('learn')
      setQuizKey(prev => prev + 1)
    } else {
      onExit()
    }
  }

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

  // 완료 화면
  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              학습 완료!
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {categoryLabel} 전체 학습을 완료했습니다
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            {onGoToList && (
              <Button
                onClick={onGoToList}
                className="w-full py-4 px-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-lg transition-colors"
              >
                전체 리스트 보기
              </Button>
            )}
            <Button
              onClick={onExit}
              className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              메뉴로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                {categoryLabel}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentIndex + 1} / {conjugations.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </header>

      {/* 진행 바 */}
      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / conjugations.length) * 100}%` }}
        />
      </div>

      {/* 컨텐츠 */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {step === 'learn' ? (
          // 학습 단계
          <div className="space-y-6">
            {/* 활용형 이름 */}
            <div className="text-center py-6">
              <h2 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {currentConjugation.name}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {currentConjugation.usage}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded">
                {currentConjugation.level}
              </span>
            </div>

            {/* 규칙 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">활용 규칙</h3>
              {currentConjugation.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">
                    {rule.group}
                  </p>
                  <p className="text-lg text-zinc-900 dark:text-white font-bold">
                    {rule.rule}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* 예시 (일부만 표시) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">예시</h3>
              {currentConjugation.examples.slice(0, 4).map((example, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
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
                        <span className="text-zinc-900 dark:text-white">
                          {example.dictionary}
                        </span>
                        <span className="text-zinc-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                          {example.conjugated}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {example.reading}
                      </p>
                    </div>
                    <Button
                      onClick={() => speakJapanese(example.conjugated)}
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                      disabled={isSpeaking}
                    >
                      <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 퀴즈로 이동 버튼 */}
            <div className="pt-4">
              <Button
                onClick={() => setStep('quiz')}
                className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors"
              >
                확인 퀴즈
              </Button>
            </div>
          </div>
        ) : (
          // 퀴즈 단계
          <div className="space-y-6 py-4">
            {/* 문제 */}
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                {currentConjugation.name}으로 바꾸세요
              </p>
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                {quizExample.dictionary}
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-1">
                {dictionaryReading}
              </p>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                {quizExample.meaning}
              </p>
            </div>

            {/* 퀴즈 입력 */}
            <QuizInput
              key={quizKey}
              correctAnswer={quizExample.conjugated}
              correctReading={correctReading}
              displayAnswer={quizExample.conjugated}
              displayReading={quizExample.reading}
              onResult={() => {}}
              onComplete={handleQuizComplete}
              completeButtonText={currentIndex < conjugations.length - 1 ? '다음 활용형' : '완료'}
            />
          </div>
        )}
      </main>
    </div>
  )
}
