import { ButtonHTMLAttributes } from 'react'

interface GhostButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive'
  size?: 'sm' | 'md'
}

export default function GhostButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: GhostButtonProps) {
  const baseClasses = 'transition-colors focus:outline-none'
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'
  const variantClasses =
    variant === 'destructive'
      ? 'text-[#cc6666] hover:text-[#dd7777]'
      : 'text-[var(--text-muted)] hover:text-[var(--text)]'

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
