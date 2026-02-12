import { useLocation, useNavigate } from 'react-router-dom'
import { VerifyForgotPasswordForm } from '../components/auth/VerifyForgotPasswordForm'
import { AppShell } from '../components/layout/AppShell'

function VerifyForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  if (!email) {
    return (
      <AppShell showNavbar={false}>
        <div className="mx-auto w-full max-w-md">
          <div className="surface-card p-7 md:p-8">
            <p className="mb-4 text-sm text-red-700">No email found. Please request a reset code first.</p>
            <button
              type="button"
              onClick={() => navigate('/forgot-password', { replace: true })}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Go to Forgot Password
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  const handleSuccess = () => {
    navigate('/reset-password', {
      replace: true,
      state: { email },
    })
  }

  return (
    <AppShell showNavbar={false}>
      <VerifyForgotPasswordForm email={email} onSuccess={handleSuccess} />
    </AppShell>
  )
}

export default VerifyForgotPasswordPage

