/**
 * Login Form Component
 * Login form with email and password
 */

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export interface LoginFormProps {
  onSuccess?: () => void
}

/**
 * Login Form
 * Handles user authentication
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    try {
      await login(email, password)
      onSuccess?.()
    } catch (err) {
      const errorMessage = getFormErrorMessage(err)
      if (errorMessage) {
        setLocalError(errorMessage)
      } else {
        // 500 error - show generic message in form
        setLocalError(GENERIC_ERROR_MESSAGE)
      }
      // Also show toast for all errors
      const toastMessage = getFormErrorMessage(err) || GENERIC_ERROR_MESSAGE
      showErrorToast(toastMessage)
    }
  }

  const displayError = localError || error

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Welcome back</p>
        <h2 className="mt-1 mb-6 text-2xl font-semibold text-slate-900">
          Sign in to your workspace
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            autoFocus
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />

          {displayError && !localError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {displayError}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
