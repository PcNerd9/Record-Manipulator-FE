/**
 * App Component
 * Main application component with routing
 */

import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { SessionExpirationHandler } from './components/common/SessionExpirationHandler'
import { ToastContainer } from './components/common/Toast'
import { Loader } from './components/common/Loader'
import { authStore } from './state/auth.store'

/**
 * App
 * Root component with router and error boundary
 */
function App() {
  // Initialize auth once at app level
  useEffect(() => {
    authStore.initialize().catch(console.error)
  }, [])

      return (
        <ErrorBoundary>
          <SessionExpirationHandler>
            <Suspense fallback={<Loader size="lg" text="Loading application..." />}>
              <RouterProvider router={router} />
            </Suspense>
            <ToastContainer />
          </SessionExpirationHandler>
        </ErrorBoundary>
      )
}

export default App
