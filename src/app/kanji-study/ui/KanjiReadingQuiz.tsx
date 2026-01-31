'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { KanjiData, kanjiByLevel, JLPTLevel } from '@/data/kanji'

export type QuestionCount = 10 | 20 | 'all'

interface KanjiReadingQuizProps {
  level: Exclude<JLPTLevel, 'none'>
  questionCount: QuestionCount
  onExit: () => void
}

interface QuizQuestion {
  kanji: KanjiData
  questionType: 'onyomi' | 'kunyomi'
  correctAnswer: string
  options: string[]
}

// 퀴즈 문제 생성
const generateQuestions = (level: Exclude<JLPTLevel, 'none'>, count: QuestionCount): QuizQuestion[] => {
  const kanjiList = kanjiByLevel[level] || []

  // 읽기가 있는 한자만 필터
  const kanjiWithReading = kanjiList.filter(k => k.onyomi || k.kunyomi)

  const allQuestions: QuizQuestion[] = []

  for (const kanji of kanjiWithReading) {
    // 음독 문제
    if (kanji.onyomi) {
      const otherOnyomi = kanjiWithReading
        .filter(k => k.char !== kanji.char && k.onyomi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(k => k.onyomi!)

      if (otherOnyomi.length >= 3) {
        const options = [kanji.onyomi, ...otherOnyomi].sort(() => Math.random() - 0.5)
        allQuestions.push({
          kanji,
          questionType: 'onyomi',
          correctAnswer: kanji.onyomi,
          options,
        })
      }
    }

    // 훈독 문제
    if (kanji.kunyomi) {
      const otherKunyomi = kanjiWithReading
        .filter(k => k.char !== kanji.char && k.kunyomi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(k => k.kunyomi!)

      if (otherKunyomi.length >= 3) {
        const options = [kanji.kunyomi, ...otherKunyomi].sort(() => Math.random() - 0.5)
        allQuestions.push({
          kanji,
          questionType: 'kunyomi',
          correctAnswer: kanji.kunyomi,
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

export default function KanjiReadingQuiz({ level, questionCount, onExit }: KanjiReadingQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([])

  // 클라이언트에서만 문제 생성 (SSR 불일치 방지)
  useEffect(() => {
    setQuestions(generateQuestions(level, questionCount))
  }, [level, questionCount])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0

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
    } else {
      setWrongQuestions(prev => [...prev, currentQuestion])
    }
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
    setWrongQuestions([])
    setIsFinished(false)
  }

  // 결과 화면
  if (isFinished) {
    const percentage = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
        <main className="flex-1 max-w-lg mx-auto w-full py-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                퀴즈 완료!
              </h2>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 my-4">
                {correctCount} / {questions.length}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">
                정답률: {percentage}%
              </p>
            </div>

            {/* 틀린 문제 */}
            {wrongQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                  틀린 문제 ({wrongQuestions.length}개)
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {wrongQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                          {q.kanji.char}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {q.questionType === 'onyomi' ? '음독' : '훈독'}
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {q.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleRetry}
                variant="neutral"
                className="flex-1"
              >
                다시 풀기
              </Button>
              <Button
                onClick={onExit}
                variant="primary"
                className="flex-1"
              >
                나가기
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 로딩 중
  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            문제 생성 중...
          </p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            퀴즈 문제가 충분하지 않습니다.
          </p>
          <Button
            onClick={onExit}
            variant="secondary"
            size="sm"
          >
            돌아가기
          </Button>
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
              {level} 한자 읽기 퀴즈
            </h1>
            <Button
              onClick={onExit}
              variant="secondary"
              size="xs"
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
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 max-w-lg mx-auto w-full py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
          {/* 문제 */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                다음 한자의 <span className="font-bold text-blue-600 dark:text-blue-400">
                  {currentQuestion.questionType === 'onyomi' ? '음독(オン)' : '훈독(くん)'}
                </span>은?
              </p>
              <div className="text-8xl font-bold text-zinc-900 dark:text-white my-6">
                {currentQuestion.kanji.char}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                {currentQuestion.kanji.meaning}
              </p>
              {/* 다른 읽기 힌트 (정답이 아닌 쪽) */}
              {currentQuestion.questionType === 'onyomi' && currentQuestion.kanji.kunyomi && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                  훈독: {currentQuestion.kanji.kunyomi}
                </p>
              )}
              {currentQuestion.questionType === 'kunyomi' && currentQuestion.kanji.onyomi && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                  음독: {currentQuestion.kanji.onyomi}
                </p>
              )}
            </div>
          </div>

          {/* 선택지 */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, idx) => {
                let buttonClass = 'py-4 px-4 rounded-lg text-lg font-medium transition-all border-2 '

                if (showResult) {
                  if (option === currentQuestion.correctAnswer) {
                    buttonClass += 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  } else if (selectedAnswer === option) {
                    buttonClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  } else {
                    buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }
                } else if (selectedAnswer === option) {
                  buttonClass += 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                } else {
                  buttonClass += 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:border-blue-400'
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
          </div>

          {/* 결과 표시 */}
          {showResult && (
            <div className={`p-4 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className={`font-medium ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다!' : '오답입니다'}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {currentQuestion.questionType === 'onyomi' ? '음독' : '훈독'}:
                <span className="font-bold text-blue-600 dark:text-blue-400 ml-1">
                  {currentQuestion.correctAnswer}
                </span>
              </p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            {!showResult ? (
              <Button
                onClick={handleCheck}
                disabled={!selectedAnswer}
                variant="primary"
                fullWidth
              >
                확인하기
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="primary"
                fullWidth
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
