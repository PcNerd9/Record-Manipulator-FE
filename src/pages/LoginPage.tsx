/**
 * Login Page
 * Login page with redirect logic
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import { AppShell } from '../components/layout/AppShell'
import { showSuccessToast } from '../components/common/Toast'

/**
 * Login Page
 * Handles user login with redirect if already authenticated
 */
function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check for success message from verify email page
  useEffect(() => {
    const message = (location.state as { message?: string })?.message
    if (message) {
      // Show success message using toast
      showSuccessToast(message)
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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
