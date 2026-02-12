import { useNavigate } from 'react-router-dom'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'
import { AppShell } from '../components/layout/AppShell'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const handleSuccess = (email: string) => {
    navigate('/verify-forgot-password', {
      replace: true,
      state: { email },
    })
  }

  return (
    <AppShell showNavbar={false}>
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </AppShell>
  )
}

export default ForgotPasswordPage

