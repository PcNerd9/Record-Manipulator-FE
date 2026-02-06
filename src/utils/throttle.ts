/**
 * Throttle utility
 * Limits function execution to at most once per specified time period
 */

/**
 * Throttle function - Type-safe generic implementation
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastExec = now - lastExecTime

    // If enough time has passed, execute immediately
    if (timeSinceLastExec >= delay) {
      fn(...args)
      lastExecTime = now
      
      // Clear any pending timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    } else {
      // Schedule execution for the remaining time
      if (timeoutId === null) {
        const remainingTime = delay - timeSinceLastExec
        timeoutId = setTimeout(() => {
          fn(...args)
          lastExecTime = Date.now()
          timeoutId = null
        }, remainingTime)
      }
    }
  }
}

/**
 * Throttle with leading edge execution
 * Executes immediately on first call, then throttles subsequent calls
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttleLeading<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastExec = now - lastExecTime

    // Execute immediately if enough time has passed
    if (timeSinceLastExec >= delay) {
      fn(...args)
      lastExecTime = now
      
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    } else if (timeoutId === null) {
      // Schedule execution for the remaining time
      const remainingTime = delay - timeSinceLastExec
      timeoutId = setTimeout(() => {
        fn(...args)
        lastExecTime = Date.now()
        timeoutId = null
      }, remainingTime)
    }
  }
}

/**
 * Throttle with trailing edge execution
 * Executes at the end of the delay period
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttleTrailing<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  return function throttled(...args: Parameters<T>) {
    lastArgs = args

    // If no timeout is set, schedule execution
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        if (lastArgs !== null) {
          fn(...lastArgs)
          lastArgs = null
        }
        timeoutId = null
      }, delay)
    }
  }
}
