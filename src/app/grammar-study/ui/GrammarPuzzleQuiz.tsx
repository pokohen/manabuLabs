'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { getGrammarDataByCategory, GrammarCategory, GrammarPattern, GrammarExample } from '@/data/grammar'
import GrammarDetailModal from './GrammarDetailModal'
import type { QuestionCount } from './GrammarQuizSetup'

// 현재 재생 중인 오디오
let currentAudio: HTMLAudioElement | null = null

// Google Cloud TTS API 호출
async function speakJapanese(text: string) {
  try {
    // 이전 오디오 중지
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error('TTS API error')
    }

    const { audio } = await response.json()
    const audioSrc = `data:audio/mp3;base64,${audio}`

    currentAudio = new Audio(audioSrc)
    currentAudio.play()
  } catch (error) {
    console.error('TTS error:', error)
  }
}

// 스피커 아이콘 컴포넌트
function SpeakerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

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
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([])
  const [correctQuestions, setCorrectQuestions] = useState<QuizQuestion[]>([])
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
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

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
      setCorrectQuestions(prev => [...prev, currentQuestion])
    } else {
      setWrongQuestions(prev => [...prev, currentQuestion])
    }

    // 자동 읽기가 켜져 있으면 정답 문장 읽기
    if (autoSpeak) {
      setTimeout(() => {
        speakJapanese(currentQuestion.example.japanese)
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

  // 문법 보기 (틀렸을 때)
  const handleShowGrammar = () => {
    setShowModal(true)
  }

  // 다시 풀기
  const handleRetry = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongQuestions([])
    setCorrectQuestions([])
    setIsFinished(false)
    generateQuestions()
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-spin"
                  style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                ></div>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                문제 출제중입니다
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                AI가 문장을 분석하고 있어요
              </p>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {loadingProgress}%
            </p>
          </div>

          <Button
            onClick={onExit}
            className="mt-4 py-2 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            취소
          </Button>
        </div>
      </div>
    )
  }

  // 에러 화면
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              오류 발생
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                onClick={generateQuestions}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                다시 시도
              </Button>
              <Button
                onClick={onExit}
                className="w-full py-3 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg"
              >
                나가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 퀴즈 완료 화면
  if (isFinished) {
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    const wrongCount = questions.length - correctCount

    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
        <div className="w-full max-w-md mx-auto py-8">
          {/* 결과 요약 */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 text-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              퀴즈 완료!
            </h2>

            <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
              {percentage}%
            </div>

            {/* 전체 / 정답 / 오답 통계 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{questions.length}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">전체</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">정답</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{wrongCount}</p>
                <p className="text-sm text-red-600 dark:text-red-400">오답</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                다시 풀기
              </Button>
              <Button
                onClick={onExit}
                className="w-full py-3 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg"
              >
                나가기
              </Button>
            </div>
          </div>

          {/* 정답 문제 목록 */}
          {correctQuestions.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                정답 ({correctQuestions.length}개)
              </h3>
              <div className="space-y-3">
                {correctQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                          {q.example.korean}
                        </p>
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
                          onClick={() => speakJapanese(q.example.japanese)}
                          className="p-2 bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                          title="문장 듣기"
                        >
                          <SpeakerIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedPattern(q.pattern)}
                          className="px-3 py-1.5 text-sm bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                        >
                          문법 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 틀린 문제 목록 */}
          {wrongQuestions.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
                오답 ({wrongQuestions.length}개)
              </h3>
              <div className="space-y-3">
                {wrongQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                          {q.example.korean}
                        </p>
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
                          onClick={() => speakJapanese(q.example.japanese)}
                          className="p-2 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded-lg transition-colors cursor-pointer"
                          title="문장 듣기"
                        >
                          <SpeakerIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedPattern(q.pattern)}
                          className="px-3 py-1.5 text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded-lg transition-colors cursor-pointer"
                        >
                          문법 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 문법 상세 모달 */}
        {selectedPattern && (
          <GrammarDetailModal
            pattern={selectedPattern}
            onClose={() => setSelectedPattern(null)}
          />
        )}
      </div>
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
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black p-4">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              문법 퀴즈
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`flex items-center gap-1.5 py-1 px-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  autoSpeak
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}
                title={autoSpeak ? '자동 읽기 켜짐' : '자동 읽기 꺼짐'}
              >
                <SpeakerIcon className="w-4 h-4" />
                <span className="text-xs">{autoSpeak ? 'ON' : 'OFF'}</span>
              </button>
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
              <span>진행률</span>
              <span>{currentIndex + 1} / {questions.length} (정답: {correctCount})</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 max-w-lg mx-auto w-full py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
          {/* 문제: 한국어 뜻 */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              다음 뜻의 일본어 문장을 만드세요
            </p>
            <p className="text-xl font-medium text-zinc-900 dark:text-white">
              {currentQuestion.example.korean}
            </p>
          </div>

          {/* 선택된 단어들 (답안 영역) */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 min-h-20">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">답안:</p>
            <div className="flex flex-wrap gap-2">
              {selectedWords.length === 0 ? (
                <span className="text-zinc-400 dark:text-zinc-500">단어를 선택하세요</span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`selected-${idx}`}
                    onClick={() => handleDeselectWord(word, idx)}
                    disabled={showResult}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      showResult
                        ? isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80'
                    }`}
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 선택 가능한 단어들 */}
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">단어:</p>
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {availableWords.map((word, idx) => (
                <button
                  key={`available-${idx}`}
                  onClick={() => handleSelectWord(word, idx)}
                  disabled={showResult}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 표시 */}
          {showResult && (
            <div className={`p-4 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-medium ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isCorrect ? '정답입니다!' : '오답입니다'}
                </p>
                <button
                  onClick={() => speakJapanese(currentQuestion.example.japanese)}
                  className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="문장 듣기"
                >
                  <SpeakerIcon className="w-5 h-5" />
                </button>
              </div>
              {!isCorrect && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  정답: {currentQuestion.example.japanese}
                </p>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                읽기: {currentQuestion.example.reading}
              </p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            {!showResult ? (
              <Button
                onClick={handleCheck}
                disabled={selectedWords.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                확인하기
              </Button>
            ) : (
              <div className="flex gap-3">
                {!isCorrect && (
                  <Button
                    onClick={handleShowGrammar}
                    className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-medium rounded-lg transition-colors"
                  >
                    문법 보기
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 문법 상세 모달 */}
      {showModal && (
        <GrammarDetailModal
          pattern={currentQuestion.pattern}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
