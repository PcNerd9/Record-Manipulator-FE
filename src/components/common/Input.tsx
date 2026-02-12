/**
 * Input Component
 * Reusable input component with types, error states, and labels
 */

import { InputHTMLAttributes, forwardRef, useState } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  showPasswordToggle?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      showPasswordToggle = false,
      className = '',
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const canTogglePassword = showPasswordToggle && type === 'password'
    const inputType = canTogglePassword && isPasswordVisible ? 'text' : type

    const baseInputStyles =
      'block h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200'
    const errorInputStyles = hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : ''
    const widthStyles = fullWidth ? 'w-full' : ''
    const togglePadding = canTogglePassword ? 'pr-10' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`${baseInputStyles} ${errorInputStyles} ${widthStyles} ${togglePadding} ${className}`}
            aria-invalid={hasError}
            aria-describedby={
              error || helperText
                ? `${inputId}-${error ? 'error' : 'helper'}`
                : undefined
            }
            {...props}
          />
          {canTogglePassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-2 inline-flex items-center justify-center text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              tabIndex={-1}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3.53 2.47a.75.75 0 10-1.06 1.06l14 14a.75.75 0 101.06-1.06l-2.436-2.436A9.478 9.478 0 0018 10s-2.5-5-8-5a8.79 8.79 0 00-3.589.747L3.53 2.47zM10 6.5c2.073 0 3.75 1.677 3.75 3.75 0 .669-.175 1.297-.482 1.842l-5.11-5.11A3.734 3.734 0 0110 6.5z" />
                  <path d="M2 10s1.22 2.44 3.882 4.02l1.086-1.086A3.75 3.75 0 0110 6.5a3.734 3.734 0 011.934.537l1.221-1.221A8.974 8.974 0 0010 5C4.5 5 2 10 2 10zm8 3.5a3.734 3.734 0 01-1.842-.482l4.824-4.824A3.75 3.75 0 0110 13.5z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 5c5.5 0 8 5 8 5s-2.5 5-8 5-8-5-8-5 2.5-5 8-5zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 1.5a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs font-medium text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
