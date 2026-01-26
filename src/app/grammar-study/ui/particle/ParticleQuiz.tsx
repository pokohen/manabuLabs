'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import particlesData from '@/data/grammar/particles.json'
import { QuizResultScreen, SpeakerButton } from '../common'
import type { AnsweredItem } from '../common'
import ParticleDetailModal from './ParticleDetailModal'
import type { Particle, GrammarExample } from '@/data/grammar'

export type QuestionCount = 10 | 20 | 'all'

interface ParticleQuizProps {
  questionCount: QuestionCount
  onExit: () => void
}

interface QuizQuestion {
  particle: Particle
  example: GrammarExample
  usageLabel: string
  correctAnswer: string
  options: string[]
}

interface MaskedQuestion {
  maskedJapanese: string
  maskedReading: string
  isLoading: boolean
}

// 퀴즈 문제 생성
const generateQuestions = (count: QuestionCount): QuizQuestion[] => {
  const particles = particlesData.particles as Particle[]
  const allQuestions: QuizQuestion[] = []

  // 각 조사의 각 용법별로 문제 생성
  for (const particle of particles) {
    for (const usage of particle.usages) {
      if (usage.examples.length > 0) {
        const example = usage.examples[0]

        // 다른 조사들 가져와서 오답 옵션 생성
        const otherParticles = particles.filter(p => p.id !== particle.id)
        const shuffledOthers = [...otherParticles].sort(() => Math.random() - 0.5)
        const wrongOptions = shuffledOthers.slice(0, 3).map(p => p.particle)

        const options = [particle.particle, ...wrongOptions].sort(() => Math.random() - 0.5)

        allQuestions.push({
          particle,
          example,
          usageLabel: usage.usage,
          correctAnswer: particle.particle,
          options,
        })
      }
    }
  }

  // 셔플
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)

  if (count === 'all') return shuffled
  return shuffled.slice(0, count)
}

export default function ParticleQuiz({ questionCount, onExit }: ParticleQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredItem<QuizQuestion>[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [selectedParticle, setSelectedParticle] = useState<Particle | null>(null)
  const [maskedData, setMaskedData] = useState<MaskedQuestion>({
    maskedJapanese: '',
    maskedReading: '',
    isLoading: true,
  })

  // 클라이언트에서만 문제 생성 (SSR 불일치 방지)
  useEffect(() => {
    setQuestions(generateQuestions(questionCount))
  }, [questionCount])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0

  // 현재 문제에 대해 마스킹 API 호출
  useEffect(() => {
    if (!currentQuestion) return

    const fetchMaskedData = async () => {
      setMaskedData(prev => ({ ...prev, isLoading: true }))

      try {
        const response = await fetch('/api/particle-mask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            japanese: currentQuestion.example.japanese,
            reading: currentQuestion.example.reading,
            particle: currentQuestion.correctAnswer,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMaskedData({
            maskedJapanese: data.masked_japanese,
            maskedReading: data.masked_reading,
            isLoading: false,
          })
        } else {
          // API 실패 시 기존 방식 사용 (폴백)
          setMaskedData({
            maskedJapanese: currentQuestion.example.japanese.replace(
              currentQuestion.correctAnswer,
              '___'
            ),
            maskedReading: currentQuestion.example.reading.replace(
              currentQuestion.correctAnswer,
              '___'
            ),
            isLoading: false,
          })
        }
      } catch {
        // 에러 시 기존 방식 사용
        setMaskedData({
          maskedJapanese: currentQuestion.example.japanese.replace(
            currentQuestion.correctAnswer,
            '___'
          ),
          maskedReading: currentQuestion.example.reading.replace(
            currentQuestion.correctAnswer,
            '___'
          ),
          isLoading: false,
        })
      }
    }

    fetchMaskedData()
  }, [currentQuestion])

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }

  const handleCheck = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    setShowResult(true)

    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }

    setAnsweredQuestions(prev => [...prev, {
      data: currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
    }])
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setIsFinished(true)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setCorrectCount(0)
    setAnsweredQuestions([])
    setIsFinished(false)
  }

  // 결과 화면
  if (isFinished) {
    return (
      <>
        <QuizResultScreen
          totalCount={questions.length}
          correctCount={correctCount}
          answeredItems={answeredQuestions}
          onRetry={handleRetry}
          onExit={onExit}
          itemClickHint="탭하여 조사 상세 보기"
          renderItem={(answered, index) => (
            <button
              key={index}
              onClick={() => setSelectedParticle(answered.data.particle)}
              className={`w-full text-left rounded-xl border p-4 hover:border-orange-500 dark:hover:border-orange-500 transition-colors ${
                answered.isCorrect
                  ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    answered.isCorrect
                      ? 'bg-orange-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {answered.isCorrect ? '○' : '✕'}
                  </span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {answered.data.particle.particle}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {answered.data.usageLabel}
                  </span>
                </div>
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {answered.data.example.japanese}
              </p>
              {!answered.isCorrect && (
                <p className="text-xs text-red-500 mt-1">
                  입력: {answered.userAnswer}
                </p>
              )}
            </button>
          )}
        />
        {/* 조사 상세 모달 */}
        {selectedParticle && (
          <ParticleDetailModal
            particle={selectedParticle}
            onClose={() => setSelectedParticle(null)}
          />
        )}
      </>
    )
  }

  // 로딩 중
  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            문제 생성 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              조사 퀴즈
            </h1>
            <Button
              onClick={onExit}
              className="py-1 px-3 bg-zinc-500 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              나가기
            </Button>
          </div>

          {/* 진행률 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>진행률</span>
              <span>{currentIndex + 1} / {questions.length} (정답: {correctCount})</span>
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

      {/* 메인 */}
      <main className="flex-1 max-w-lg mx-auto w-full py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
          {/* 문제: 예문 */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                빈칸에 들어갈 조사는?
              </p>
              <SpeakerButton
                text={currentQuestion.example.japanese}
                className="p-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
                iconClassName="w-5 h-5"
              />
            </div>

            {/* 예문 (마스킹된 버전) */}
            {maskedData.isLoading ? (
              <div className="py-4 space-y-2">
                <div className="animate-pulse bg-zinc-200 dark:bg-zinc-700 h-8 rounded" />
                <div className="animate-pulse bg-zinc-200 dark:bg-zinc-700 h-4 rounded w-3/4" />
                <div className="animate-pulse bg-blue-100 dark:bg-blue-900/30 h-4 rounded w-1/2 mt-2" />
              </div>
            ) : (
              <>
                <div className="text-xl font-medium text-zinc-900 dark:text-white mb-2">
                  {maskedData.maskedJapanese.split('___').map((part, idx, arr) => (
                    <span key={idx}>
                      {part}
                      {idx < arr.length - 1 && (
                        <span className="inline-block mx-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded border-2 border-dashed border-orange-400">
                          ?
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {maskedData.maskedReading.split('___').map((part, idx, arr) => (
                    <span key={idx}>
                      {part}
                      {idx < arr.length - 1 && (
                        <span className="text-orange-500">___</span>
                      )}
                    </span>
                  ))}
                </p>
                <p className="text-blue-600 dark:text-blue-400 mt-2">
                  {currentQuestion.example.korean}
                </p>
              </>
            )}
          </div>

          {/* 선택지 */}
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">조사를 선택하세요:</p>
            {maskedData.isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-zinc-200 dark:bg-zinc-700 h-16 rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  let buttonClass = `py-4 px-4 rounded-lg text-2xl font-bold transition-all border-2 ${showResult ? 'cursor-default' : 'cursor-pointer'} `

                  if (showResult) {
                    if (option === currentQuestion.correctAnswer) {
                      buttonClass += 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    } else if (selectedAnswer === option) {
                      buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    } else {
                      buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }
                  } else if (selectedAnswer === option) {
                    buttonClass += 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  } else {
                    buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:border-orange-400'
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 결과 표시 */}
          {showResult && (
            <div className={`p-4 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className={`font-medium ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다!' : '오답입니다'}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                <span className="font-bold text-orange-600 dark:text-orange-400">{currentQuestion.correctAnswer}</span>
                : {currentQuestion.particle.name} - {currentQuestion.usageLabel}
              </p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            {!showResult ? (
              <Button
                onClick={handleCheck}
                disabled={!selectedAnswer || maskedData.isLoading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                확인하기
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
