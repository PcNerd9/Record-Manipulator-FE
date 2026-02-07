/**
 * Login Page
 * Login page with redirect logic
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import { AppShell } from '../components/layout/AppShell'

/**
 * Login Page
 * Handles user login with redirect if already authenticated
 */
function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/dashboard', { replace: true })
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <AppShell showNavbar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  // Don't show login form if already authenticated (ProtectedRoute handles redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <AppShell showNavbar={false}>
      <LoginForm onSuccess={handleLoginSuccess} />
    </AppShell>
  )
}

export default LoginPage
