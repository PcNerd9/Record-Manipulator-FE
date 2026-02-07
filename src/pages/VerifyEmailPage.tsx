/**
 * Verify Email Page
 * Page for verifying email with OTP
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { VerifyOTPForm } from '../components/auth/VerifyOTPForm'
import { AppShell } from '../components/layout/AppShell'

/**
 * Verify Email Page
 * Handles OTP verification with redirect to login page
 */
function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get email from location state (passed from register page)
  const email = (location.state as { email?: string })?.email

  const handleVerificationSuccess = () => {
    // Redirect to login page after successful verification
    navigate('/login', {
      replace: true,
      state: { message: 'Email verified successfully! Please login.' },
    })
  }

  // If no email in state, redirect to register page
  if (!email) {
    return (
      <AppShell showNavbar={false}>
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                No email found. Please register first.
              </p>
              <button
                onClick={() => navigate('/register', { replace: true })}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Go to Registration
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showNavbar={false}>
      <VerifyOTPForm email={email} onSuccess={handleVerificationSuccess} />
    </AppShell>
  )
}

export default VerifyEmailPage
