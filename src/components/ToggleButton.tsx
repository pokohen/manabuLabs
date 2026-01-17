import React from 'react'

interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  isSelected: boolean
  onToggle: () => void
  variant?: 'default' | 'pill' | 'tab'
  size?: 'sm' | 'md' | 'lg'
  selectedColor?: 'blue' | 'green' | 'red' | 'purple'
  children: React.ReactNode
}

export function ToggleButton({
  isSelected,
  onToggle,
  variant = 'default',
  size = 'md',
  selectedColor = 'blue',
  children,
  className = '',
  disabled,
  ...props
}: ToggleButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    default: 'rounded-lg border-2',
    pill: 'rounded-full',
    tab: 'rounded-md',
  }

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  }

  const selectedColors = {
    blue: 'bg-blue-600 text-white border-blue-600',
    green: 'bg-green-600 text-white border-green-600',
    red: 'bg-red-600 text-white border-red-600',
    purple: 'bg-purple-600 text-white border-purple-600',
  }

  const unselectedStyles = {
    default: 'bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700',
    pill: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    tab: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
  }

  const stateStyles = isSelected
    ? selectedColors[selectedColor]
    : unselectedStyles[variant]

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${stateStyles} ${className}`.trim()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSelected}
      className={buttonClasses}
      onClick={onToggle}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// ToggleGroup - 여러 ToggleButton을 그룹으로 관리
interface ToggleGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: React.ReactNode }[]
  variant?: 'default' | 'pill' | 'tab'
  size?: 'sm' | 'md' | 'lg'
  selectedColor?: 'blue' | 'green' | 'red' | 'purple'
  className?: string
  buttonClassName?: string
  fullWidth?: boolean
}

export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  variant = 'default',
  size = 'md',
  selectedColor = 'blue',
  className = '',
  buttonClassName = '',
  fullWidth = false,
}: ToggleGroupProps<T>) {
  const containerStyles = fullWidth ? 'flex w-full' : 'inline-flex'
  const gapStyles = variant === 'tab' ? 'gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg' : 'gap-2'

  return (
    <div className={`${containerStyles} ${gapStyles} ${className}`} role="group">
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          isSelected={value === option.value}
          onToggle={() => onChange(option.value)}
          variant={variant}
          size={size}
          selectedColor={selectedColor}
          className={`${fullWidth ? 'flex-1' : ''} ${buttonClassName}`}
        >
          {option.label}
        </ToggleButton>
      ))}
    </div>
  )
}
