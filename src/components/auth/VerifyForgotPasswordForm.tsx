import { FormEvent, useRef, useState } from 'react'
import { verifyForgotPassword } from '../../api/auth.api'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { AuthBackButton } from './AuthBackButton'
import { apiClient } from '../../lib/apiClient'

export interface VerifyForgotPasswordFormProps {
  email: string
  onSuccess?: () => void
}

export function VerifyForgotPasswordForm({ email, onSuccess }: VerifyForgotPasswordFormProps) {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code')
      return
    }

    setIsLoading(true)
    try {
      const response = await verifyForgotPassword(email, otp)
      const token = apiClient.getAccessToken()
      if (!token) {
        const tokenError = 'OTP verified but reset token was not received. Please try again.'
        setError(tokenError)
        showErrorToast(tokenError)
        return
      }
      const message = response.message || 'OTP verified successfully'
      showSuccessToast(message)
      onSuccess?.()
    } catch (err) {
      const message = getFormErrorMessage(err) || GENERIC_ERROR_MESSAGE
      setError(message)
      showErrorToast(message)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card p-7 md:p-8">
        <AuthBackButton fallbackTo="/forgot-password" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account recovery</p>
        <h2 className="mb-2 mt-1 text-2xl font-semibold text-slate-900">Verify OTP</h2>
        <p className="mb-6 text-sm text-slate-600">
          Enter the reset code sent to <strong>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="text"
            label="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            disabled={isLoading}
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            maxLength={6}
            autoFocus
          />

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading || !otp || otp.length < 4}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </div>
    </div>
  )
}
