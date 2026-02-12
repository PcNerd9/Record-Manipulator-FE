/**
 * Verify OTP Form Component
 * Form for verifying email with OTP code
 */

import { useState, FormEvent, useEffect, useRef } from 'react'
import { verifyOTP, resendOTP } from '../../api/auth.api'
import { getFormErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../common/Toast'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export interface VerifyOTPFormProps {
  email: string
  onSuccess?: () => void
}

/**
 * Verify OTP Form
 * Handles OTP verification
 */
export function VerifyOTPForm({ email, onSuccess }: VerifyOTPFormProps) {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on OTP input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await verifyOTP(email, otp)
      // Check if response indicates success (either response.success or response.message contains success)
      if (response.success || (response.message && response.message.toLowerCase().includes('success'))) {
        // OTP verified successfully
        showSuccessToast('Email verified successfully!')
        onSuccess?.()
        return
      }
      
      // If response has a message but not marked as success, treat as error
      const errorMessage = response.message || 'OTP verification failed'
      setError(errorMessage)
      showErrorToast(errorMessage)
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
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email verification</p>
        <h2 className="mt-1 mb-2 text-2xl font-semibold text-slate-900">
          Verify Your Email
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          We've sent a verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="text"
            label="Enter OTP Code"
            value={otp}
            onChange={(e) => {
              // Only allow numbers and limit length
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(value)
            }}
            required
            disabled={isLoading}
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            maxLength={6}
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
            disabled={isLoading || !otp || otp.length < 4}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="mt-4 text-center text-sm text-slate-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={async () => {
                setIsResending(true)
                setError(null)
                try {
                  const response = await resendOTP(email)
                  if (response.success || response.message) {
                    showSuccessToast(response.message || 'OTP code resent successfully!')
                  }
                } catch (err) {
                  const errorMessage = getFormErrorMessage(err) || GENERIC_ERROR_MESSAGE
                  showErrorToast(errorMessage)
                } finally {
                  setIsResending(false)
                }
              }}
              disabled={isResending || isLoading}
              className="font-semibold text-blue-700 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
