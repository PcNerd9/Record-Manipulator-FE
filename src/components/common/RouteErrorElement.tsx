/**
 * Route Error Element
 * Displays errors that occur during route loading or rendering
 */

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Button } from './Button'

/**
 * Route Error Element
 * Handles errors in React Router routes
 */
export function RouteErrorElement() {
  const error = useRouteError()

  let errorMessage = 'An unexpected error occurred'
  let errorDetails: string | null = null

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || `Error ${error.status}`
    errorDetails = error.data?.message || error.data
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorDetails = error.stack || null
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  // Check if it's a module loading error
  const isModuleError = errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('ChunkLoadError')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isModuleError ? 'Failed to Load Page' : 'Something went wrong'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isModuleError
            ? 'The page failed to load. This might be due to a network issue or a cached version. Please try refreshing the page.'
            : errorMessage}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Reload Page
          </Button>
          <Link to="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        </div>
        {import.meta.env.DEV && errorDetails && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
