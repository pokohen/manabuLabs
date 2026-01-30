'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { getGrammarDataByCategory, GrammarCategory, GrammarPattern, GrammarExample } from '@/data/grammar'
import GrammarDetailModal from './GrammarDetailModal'
import PuzzleQuestion from './PuzzleQuestion'
import type { QuestionCount } from './GrammarQuizSetup'
import { QuizResultScreen, QuizLoadingScreen, QuizErrorScreen, speakJapanese, SpeakerIcon } from '../common'
import type { AnsweredItem } from '../common'

interface QuizQuestion {
  pattern: GrammarPattern
  example: GrammarExample
  words: string[]
  correctOrder: string[]
}

interface GrammarPuzzleQuizProps {
  level: GrammarCategory
  questionCount: QuestionCount
  onExit: () => void
}

// 배열 섞기
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function GrammarPuzzleQuiz({ level, questionCount, onExit }: GrammarPuzzleQuizProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [answeredItems, setAnsweredItems] = useState<AnsweredItem<QuizQuestion>[]>([])
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(true)

  // Gemini API로 문제 생성
  const generateQuestions = useCallback(async () => {
    setIsLoading(true)
    setLoadingProgress(10)
    setError(null)

    try {
      const { type, data } = getGrammarDataByCategory(level)
      if (type !== 'patterns') {
        setError('지원하지 않는 문법 타입입니다.')
        return
      }

      // 예문 수집
      const allExamples: { pattern: GrammarPattern; example: GrammarExample }[] = []

      for (const pattern of data.patterns) {
        if (pattern.examples) {
          pattern.examples.forEach(ex => allExamples.push({ pattern, example: ex }))
        }
        if (pattern.usages) {
          pattern.usages.forEach(usage => {
            if (usage.example) allExamples.push({ pattern, example: usage.example })
            if (usage.examples) usage.examples.forEach(ex => allExamples.push({ pattern, example: ex }))
          })
        }
      }

      setLoadingProgress(20)

      // 문제 수에 맞게 선택
      const shuffledExamples = shuffleArray(allExamples)
      const selectedExamples = questionCount === 'all'
        ? shuffledExamples
        : shuffledExamples.slice(0, questionCount)

      setLoadingProgress(30)

      // Gemini API로 토큰화 요청
      const sentences = selectedExamples.map(e => e.example.japanese)

      const response = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentences }),
      })

      setLoadingProgress(70)

      if (!response.ok) {
        throw new Error('토큰화 API 오류')
      }

      const { results } = await response.json()

      setLoadingProgress(90)

      // 문제 생성
      const generatedQuestions: QuizQuestion[] = []

      for (let i = 0; i < selectedExamples.length; i++) {
        const { pattern, example } = selectedExamples[i]
        const tokenResult = results.find((r: { original: string; tokens: string[] }) => r.original === example.japanese)

        if (tokenResult && tokenResult.tokens.length >= 2) {
          generatedQuestions.push({
            pattern,
            example,
            words: shuffleArray(tokenResult.tokens),
            correctOrder: tokenResult.tokens,
          })
        }
      }

      setLoadingProgress(100)
      setQuestions(generatedQuestions)

      // 첫 문제 설정
      if (generatedQuestions.length > 0) {
        setAvailableWords([...generatedQuestions[0].words])
      }
    } catch (err) {
      console.error('문제 생성 오류:', err)
      setError('문제를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [level, questionCount])

  // 컴포넌트 마운트 시 문제 생성
  useEffect(() => {
    generateQuestions()
  }, [generateQuestions])

  // 문제 변경 시 상태 초기화
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setAvailableWords([...questions[currentIndex].words])
      setSelectedWords([])
      setShowResult(false)
      setIsCorrect(false)
    }
  }, [currentIndex, questions])

  const currentQuestion = questions[currentIndex]

  // 단어 선택
  const handleSelectWord = (word: string, index: number) => {
    if (showResult) return

    const newAvailable = [...availableWords]
    newAvailable.splice(index, 1)
    setAvailableWords(newAvailable)
    setSelectedWords([...selectedWords, word])
  }

  // 선택 취소
  const handleDeselectWord = (word: string, index: number) => {
    if (showResult) return

    const newSelected = [...selectedWords]
    newSelected.splice(index, 1)
    setSelectedWords(newSelected)
    setAvailableWords([...availableWords, word])
  }

  // 정답 확인
  const handleCheck = () => {
    const userAnswer = selectedWords.join('')
    const correctAnswer = currentQuestion.correctOrder.join('')
    const correct = userAnswer === correctAnswer

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setCorrectCount(prev => prev + 1)
    }
    setAnsweredItems(prev => [...prev, {
      data: currentQuestion,
      isCorrect: correct,
      userAnswer
    }])

    // 자동 읽기가 켜져 있으면 정답 문장 읽기
    if (autoSpeak) {
      setTimeout(() => {
        speakJapanese(currentQuestion.example.japanese, currentQuestion.example.reading)
      }, 300)
    }
  }

  // 다음 문제
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowModal(false)
    } else {
      setIsFinished(true)
    }
  }

  // 문법 보기
  const handleShowGrammar = () => {
    setShowModal(true)
  }

  // 다시 풀기
  const handleRetry = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setAnsweredItems([])
    setIsFinished(false)
    generateQuestions()
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <QuizLoadingScreen
        progress={loadingProgress}
        onCancel={onExit}
      />
    )
  }

  // 에러 화면
  if (error) {
    return (
      <QuizErrorScreen
        message={error}
        onRetry={generateQuestions}
        onExit={onExit}
      />
    )
  }

  // 퀴즈 완료 화면
  if (isFinished) {
    return (
      <>
        <QuizResultScreen
          totalCount={questions.length}
          correctCount={correctCount}
          answeredItems={answeredItems}
          onRetry={handleRetry}
          onExit={onExit}
          itemClickHint="탭하여 문법 보기"
          renderItem={(item, index) => {
            const q = item.data
            const colorClass = item.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            const buttonColorClass = item.isCorrect
              ? 'bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300'

            return (
              <div
                key={index}
                className={`rounded-xl border p-4 ${colorClass}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        item.isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.isCorrect ? '○' : '✕'}
                      </span>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {q.example.korean}
                      </p>
                    </div>
                    <p className="text-zinc-900 dark:text-white font-medium">
                      {q.example.japanese}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {q.example.reading}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                      {q.pattern.pattern} - {q.pattern.meaning}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => speakJapanese(q.example.japanese, q.example.reading)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${buttonColorClass}`}
                      title="문장 듣기"
                    >
                      <SpeakerIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedPattern(q.pattern)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${buttonColorClass}`}
                    >
                      문법 보기
                    </button>
                  </div>
                </div>
              </div>
            )
          }}
        />
        {/* 문법 상세 모달 */}
        {selectedPattern && (
          <GrammarDetailModal
            pattern={selectedPattern}
            onClose={() => setSelectedPattern(null)}
          />
        )}
      </>
    )
  }

  // 문제가 없는 경우
  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">문제를 불러올 수 없습니다.</p>
          <Button
            onClick={onExit}
            className="py-2 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg"
          >
            나가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PuzzleQuestion
        korean={currentQuestion.example.korean}
        japanese={currentQuestion.example.japanese}
        reading={currentQuestion.example.reading}
        selectedWords={selectedWords}
        availableWords={availableWords}
        showResult={showResult}
        isCorrect={isCorrect}
        autoSpeak={autoSpeak}
        onSelectWord={handleSelectWord}
        onDeselectWord={handleDeselectWord}
        onCheck={handleCheck}
        onShowGrammar={handleShowGrammar}
        onNext={handleNext}
        onAutoSpeakToggle={() => setAutoSpeak(!autoSpeak)}
        onExit={onExit}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        correctCount={correctCount}
        isLastQuestion={currentIndex >= questions.length - 1}
      />

      {/* 문법 상세 모달 */}
      {showModal && (
        <GrammarDetailModal
          pattern={currentQuestion.pattern}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
