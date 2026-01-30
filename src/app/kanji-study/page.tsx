'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { JLPTLevel } from '@/data/kanji'
import KanjiStepPage from './ui/stepPage'

type SelectableLevel = Exclude<JLPTLevel, 'none'>

const jlptLevels: { level: SelectableLevel; label: string; color: string }[] = [
  { level: 'N5', label: 'N5 (초급)', color: 'bg-green-600 hover:bg-green-700' },
  { level: 'N4', label: 'N4 (초중급)', color: 'bg-blue-600 hover:bg-blue-700' },
  { level: 'N3', label: 'N3 (중급)', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { level: 'N2', label: 'N2 (중상급)', color: 'bg-orange-600 hover:bg-orange-700' },
  { level: 'N1', label: 'N1 (상급)', color: 'bg-red-600 hover:bg-red-700' },
]

export default function KanjiStudyPage() {
  const [selectedLevel, setSelectedLevel] = useState<SelectableLevel | null>(null)

  // 급수가 선택되면 KanjiStepPage 표시
  if (selectedLevel) {
    return (
      <KanjiStepPage
        step={selectedLevel}
        onBack={() => setSelectedLevel(null)}
      />
    )
  }

  // 급수 선택 화면
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16 px-8 max-w-md">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          한자 공부 (beta)
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          JLPT 급수를 선택하세요
        </p>

        <div className="w-full space-y-4 mt-4">
          {jlptLevels.map(({ level, label, color }) => (
            <Button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`w-full py-5 px-6 ${color} text-white text-xl font-bold rounded-lg transition-colors shadow-lg`}
            >
              {label}
            </Button>
          ))}
        </div>

      </main>
    </div>
  )
}
