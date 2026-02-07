/**
 * Verify OTP Form Component
 * Form for verifying email with OTP code
 */

import { useState, FormEvent, useEffect, useRef } from 'react'
import { verifyOTP } from '../../api/auth.api'
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

    try {
      const response = await verifyOTP(email, otp)
      if (response.success) {
        // OTP verified successfully
        onSuccess?.()
      } else {
        setError(response.message || 'OTP verification failed')
      }
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'OTP verification failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
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
            <div className="text-sm text-red-600" role="alert">
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

          <div className="text-center text-sm text-gray-600 mt-4">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={() => {
                // TODO: Implement resend OTP functionality
                alert('Resend OTP functionality will be implemented')
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
