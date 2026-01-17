'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/quizStore'
import { Button } from '@/components/Button'
import { ToggleButton } from '@/components/ToggleButton'
import { IconButton } from '@/components/IconButton'
import WritingModal from '@/components/WritingModal'

type ResultFilter = 'all' | 'correct' | 'wrong'

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

export default function QuizResultPage() {
  const router = useRouter()
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChar, setSelectedChar] = useState<{ char: string; romaji: string } | null>(null)

  const {
    questions,
    correctCount,
    answers,
    resetQuiz,
  } = useQuizStore()

  // 결과가 없으면 quiz-setup으로 리다이렉트
  useEffect(() => {
    if (answers.length === 0) {
      router.replace('/quiz-setup')
    }
  }, [answers, router])

  const handleRestart = () => {
    resetQuiz()
    router.push('/quiz-setup')
  }

  const openWritingModal = (char: string, romaji: string) => {
    setSelectedChar({ char, romaji })
    setIsModalOpen(true)
  }

  const closeWritingModal = () => {
    setIsModalOpen(false)
    setSelectedChar(null)
  }

  // 로딩 중
  if (answers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const wrongCount = questions.length - correctCount
  const filteredAnswers = answers.filter((answer) => {
    if (resultFilter === 'correct') return answer.isCorrect
    if (resultFilter === 'wrong') return !answer.isCorrect
    return true
  })

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 dark:bg-black p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* 결과 요약 카드 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">퀴즈 완료!</h1>
          <div className="mb-6">
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {correctCount} / {questions.length}
            </p>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              정답률: {Math.round((correctCount / questions.length) * 100)}%
            </p>
          </div>

          {/* 정답/오답 통계 */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{correctCount}</p>
              <p className="text-sm text-zinc-500">정답</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
              <p className="text-sm text-zinc-500">오답</p>
            </div>
          </div>

          <Button
            onClick={handleRestart}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700"
          >
            다시 시작하기
          </Button>
        </div>

        {/* 문제 리뷰 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-black dark:text-white">문제 리뷰</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            문자를 클릭하면 쓰기 연습을 할 수 있습니다
          </p>

          {/* 필터 버튼 */}
          <div className="flex gap-2 mb-4">
            <ToggleButton
              isSelected={resultFilter === 'all'}
              onToggle={() => setResultFilter('all')}
              variant="pill"
              size="sm"
              selectedColor="blue"
              className="flex-1"
            >
              전체 ({answers.length})
            </ToggleButton>
            <ToggleButton
              isSelected={resultFilter === 'correct'}
              onToggle={() => setResultFilter('correct')}
              variant="pill"
              size="sm"
              selectedColor="green"
              className="flex-1"
            >
              정답 ({correctCount})
            </ToggleButton>
            <ToggleButton
              isSelected={resultFilter === 'wrong'}
              onToggle={() => setResultFilter('wrong')}
              variant="pill"
              size="sm"
              selectedColor="red"
              className="flex-1"
            >
              오답 ({wrongCount})
            </ToggleButton>
          </div>

          {/* 문제 목록 */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredAnswers.map((answer) => {
              const question = questions[answer.questionIndex]
              return (
                <div
                  key={answer.questionIndex}
                  className={`p-4 rounded-lg border-2 ${
                    answer.isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* 문자 - 클릭 가능 */}
                    <button
                      onClick={() => openWritingModal(question.kana.char, question.kana.romaji)}
                      className="text-4xl font-bold text-black dark:text-white hover:scale-110 transition-transform cursor-pointer p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20"
                      title="쓰기 연습"
                    >
                      {question.kana.char}
                    </button>

                    {/* 답변 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            answer.isCorrect
                              ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                          }`}
                        >
                          {answer.isCorrect ? '정답' : answer.userAnswer === null ? '시간초과' : '오답'}
                        </span>
                        <span className="text-xs text-zinc-500">#{answer.questionIndex + 1}</span>
                      </div>

                      {/* 정답 표시 */}
                      <p className="text-sm text-black dark:text-white">
                        <span className="text-zinc-500">정답: </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {answer.correctAnswer}
                        </span>
                      </p>

                      {/* 사용자 답변 (틀린 경우만) */}
                      {!answer.isCorrect && answer.userAnswer && (
                        <p className="text-sm text-black dark:text-white">
                          <span className="text-zinc-500">내 답변: </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {answer.userAnswer}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 쓰기 연습 버튼 */}
                    <IconButton
                      icon="pencil"
                      label="쓰기 연습"
                      trailing="쓰기 연습"
                      variant="text"
                      size="md"
                      onClick={() => openWritingModal(question.kana.char, question.kana.romaji)}
                    />
                  </div>
                </div>
              )
            })}

            {filteredAnswers.length === 0 && (
              <p className="text-center text-zinc-500 py-8">
                {resultFilter === 'correct' ? '정답이 없습니다' : '오답이 없습니다'}
              </p>
            )}
          </div>
        </div>

        {/* 홈으로 버튼 */}
        <Button
          onClick={() => {
            resetQuiz()
            router.push('/')
          }}
          variant="secondary"
          className="w-full py-3 px-4 bg-zinc-500 hover:bg-zinc-600"
        >
          홈으로
        </Button>
      </div>

      {/* WritingModal */}
      {selectedChar && (
        <WritingModal
          isOpen={isModalOpen}
          onClose={closeWritingModal}
          character={selectedChar.char}
          reading={romajiToKorean[selectedChar.romaji] || selectedChar.romaji}
        />
      )}
    </div>
  )
}
