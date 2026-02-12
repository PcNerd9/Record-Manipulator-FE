import { FormEvent, useState } from 'react'
import { forgotPassword } from '../../api/auth.api'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { AuthBackButton } from './AuthBackButton'

export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email) {
      setError('Please enter your email')
      return
    }

    setIsLoading(true)
    try {
      const response = await forgotPassword(email.trim())
      const message = response.message || 'OTP sent successfully'
      showSuccessToast(message)
      onSuccess?.(email.trim())
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
        <AuthBackButton fallbackTo="/login" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account recovery</p>
        <h2 className="mb-2 mt-1 text-2xl font-semibold text-slate-900">Forgot Password</h2>
        <p className="mb-6 text-sm text-slate-600">Enter your email to receive a one-time reset code.</p>

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

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading || !email}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      </div>
    </div>
  )
}

