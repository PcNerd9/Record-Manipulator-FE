/**
 * Login Form Component
 * Login form with email and password
 */

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
      // Error is handled by auth store
      setLocalError(
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'Login failed'
      )
    }
  }

  const displayError = localError || error

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            error={displayError && !localError ? displayError : undefined}
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
            error={localError || undefined}
            autoComplete="current-password"
          />

          {displayError && !localError && (
            <div className="text-sm text-red-600" role="alert">
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

          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
