/**
 * Debounce utility
 * Delays function execution until after a specified time has passed
 * since the last time it was invoked
 */

/**
 * Debounce function - Type-safe generic implementation
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>) {
    // Clear previous timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Debounce with immediate execution option
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @param immediate - If true, execute immediately on first call
 * @returns Debounced function
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let hasExecuted = false

  return function debounced(...args: Parameters<T>) {
    const callNow = immediate && !hasExecuted

    // Clear previous timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      if (!immediate) {
        fn(...args)
      }
      timeoutId = null
      hasExecuted = false
    }, delay)

    // Execute immediately if immediate flag is set
    if (callNow) {
      fn(...args)
      hasExecuted = true
    }
  }
}
