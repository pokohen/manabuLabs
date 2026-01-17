import React from 'react'
import { Icon, IconName } from './Icon'

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName
  label: string // 접근성을 위한 aria-label
  variant?: 'default' | 'ghost' | 'outline' | 'text'
  size?: 'sm' | 'md' | 'lg'
  leading?: string // 아이콘 앞에 표시할 텍스트
  trailing?: string // 아이콘 뒤에 표시할 텍스트
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  leading,
  trailing,
  ...props
}: IconButtonProps) {
  const hasText = leading || trailing

  const baseStyles =
    'inline-flex items-center justify-center transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ghost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    outline: 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    text: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  }

  // 텍스트가 있으면 rounded-lg, 없으면 rounded-full
  const shapeStyles = hasText ? 'rounded-lg' : 'rounded-full'

  // 텍스트가 있을 때와 없을 때 패딩 다르게
  const sizeStyles = hasText
    ? {
        sm: 'px-2 py-1.5 gap-1',
        md: 'px-3 py-2 gap-1.5',
        lg: 'px-4 py-3 gap-2',
      }
    : {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
      }

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const iconSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  }

  const buttonClasses = `${baseStyles} ${shapeStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...props}
    >
      {leading && <span className={textSizeStyles[size]}>{leading}</span>}
      <Icon name={icon} size={iconSizeMap[size]} />
      {trailing && <span className={textSizeStyles[size]}>{trailing}</span>}
    </button>
  )
}
