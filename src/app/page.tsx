'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { ToggleGroup } from '@/components/ToggleButton'
import { IconButton } from '@/components/IconButton'

type ViewMode = 'menu' | 'example-sentence'
type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

const jlptOptions: { value: JLPTLevel; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
]

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
            일본어 공부 앱
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            히라가나 / 가타카나 공부와 예시 문장 생성을 통해 일본어 실력을 향상시키세요!
          </p>

          <div className="w-full max-w-md space-y-4 mt-8">
            <Button
              onClick={() => router.push('/study')}
              className="w-full py-6 px-6 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              히라가나 / 가타카나 공부
            </Button>

            <Button
              onClick={() => router.push('/quiz-setup')}
              className="w-full py-6 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              히라가나 / 가타카나 퀴즈
            </Button>

            <Button
              onClick={() => setViewMode('example-sentence')}
              className="w-full py-6 px-6 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
            >
              예시 문장 보기
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>Powered by OpenAI and Supabase</p>
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
            <ToggleGroup
              value={jlptLevel}
              onChange={setJlptLevel}
              options={jlptOptions}
              variant="default"
              size="md"
              selectedColor="green"
              fullWidth
            />
          </div>

          <Button
            onClick={handleGetExamples}
            disabled={!inputWord.trim()}
            isLoading={isLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400"
          >
            예시 문장 생성
          </Button>

          {exampleResult && (
            <div className="space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-sm text-green-700 dark:text-green-300">단어: </span>
                <span className="text-lg font-bold text-green-800 dark:text-green-200">{exampleResult.word}</span>
              </div>

                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">예문</div>
                    <IconButton
                      icon="speaker"
                      onClick={() => speakJapanese(exampleResult.example.japanese)}
                      label="음성 재생"
                      size="md"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    />
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

          <Button
            onClick={() => setViewMode('menu')}
            variant="secondary"
            className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600"
          >
            뒤로 가기
          </Button>
        </div>
      </main>
    </div>
  )
}
