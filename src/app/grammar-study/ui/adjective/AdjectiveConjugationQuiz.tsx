'use client'

import { useState, useEffect } from 'react'
import adjectiveData from '@/data/grammar/adjective.json'
import { QuizResultScreen, QuizInput } from '../common'
import type { AnsweredItem } from '../common'

export type QuestionCount = 10 | 20 | 'all'

export interface AdjectiveQuestion {
  word: string
  reading: string
  meaning: string
  type: 'i-adjective' | 'na-adjective'
  typeName: string
  conjugationForm: string
  conjugated: string
  conjugatedReading: string
  rule: string
}

interface AdjectiveConjugationQuizProps {
  questionCount: QuestionCount
  onExit: () => void
}

// い형용사 활용 규칙
const iAdjectiveRules: { form: string; apply: (word: string, reading: string) => { conjugated: string; conjugatedReading: string } }[] = [
  {
    form: '현재 부정',
    apply: (word, reading) => ({
      conjugated: word.slice(0, -1) + 'くない',
      conjugatedReading: reading.slice(0, -1) + 'くない'
    })
  },
  {
    form: '과거 긍정',
    apply: (word, reading) => ({
      conjugated: word.slice(0, -1) + 'かった',
      conjugatedReading: reading.slice(0, -1) + 'かった'
    })
  },
  {
    form: '과거 부정',
    apply: (word, reading) => ({
      conjugated: word.slice(0, -1) + 'くなかった',
      conjugatedReading: reading.slice(0, -1) + 'くなかった'
    })
  },
  {
    form: 'て형',
    apply: (word, reading) => ({
      conjugated: word.slice(0, -1) + 'くて',
      conjugatedReading: reading.slice(0, -1) + 'くて'
    })
  },
  {
    form: '부사형',
    apply: (word, reading) => ({
      conjugated: word.slice(0, -1) + 'く',
      conjugatedReading: reading.slice(0, -1) + 'く'
    })
  }
]

// な형용사 활용 규칙
const naAdjectiveRules: { form: string; apply: (word: string, reading: string) => { conjugated: string; conjugatedReading: string } }[] = [
  {
    form: '현재 부정',
    apply: (word, reading) => ({
      conjugated: word + 'じゃない',
      conjugatedReading: reading + 'じゃない'
    })
  },
  {
    form: '과거 긍정',
    apply: (word, reading) => ({
      conjugated: word + 'だった',
      conjugatedReading: reading + 'だった'
    })
  },
  {
    form: '과거 부정',
    apply: (word, reading) => ({
      conjugated: word + 'じゃなかった',
      conjugatedReading: reading + 'じゃなかった'
    })
  },
  {
    form: 'て형',
    apply: (word, reading) => ({
      conjugated: word + 'で',
      conjugatedReading: reading + 'で'
    })
  },
  {
    form: '부사형',
    apply: (word, reading) => ({
      conjugated: word + 'に',
      conjugatedReading: reading + 'に'
    })
  }
]

// いい(良い)의 불규칙 활용
const iiIrregularForms: Record<string, { conjugated: string; conjugatedReading: string }> = {
  '현재 부정': { conjugated: 'よくない', conjugatedReading: 'よくない' },
  '과거 긍정': { conjugated: 'よかった', conjugatedReading: 'よかった' },
  '과거 부정': { conjugated: 'よくなかった', conjugatedReading: 'よくなかった' },
  'て형': { conjugated: 'よくて', conjugatedReading: 'よくて' },
  '부사형': { conjugated: 'よく', conjugatedReading: 'よく' }
}

// 퀴즈 문제 생성
const generateQuestions = (count: QuestionCount): AdjectiveQuestion[] => {
  const allQuestions: AdjectiveQuestion[] = []

  for (const type of adjectiveData.types) {
    const isIAdj = type.id === 'i-adjective'
    const rules = isIAdj ? iAdjectiveRules : naAdjectiveRules

    for (const word of type.commonWords) {
      // いい/良い 제외 (불규칙 활용이므로 별도 처리)
      if (word.word.includes('良い') || word.word === 'いい') continue
      // 슬래시가 있는 단어 제외 (早い/速い 등)
      if (word.word.includes('/')) continue

      for (const rule of rules) {
        const { conjugated, conjugatedReading } = rule.apply(word.word, word.reading)

        allQuestions.push({
          word: word.word,
          reading: word.reading,
          meaning: word.meaning,
          type: type.id as 'i-adjective' | 'na-adjective',
          typeName: type.name,
          conjugationForm: rule.form,
          conjugated,
          conjugatedReading,
          rule: isIAdj
            ? rule.form === '현재 부정' ? 'い → くない'
            : rule.form === '과거 긍정' ? 'い → かった'
            : rule.form === '과거 부정' ? 'い → くなかった'
            : rule.form === 'て형' ? 'い → くて'
            : 'い → く'
            : rule.form === '현재 부정' ? 'じゃない'
            : rule.form === '과거 긍정' ? 'だった'
            : rule.form === '과거 부정' ? 'じゃなかった'
            : rule.form === 'て형' ? 'で'
            : 'に'
        })
      }
    }
  }

  // いい(良い) 불규칙 활용 추가
  for (const [form, { conjugated, conjugatedReading }] of Object.entries(iiIrregularForms)) {
    allQuestions.push({
      word: 'いい',
      reading: 'いい',
      meaning: '좋다',
      type: 'i-adjective',
      typeName: 'い형용사',
      conjugationForm: form,
      conjugated,
      conjugatedReading,
      rule: `いい → ${conjugatedReading}`
    })
  }

  // 셔플
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)

  if (count === 'all') return shuffled
  return shuffled.slice(0, count)
}

export default function AdjectiveConjugationQuiz({ questionCount, onExit }: AdjectiveConjugationQuizProps) {
  const [questions, setQuestions] = useState<AdjectiveQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredItem<AdjectiveQuestion>[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizKey, setQuizKey] = useState(0)

  // 클라이언트에서만 문제 생성 (SSR 불일치 방지)
  useEffect(() => {
    setQuestions(generateQuestions(questionCount))
  }, [questionCount])

  const currentQuestion = questions[currentIndex]

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
    setQuestions(generateQuestions(questionCount))
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
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
      <QuizResultScreen
        totalCount={questions.length}
        correctCount={correctCount}
        answeredItems={answeredQuestions}
        onRetry={handleRetry}
        onExit={onExit}
        renderItem={(answered, index) => (
          <div
            key={index}
            className={`w-full rounded-xl border p-4 ${
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
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {answered.data.word}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {answered.data.conjugationForm}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                answered.data.type === 'i-adjective'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                {answered.data.typeName}
              </span>
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
            <div className="mt-2 text-xs text-zinc-400">
              규칙: {answered.data.rule}
            </div>
          </div>
        )}
      />
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
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded">
                {currentQuestion.conjugationForm}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentQuestion.type === 'i-adjective'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                {currentQuestion.typeName}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
              {currentQuestion.word}
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-1">
              {currentQuestion.reading}
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {currentQuestion.meaning}
            </p>
          </div>

          {/* 퀴즈 입력 */}
          <QuizInput
            key={quizKey}
            correctAnswer={currentQuestion.conjugated}
            correctReading={currentQuestion.conjugatedReading}
            displayAnswer={currentQuestion.conjugated}
            displayReading={`${currentQuestion.reading} → ${currentQuestion.conjugatedReading}`}
            onResult={handleQuizResult}
            onComplete={handleNext}
            completeButtonText={currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
          />
        </div>
      </main>
    </div>
  )
}
