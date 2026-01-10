'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KanaType, QuestionCount, TimerMode } from '@/data/kana'

type ViewMode = 'menu' | 'example-sentence' | 'quiz-setup'
type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

interface ExampleSentence {
  japanese: string
  reading: string
  korean: string
  level: JLPTLevel
}

interface ExampleResponse {
  word: string
  example: ExampleSentence
}

export default function Home() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('menu')
  const [inputWord, setInputWord] = useState('')
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>('N5')
  const [exampleResult, setExampleResult] = useState<ExampleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 퀴즈 설정
  const [kanaType, setKanaType] = useState<KanaType>('hiragana')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [timerMode, setTimerMode] = useState<TimerMode>('none')

  const handleGetExamples = async () => {
    if (!inputWord.trim()) return

    setIsLoading(true)
    setExampleResult(null)
    try {
      const response = await fetch('/api/example-sentence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: inputWord,
          level: jlptLevel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get examples')
      }

      const data: ExampleResponse = await response.json()

      console.log('Example Response:', data)
      setExampleResult(data)
    } catch (error) {
      console.error('Error:', error)
      setExampleResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = () => {
    router.push(`/quiz?type=${kanaType}&count=${questionCount}&timer=${timerMode}`)
  }

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const { audio } = await response.json()
      const audioData = `data:audio/mp3;base64,${audio}`
      const audioElement = new Audio(audioData)
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 1.0
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  // 메인 메뉴
  if (viewMode === 'menu') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            My Japanese Study
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            日本語の単語帳 - Japanese Vocabulary Study
          </p>

          <div className="w-full max-w-md space-y-4 mt-8">
            <button
              onClick={() => setViewMode('quiz-setup')}
              className="w-full py-6 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              히라가나 / 카타카나 퀴즈
            </button>

            <button
              onClick={() => setViewMode('example-sentence')}
              className="w-full py-6 px-6 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              예시 문장 보기
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>Powered by OpenAI and Supabase</p>
          </div>
        </main>
      </div>
    )
  }

  // 퀴즈 설정 화면
  if (viewMode === 'quiz-setup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            퀴즈 설정
          </h1>

          <div className="w-full max-w-md space-y-6">
            {/* 문자 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                문자 종류
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setKanaType('hiragana')}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                    kanaType === 'hiragana'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  히라가나 (あ)
                </button>
                <button
                  onClick={() => setKanaType('katakana')}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                    kanaType === 'katakana'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  카타카나 (ア)
                </button>
              </div>
            </div>

            {/* 문제 수 선택 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                문제 수
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setQuestionCount(10)}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                    questionCount === 10
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  10문제
                </button>
                <button
                  onClick={() => setQuestionCount(20)}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                    questionCount === 20
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  20문제
                </button>
                <button
                  onClick={() => setQuestionCount('all')}
                  className={`py-4 px-4 font-medium rounded-lg transition-colors ${
                    questionCount === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>

            {/* 타이머 모드 선택 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                타이머 설정
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setTimerMode('none')}
                  className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                    timerMode === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  <div className="font-bold">타이머 없음</div>
                  <div className="text-sm opacity-80">편안하게 풀기</div>
                </button>
                <button
                  onClick={() => setTimerMode('per-question')}
                  className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                    timerMode === 'per-question'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  <div className="font-bold">문제당 10초</div>
                  <div className="text-sm opacity-80">각 문제마다 10초 제한</div>
                </button>
                <button
                  onClick={() => setTimerMode('time-attack')}
                  className={`w-full py-4 px-4 font-medium rounded-lg transition-colors text-left ${
                    timerMode === 'time-attack'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  <div className="font-bold">타임어택 (20분)</div>
                  <div className="text-sm opacity-80">전체 20분 안에 모든 문제 풀기</div>
                </button>
              </div>
            </div>

            {/* 시작 버튼 */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleStartQuiz}
                className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg transition-colors"
              >
                퀴즈 시작하기
              </button>
              <button
                onClick={() => setViewMode('menu')}
                className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 예시 문장 보기 화면
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          예시 문장 보기
        </h1>

        <div className="w-full max-w-md space-y-4">
          <div>
            <label
              htmlFor="inputWord"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              일본어 단어 입력
            </label>
            <input
              id="inputWord"
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetExamples()}
              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 食べる, 勉強, 学校..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              JLPT 레벨
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setJlptLevel(level)}
                  className={`py-2 px-3 font-medium rounded-lg transition-colors ${
                    jlptLevel === level
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGetExamples}
            disabled={isLoading || !inputWord.trim()}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? '생성 중...' : '예시 문장 생성'}
          </button>

          {exampleResult && (
            <div className="space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-sm text-green-700 dark:text-green-300">단어: </span>
                <span className="text-lg font-bold text-green-800 dark:text-green-200">{exampleResult.word}</span>
              </div>

                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">예문</div>
                    <button
                      onClick={() => speakJapanese(exampleResult.example.japanese)}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="음성 재생"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xl text-black dark:text-white font-medium">
                    {exampleResult.example.japanese}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {exampleResult.example.reading}
                  </p>
                  <p className="text-base text-blue-600 dark:text-blue-400">
                    {exampleResult.example.korean}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    JLPT 레벨: {exampleResult.example.level ?? '정보 없음'}
                  </p>
                </div>
            </div>
          )}

          <button
            onClick={() => setViewMode('menu')}
            className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </main>
    </div>
  )
}
