import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'
import { AppShell } from '../components/layout/AppShell'
import { apiClient } from '../lib/apiClient'

function ResetPasswordPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = apiClient.getAccessToken()
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleSuccess = () => {
    apiClient.clearAccessToken()
    navigate('/login', {
      replace: true,
      state: { message: 'Password reset successful. Please login.' },
    })
  }

  return (
    <AppShell showNavbar={false}>
      <ResetPasswordForm onSuccess={handleSuccess} />
    </AppShell>
  )
}

export default ResetPasswordPage

