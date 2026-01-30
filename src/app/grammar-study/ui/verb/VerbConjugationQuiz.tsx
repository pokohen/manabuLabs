'use client'

import { useState, useEffect } from 'react'
import verbConjugationData from '@/data/grammar/verb-conjugation.json'
import { QuizResultScreen, QuizInput } from '../common'
import type { AnsweredItem, QuizMode } from '../common'
import ConjugationDetailModal, { QuizQuestion } from './ConjugationDetailModal'

export type QuestionCount = 10 | 20 | 'all'

interface VerbConjugationQuizProps {
  questionCount: QuestionCount
  onExit: () => void
}

// 퀴즈 문제 생성
const generateQuestions = (count: QuestionCount): QuizQuestion[] => {
  const allQuestions: QuizQuestion[] = []

  for (const conjugation of verbConjugationData.conjugations) {
    for (const example of conjugation.examples) {
      allQuestions.push({
        dictionary: example.dictionary,
        conjugated: example.conjugated,
        reading: example.reading,
        meaning: example.meaning,
        conjugationType: conjugation.id,
        conjugationName: conjugation.name,
        group: example.group,
      })
    }
  }

  // 셔플
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)

  if (count === 'all') return shuffled
  return shuffled.slice(0, count)
}

const getGroupName = (group: number) => {
  switch (group) {
    case 1: return '1그룹'
    case 2: return '2그룹'
    case 3: return '3그룹'
    default: return ''
  }
}

export default function VerbConjugationQuiz({ questionCount, onExit }: VerbConjugationQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredItem<QuizQuestion>[]>([])
  const [showResult, setShowResult] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<AnsweredItem<QuizQuestion> | null>(null)
  const [quizKey, setQuizKey] = useState(0)
  const [quizMode, setQuizMode] = useState<QuizMode>('typing')

  // 클라이언트에서만 문제 생성 (SSR 불일치 방지)
  useEffect(() => {
    setQuestions(generateQuestions(questionCount))
  }, [questionCount])

  const currentQuestion = questions[currentIndex]

  // 정답의 히라가나 추출 (reading에서 → 뒤 부분)
  const correctReading = currentQuestion ? (() => {
    const parts = currentQuestion.reading.split(' → ')
    return parts.length > 1 ? parts[1] : ''
  })() : ''

  // 원형의 히라가나 추출 (reading에서 → 앞 부분)
  const dictionaryReading = currentQuestion ? (() => {
    const parts = currentQuestion.reading.split(' → ')
    return parts.length > 0 ? parts[0] : ''
  })() : ''

  // 퀴즈 결과 처리
  const handleQuizResult = (isCorrect: boolean, userAnswer: string) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }
    setAnsweredQuestions(prev => [...prev, {
      data: currentQuestion,
      userAnswer,
      isCorrect
    }])
  }

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setQuizKey(prev => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  // 다시 풀기
  const handleRetry = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setAnsweredQuestions([])
    setShowResult(false)
    setQuizKey(prev => prev + 1)
  }

  // 로딩 중
  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            문제 생성 중...
          </p>
        </div>
      </div>
    )
  }

  // 결과 화면
  if (showResult) {
    return (
      <>
        <QuizResultScreen
          totalCount={questions.length}
          correctCount={correctCount}
          answeredItems={answeredQuestions}
          onRetry={handleRetry}
          onExit={onExit}
          itemClickHint="탭하여 활용 규칙 보기"
          renderItem={(answered, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuestion(answered)}
              className={`w-full text-left rounded-xl border p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors ${
                answered.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    answered.isCorrect
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {answered.isCorrect ? '○' : '✕'}
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {answered.data.dictionary}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {answered.data.conjugationName}
                  </span>
                </div>
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">정답: </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {answered.data.conjugated}
                  </span>
                </div>
                {!answered.isCorrect && (
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">입력: </span>
                    <span className="text-red-500 font-medium">
                      {answered.userAnswer}
                    </span>
                  </div>
                )}
              </div>
            </button>
          )}
        />
        {/* 활용 상세 모달 */}
        {selectedQuestion && (
          <ConjugationDetailModal
            answeredQuestion={selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onExit}
            className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-700"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {correctCount}점
            </span>
          </div>
        </div>
      </header>

      {/* 문제 */}
      <main className="flex-1 max-w-2xl mx-auto w-full py-6 flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* 문제 정보 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                {currentQuestion.conjugationName}
              </span>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded">
                {getGroupName(currentQuestion.group)}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
              {currentQuestion.dictionary}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-1">
              {dictionaryReading}
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {currentQuestion.meaning}
            </p>
          </div>

          {/* 퀴즈 입력 */}
          <QuizInput
            key={quizKey}
            correctAnswer={currentQuestion.conjugated}
            correctReading={correctReading}
            displayAnswer={currentQuestion.conjugated}
            displayReading={currentQuestion.reading}
            onResult={handleQuizResult}
            onComplete={handleNext}
            completeButtonText={currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            quizMode={quizMode}
            onQuizModeChange={setQuizMode}
          />
        </div>
      </main>
    </div>
  )
}
