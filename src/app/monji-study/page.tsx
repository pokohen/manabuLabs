'use client'

import { useState } from 'react'
import { hiragana, katakana, KanaType, KanaData } from '@/data/kana'
import WritingModal from '@/components/WritingModal'
import { Button } from '@/components/Button'

// romaji를 한글 발음으로 변환하는 맵
const romajiToKorean: Record<string, string> = {
  a: '아', i: '이', u: '우', e: '에', o: '오',
  ka: '카', ki: '키', ku: '쿠', ke: '케', ko: '코',
  sa: '사', shi: '시', su: '스', se: '세', so: '소',
  ta: '타', chi: '치', tsu: '츠', te: '테', to: '토',
  na: '나', ni: '니', nu: '누', ne: '네', no: '노',
  ha: '하', hi: '히', fu: '후', he: '헤', ho: '호',
  ma: '마', mi: '미', mu: '무', me: '메', mo: '모',
  ya: '야', yu: '유', yo: '요',
  ra: '라', ri: '리', ru: '루', re: '레', ro: '로',
  wa: '와', wo: '오', n: '응',
}

// 행별로 그룹화된 가나 데이터
const kanaRows = [
  { label: 'あ행', vowels: ['a', 'i', 'u', 'e', 'o'] },
  { label: 'か행', vowels: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { label: 'さ행', vowels: ['sa', 'shi', 'su', 'se', 'so'] },
  { label: 'た행', vowels: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { label: 'な행', vowels: ['na', 'ni', 'nu', 'ne', 'no'] },
  { label: 'は행', vowels: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { label: 'ま행', vowels: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { label: 'や행', vowels: ['ya', '', 'yu', '', 'yo'] },
  { label: 'ら행', vowels: ['ra', 'ri', 'ru', 're', 'ro'] },
  { label: 'わ행', vowels: ['wa', '', '', '', 'wo'] },
  { label: 'ん', vowels: ['n', '', '', '', ''] },
]

export default function MonjiStudyPage() {
  const [kanaType, setKanaType] = useState<KanaType>('hiragana')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeChar, setActiveChar] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedKana, setSelectedKana] = useState<KanaData | null>(null)

  const currentKana = kanaType === 'hiragana' ? hiragana : katakana

  const openWritingModal = (kana: KanaData) => {
    setSelectedKana(kana)
    setIsModalOpen(true)
  }

  const closeWritingModal = () => {
    setIsModalOpen(false)
    setSelectedKana(null)
  }

  const getCharByRomaji = (romaji: string) => {
    if (!romaji) return null
    return currentKana.find((k) => k.romaji === romaji)
  }

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    setActiveChar(text)
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
      audioElement.onended = () => {
        setActiveChar(null)
      }
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        utterance.onend = () => setActiveChar(null)
        window.speechSynthesis.speak(utterance)
      } else {
        setActiveChar(null)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-6 py-8 px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          기본 히라가나 / 가타카나 공부
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          문자를 클릭하면 쓰기 연습을 할 수 있습니다
        </p>

        {/* 가나 타입 선택 */}
        <div className="flex gap-2 w-full max-w-xs">
          <Button
            variant={kanaType === 'hiragana' ? 'primary' : 'neutral'}
            onClick={() => setKanaType('hiragana')}
            className="flex-1"
          >
            히라가나
          </Button>
          <Button
            variant={kanaType === 'katakana' ? 'primary' : 'neutral'}
            onClick={() => setKanaType('katakana')}
            className="flex-1"
          >
            가타카나
          </Button>
        </div>

        {/* 가나 테이블 */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400"></th>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400">あ</th>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400">い</th>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400">う</th>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400">え</th>
                <th className="p-2 text-xs text-zinc-500 dark:text-zinc-400">お</th>
              </tr>
            </thead>
            <tbody>
              {kanaRows.map((row) => (
                <tr key={row.label}>
                  <td className="p-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {row.label}
                  </td>
                  {row.vowels.map((romaji, index) => {
                    const kana = getCharByRomaji(romaji)
                    return (
                      <td key={index} className="p-1 text-center">
                        {kana ? (
                          <Button
                            variant="none"
                            onClick={() => openWritingModal(kana)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg transition-all flex flex-col items-center justify-center ${
                              activeChar === kana.char
                                ? 'bg-blue-600 text-white scale-110'
                                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-black dark:text-white'
                            }`}
                          >
                            <span className="text-xl sm:text-2xl font-medium">{kana.char}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {romajiToKorean[kana.romaji] || kana.romaji}
                            </span>
                          </Button>
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* 쓰기 연습 모달 */}
      {selectedKana && (
        <WritingModal
          isOpen={isModalOpen}
          onClose={closeWritingModal}
          character={selectedKana.char}
          reading={romajiToKorean[selectedKana.romaji] || selectedKana.romaji}
          onPlaySound={() => speakJapanese(selectedKana.char)}
        />
      )}
    </div>
  )
}
