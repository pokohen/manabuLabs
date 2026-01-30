'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { ToggleGroup } from '@/components/ToggleButton'
import { IconButton } from '@/components/IconButton'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { JLPTLevel, GeminiResponse } from '@/lib/schemas/example-sentence'

const jlptOptions: { value: JLPTLevel; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
]

const DAILY_LIMIT = 5

export default function WordSentenceClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [inputWord, setInputWord] = useState('')
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>('N5')
  const [exampleResult, setExampleResult] = useState<GeminiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchUsageCount = useCallback(async () => {
    const supabase = createBrowserSupabaseClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'example_sentence')
      .gte('created_at', today.toISOString())
    setUsageCount(count ?? 0)
  }, [userId])

  useEffect(() => {
    fetchUsageCount()
  }, [fetchUsageCount])

  const handleGetExamples = async () => {
    if (!inputWord.trim()) return

    setIsLoading(true)
    setExampleResult(null)
    setErrorMessage(null)
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
        if (response.status === 401) {
          router.push('/login?redirectTo=/word-sentence')
          return
        }
        throw new Error(errorData.error || '예문 생성에 실패했습니다.')
      }

      const data: GeminiResponse = await response.json()

      console.log('Example Response:', data)
      setExampleResult(data)
      await fetchUsageCount()
    } catch (error) {
      console.error('Error:', error)
      setExampleResult(null)
      setErrorMessage(error instanceof Error ? error.message : '예문 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const speakJapanese = async (text: string, reading?: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, reading }),
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          문장 보기
        </h1>

        <div className="w-full max-w-md space-y-4">
          {/* 사용량 표시 */}
          <div className="text-right">
            <span className={`text-sm ${usageCount >= DAILY_LIMIT ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
              오늘 {usageCount}/{DAILY_LIMIT}회 사용
            </span>
          </div>
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
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
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
            disabled={!inputWord.trim() || usageCount >= DAILY_LIMIT}
            isLoading={isLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400"
          >
            {usageCount >= DAILY_LIMIT ? '오늘 한도 초과' : '예시 문장 생성'}
          </Button>

          {errorMessage && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          )}

          {exampleResult && (
            <div className="space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-green-700 dark:text-green-300">단어: </span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-200">{exampleResult.wordJapanese || exampleResult.word}</span>
                  {exampleResult.wordReading && (
                    <span className="text-sm text-green-600 dark:text-green-400">({exampleResult.wordReading})</span>
                  )}
                </div>
                {exampleResult.wordKorean && (
                  <p className="text-sm text-green-700 dark:text-green-300">뜻: {exampleResult.wordKorean}</p>
                )}
                {exampleResult.word !== exampleResult.wordJapanese && exampleResult.wordJapanese && (
                  <p className="text-xs text-green-600 dark:text-green-400">입력: {exampleResult.word}</p>
                )}
              </div>

                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">예문</div>
                    <IconButton
                      icon="speaker"
                      onClick={() => speakJapanese(exampleResult.example.japanese, exampleResult.example.reading)}
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

        </div>
      </main>
    </div>
  )
}
