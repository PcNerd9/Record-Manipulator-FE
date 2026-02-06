/**
 * Environment configuration utilities
 * Handles environment variables and configuration
 */

/**
 * Get environment variable with optional default value
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key]
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

/**
 * Check if running in development mode
 */
export const isDev = (): boolean => {
  return import.meta.env.MODE === 'development'
}

/**
 * Check if running in production mode
 */
export const isProd = (): boolean => {
  return import.meta.env.MODE === 'production'
}

/**
 * API base URL from environment
 * Defaults to http://localhost:8000 in development
 */
export const API_BASE_URL = getEnv(
  'VITE_API_BASE_URL',
  isDev() ? 'http://localhost:8000' : ''
)

/**
 * Environment configuration object
 */
export const env = {
  isDev: isDev(),
  isProd: isProd(),
  apiBaseUrl: API_BASE_URL,
} as const
