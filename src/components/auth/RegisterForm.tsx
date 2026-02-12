/**
 * Register Form Component
 * Registration form with email, first name, last name, password, and confirm password
 */

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../../api/auth.api'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export interface RegisterFormProps {
  onSuccess?: (email: string) => void
}

/**
 * Register Form
 * Handles user registration with validation
 */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): string | null => {
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      return 'Please fill in all fields'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }

    // Password validation
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }

    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      await register(email, firstName, lastName, password)
      // Registration successful, redirect to verify email page
      onSuccess?.(email)
    } catch (err) {
      const errorMessage = getFormErrorMessage(err)
      if (errorMessage) {
        setError(errorMessage)
      } else {
        // 500 error - show generic message in form
        setError(GENERIC_ERROR_MESSAGE)
      }
      // Also show toast for all errors
      const toastMessage = getFormErrorMessage(err) || GENERIC_ERROR_MESSAGE
      showErrorToast(toastMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <div className="surface-card p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Create workspace access</p>
        <h2 className="mt-1 mb-6 text-2xl font-semibold text-slate-900">
          Create your account
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="given-name"
            />

            <Input
              type="text"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !email || !firstName || !lastName || !password || !confirmPassword}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
