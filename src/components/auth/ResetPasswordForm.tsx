import { FormEvent, useState } from 'react'
import { resetPassword } from '../../api/auth.api'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { AuthBackButton } from './AuthBackButton'

export interface ResetPasswordFormProps {
  onSuccess?: () => void
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (): string | null => {
    if (!password || !confirmPassword) {
      return 'Please fill in all fields'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const response = await resetPassword(password)
      showSuccessToast(response.message || 'Password reset successful')
      onSuccess?.()
    } catch (err) {
      const message = getFormErrorMessage(err) || GENERIC_ERROR_MESSAGE
      setError(message)
      showErrorToast(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card p-7 md:p-8">
        <AuthBackButton fallbackTo="/verify-forgot-password" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account recovery</p>
        <h2 className="mb-2 mt-1 text-2xl font-semibold text-slate-900">Reset Password</h2>
        <p className="mb-6 text-sm text-slate-600">Set a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            showPasswordToggle
          />
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            showPasswordToggle
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
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
