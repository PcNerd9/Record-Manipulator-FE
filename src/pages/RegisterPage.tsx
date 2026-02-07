/**
 * Register Page
 * Registration page with redirect logic
 */

import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '../components/auth/RegisterForm'
import { AppShell } from '../components/layout/AppShell'

/**
 * Register Page
 * Handles user registration with redirect to verify email page
 */
function RegisterPage() {
  const navigate = useNavigate()

  const handleRegisterSuccess = (email: string) => {
    // Redirect to verify email page with email in state
    navigate('/verify-email', { state: { email }, replace: true })
  }

  return (
    <AppShell showNavbar={false}>
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </AppShell>
  )
}

export default RegisterPage
