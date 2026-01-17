'use client'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
}: ToggleProps) {
  const sizeStyles = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translateOn: 'translate-x-5',
      translateOff: 'translate-x-1',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translateOn: 'translate-x-6',
      translateOff: 'translate-x-1',
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-5 w-5',
      translateOn: 'translate-x-8',
      translateOff: 'translate-x-1',
    },
  }

  const styles = sizeStyles[size]

  return (
    <label className={`flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      {label && <span>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex ${styles.track} items-center rounded-full transition-colors focus:outline focus:outline-2 focus:outline-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block ${styles.thumb} transform rounded-full bg-white shadow-md transition-transform ${
            checked ? styles.translateOn : styles.translateOff
          }`}
        />
      </button>
    </label>
  )
}
