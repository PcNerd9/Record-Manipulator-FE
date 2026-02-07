/**
 * Router Configuration
 * Application routing with protected routes
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useState, useEffect } from 'react'
import { authStore } from '../state/auth.store'
import { Loader } from '../components/common/Loader'
import { RouteErrorElement } from '../components/common/RouteErrorElement'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const UploadPage = lazy(() => import('../pages/UploadPage'))
const DatasetPage = lazy(() => import('../pages/DatasetPage'))

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(() => authStore.getState())

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setAuthState(authStore.getState())
    })

    // Don't initialize here - let useAuth hook handle it
    // This prevents duplicate initialization calls

    return unsubscribe
  }, [])

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Public Route Component
 * Redirects to dashboard if already authenticated
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(() => authStore.getState())

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setAuthState(authStore.getState())
    })

    // Don't initialize here - let useAuth hook handle it
    // This prevents duplicate initialization calls

    return unsubscribe
  }, [])

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/**
 * Router configuration
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<Loader size="lg" text="Loading..." />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader size="lg" text="Loading..." />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/upload',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader size="lg" text="Loading..." />}>
          <UploadPage />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/dataset/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader size="lg" text="Loading..." />}>
          <DatasetPage />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
