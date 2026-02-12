/**
 * Infinite Scroll Hook
 * React hook for detecting scroll and triggering pagination
 */

import { useEffect, useRef, useCallback } from 'react'
import { PaginationEngine } from '../engines/pagination.engine'

/**
 * Use infinite scroll hook options
 */
interface UseInfiniteScrollOptions {
  /**
   * Callback to execute when scroll reaches threshold
   */
  onLoadMore: () => void | Promise<void>

  /**
   * Whether infinite scroll is enabled
   */
  enabled?: boolean

  /**
   * Threshold in pixels from bottom to trigger load more
   */
  threshold?: number

  /**
   * Pagination engine instance (optional)
   * If provided, will check hasMore before triggering
   */
  paginationEngine?: PaginationEngine
}

/**
 * Use infinite scroll hook
 * Detects when user scrolls near bottom and triggers callback
 */
export function useInfiniteScroll({
  onLoadMore,
  enabled = true,
  threshold = 200,
  paginationEngine,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)

  const handleScroll = useCallback(() => {
    if (!enabled || isLoadingRef.current) return

    const element = containerRef.current
    if (!element) return

    // Check if pagination engine has more pages
    if (paginationEngine && !paginationEngine.hasMorePages()) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = element
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom <= threshold) {
      isLoadingRef.current = true

      Promise.resolve(onLoadMore())
        .finally(() => {
          isLoadingRef.current = false
        })
        .catch(console.error)
    }
  }, [enabled, threshold, onLoadMore, paginationEngine])

  useEffect(() => {
    if (!enabled) return

    const element = containerRef.current
    if (!element) return

    element.addEventListener('scroll', handleScroll, { passive: true })

    // Initial check in case content is already scrolled
    handleScroll()

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, handleScroll])

  return {
    containerRef,
  }
}

/**
 * Use infinite scroll with window scroll
 * Detects when user scrolls near bottom of window
 */
export function useInfiniteScrollWindow({
  onLoadMore,
  enabled = true,
  threshold = 200,
  paginationEngine,
}: UseInfiniteScrollOptions) {
  const isLoadingRef = useRef(false)

  const handleScroll = useCallback(() => {
    if (!enabled || isLoadingRef.current) return

    // Check if pagination engine has more pages
    if (paginationEngine && !paginationEngine.hasMorePages()) {
      return
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom <= threshold) {
      isLoadingRef.current = true

      Promise.resolve(onLoadMore())
        .finally(() => {
          isLoadingRef.current = false
        })
        .catch(console.error)
    }
  }, [enabled, threshold, onLoadMore, paginationEngine])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, handleScroll])

  return {}
}
