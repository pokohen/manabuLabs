import React from 'react'

export type IconName = 'close' | 'speaker' | 'pencil' | 'play' | 'spinner'

interface IconProps {
  name: IconName
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

const icons: Record<IconName, React.ReactNode> = {
  close: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  ),
  speaker: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
    />
  ),
  pencil: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  ),
  play: (
    <path d="M8 5v14l11-7z" />
  ),
  spinner: (
    <>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </>
  ),
}

// 아이콘별 기본 스타일
const iconStyles: Record<IconName, { fill: string; stroke: string }> = {
  close: { fill: 'none', stroke: 'currentColor' },
  speaker: { fill: 'none', stroke: 'currentColor' },
  pencil: { fill: 'none', stroke: 'currentColor' },
  play: { fill: 'currentColor', stroke: 'none' },
  spinner: { fill: 'none', stroke: 'none' },
}

export function Icon({ name, className = '', size = 'md' }: IconProps) {
  const sizeClass = sizeMap[size]
  const style = iconStyles[name]

  return (
    <svg
      viewBox="0 0 24 24"
      fill={style.fill}
      stroke={style.stroke}
      className={`${sizeClass} ${className} ${name === 'spinner' ? 'animate-spin' : ''}`}
    >
      {icons[name]}
    </svg>
  )
}
