/**
 * Button Component
 * Reusable button component with variants and states
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-700 text-white border border-blue-700 hover:bg-blue-800 hover:border-blue-800 focus:ring-blue-500 disabled:bg-blue-300 disabled:border-blue-300',
  secondary:
    'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 focus:ring-slate-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200',
  danger:
    'bg-red-700 text-white border border-red-700 hover:bg-red-800 hover:border-red-800 focus:ring-red-500 disabled:bg-red-300 disabled:border-red-300',
  outline:
    'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 disabled:border-slate-200 disabled:text-slate-400',
  ghost:
    'bg-transparent border border-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 disabled:text-slate-400',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white transition-colors duration-150 disabled:cursor-not-allowed whitespace-nowrap'

    const variantStyle = variantStyles[variant]
    const sizeStyle = sizeStyles[size]
    const widthStyle = fullWidth ? 'w-full' : ''
    const loadingStyle = isLoading ? 'cursor-wait' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${loadingStyle} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
