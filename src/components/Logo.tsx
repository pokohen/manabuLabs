'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 34 },
    md: { width: 160, height: 45 },
    lg: { width: 200, height: 56 },
  }

  const { width, height } = sizes[size]

  if (!showText) {
    // 아이콘만 표시
    return (
      <picture className={className}>
        <source srcSet="/icon-leaf-only.svg" media="(prefers-color-scheme: dark)" />
        <Image
          src="/icon-leaf-only.svg"
          alt="MANABU LABS"
          width={height}
          height={height}
          priority
        />
      </picture>
    )
  }

  return (
    <div className={className}>
      {/* 라이트 모드 로고 */}
      <Image
        src="/logo-main.svg"
        alt="MANABU LABS"
        width={width}
        height={height}
        priority
        className="block dark:hidden"
      />
      {/* 다크 모드 로고 */}
      <Image
        src="/logo-main-dark.svg"
        alt="MANABU LABS"
        width={width}
        height={height}
        priority
        className="hidden dark:block"
      />
    </div>
  )
}

// 아이콘만 있는 버전 (파비콘, 앱 아이콘용)
export function LogoIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <path
        d="M16 2C12 7 5 12 5 19C5 26 11 30 16 31C21 30 27 26 27 19C27 12 20 7 16 2Z"
        stroke="url(#logoIconGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 12L16 8L21 12"
        stroke="url(#logoIconGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8V25"
        stroke="url(#logoIconGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 25L16 29L21 25"
        stroke="url(#logoIconGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
