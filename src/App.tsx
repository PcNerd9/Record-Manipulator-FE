/**
 * App Component
 * Main application component with routing
 */

import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { SessionExpirationHandler } from './components/common/SessionExpirationHandler'
import { Loader } from './components/common/Loader'

/**
 * App
 * Root component with router and error boundary
 */
function App() {
  return (
    <ErrorBoundary>
      <SessionExpirationHandler>
        <Suspense fallback={<Loader size="lg" text="Loading application..." />}>
          <RouterProvider router={router} />
        </Suspense>
      </SessionExpirationHandler>
    </ErrorBoundary>
  )
}

export default App
