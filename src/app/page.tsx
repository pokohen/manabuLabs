'use client'

import { useState } from 'react'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: 'Japanese',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Translation failed')
      }

      const data = await response.json()
      if (data.translatedText) {
        setTranslatedText(data.translatedText)
      } else {
        setTranslatedText('Translation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setTranslatedText('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          My Japanese Study
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          日本語の単語帳 - Japanese Vocabulary Study
        </p>

        <div className="w-full max-w-md space-y-4">
          <div>
            <label
              htmlFor="inputText"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Enter text to translate to Japanese
            </label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type something in English..."
            />
          </div>

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Translating...' : 'Translate to Japanese'}
          </button>

          {translatedText && (
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Translation
              </label>
              <p className="text-xl text-black dark:text-white">
                {translatedText}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Powered by OpenAI and Supabase</p>
        </div>
      </main>
    </div>
  )
}
