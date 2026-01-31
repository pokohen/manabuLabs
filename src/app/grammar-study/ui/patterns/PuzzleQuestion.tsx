'use client'

import { Button } from '@/components/Button'
import { SpeakerButton, SpeakerIcon } from '../common'

interface PuzzleQuestionProps {
  korean: string
  japanese: string
  reading: string
  selectedWords: string[]
  availableWords: string[]
  showResult: boolean
  isCorrect: boolean
  autoSpeak: boolean
  onSelectWord: (word: string, index: number) => void
  onDeselectWord: (word: string, index: number) => void
  onCheck: () => void
  onShowGrammar: () => void
  onNext: () => void
  onAutoSpeakToggle: () => void
  onExit: () => void
  currentIndex: number
  totalQuestions: number
  correctCount: number
  isLastQuestion: boolean
}

export default function PuzzleQuestion({
  korean,
  japanese,
  reading,
  selectedWords,
  availableWords,
  showResult,
  isCorrect,
  autoSpeak,
  onSelectWord,
  onDeselectWord,
  onCheck,
  onShowGrammar,
  onNext,
  onAutoSpeakToggle,
  onExit,
  currentIndex,
  totalQuestions,
  correctCount,
  isLastQuestion
}: PuzzleQuestionProps) {
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0

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
                onClick={onAutoSpeakToggle}
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
                variant="secondary"
                size="xs"
              >
                나가기
              </Button>
            </div>
          </div>

          {/* 진행률 */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>진행률</span>
              <span>{currentIndex + 1} / {totalQuestions} (정답: {correctCount})</span>
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
              {korean}
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
                    onClick={() => onDeselectWord(word, idx)}
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
                  onClick={() => onSelectWord(word, idx)}
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
                <SpeakerButton text={japanese} reading={reading} />
              </div>
              {!isCorrect && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  정답: {japanese}
                </p>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                읽기: {reading}
              </p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            {!showResult ? (
              <Button
                onClick={onCheck}
                disabled={selectedWords.length === 0}
                variant="success"
                fullWidth
              >
                확인하기
              </Button>
            ) : (
              <div className="flex gap-3">
                {!isCorrect && (
                  <Button
                    onClick={onShowGrammar}
                    variant="neutral"
                    className="flex-1"
                  >
                    문법 보기
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  variant="success"
                  className="flex-1"
                >
                  {isLastQuestion ? '결과 보기' : '다음 문제'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
