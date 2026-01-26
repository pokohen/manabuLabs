'use client'

// 현재 재생 중인 오디오
let currentAudio: HTMLAudioElement | null = null

// Google Cloud TTS API 호출
export async function speakJapanese(text: string) {
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
export function SpeakerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

// 스피커 버튼 컴포넌트
interface SpeakerButtonProps {
  text: string
  className?: string
  iconClassName?: string
  title?: string
}

export default function SpeakerButton({
  text,
  className = "p-2 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer",
  iconClassName = "w-5 h-5",
  title = "문장 듣기"
}: SpeakerButtonProps) {
  return (
    <button
      onClick={() => speakJapanese(text)}
      className={className}
      title={title}
    >
      <SpeakerIcon className={iconClassName} />
    </button>
  )
}
