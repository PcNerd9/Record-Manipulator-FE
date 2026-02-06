/**
 * Pagination Engine
 * Manages pagination state and navigation
 */

/**
 * Pagination Engine class
 * Tracks current page, limit, and whether more pages are available
 */
export class PaginationEngine {
  private page: number = 1
  private limit: number = 50
  private hasMore: boolean = true
  private total: number = 0
  private totalPages: number = 0

  /**
   * Constructor
   * @param initialPage - Initial page number (default: 1)
   * @param initialLimit - Initial limit per page (default: 50)
   */
  constructor(initialPage: number = 1, initialLimit: number = 50) {
    this.page = initialPage
    this.limit = initialLimit
  }

  /**
   * Get current page number
   * @returns Current page
   */
  getCurrentPage(): number {
    return this.page
  }

  /**
   * Get current limit
   * @returns Current limit
   */
  getLimit(): number {
    return this.limit
  }

  /**
   * Get total number of items
   * @returns Total count
   */
  getTotal(): number {
    return this.total
  }

  /**
   * Get total number of pages
   * @returns Total pages
   */
  getTotalPages(): number {
    return this.totalPages
  }

  /**
   * Check if there are more pages
   * @returns True if more pages are available
   */
  hasMorePages(): boolean {
    return this.hasMore
  }

  /**
   * Move to next page
   * @returns Next page number or null if no more pages
   */
  next(): number | null {
    if (!this.hasMore) {
      return null
    }

    this.page += 1
    return this.page
  }

  /**
   * Move to previous page
   * @returns Previous page number or null if already on first page
   */
  prev(): number | null {
    if (this.page <= 1) {
      return null
    }

    this.page -= 1
    return this.page
  }

  /**
   * Go to specific page
   * @param page - Page number to go to
   * @returns Page number or null if invalid
   */
  goToPage(page: number): number | null {
    if (page < 1) {
      return null
    }

    if (this.totalPages > 0 && page > this.totalPages) {
      return null
    }

    this.page = page
    return this.page
  }

  /**
   * Set pagination metadata
   * Updates pagination state from API response
   * @param meta - Pagination metadata
   */
  setMeta(meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }): void {
    this.page = meta.page
    this.limit = meta.limit
    this.total = meta.total
    this.totalPages = meta.totalPages
    this.hasMore = meta.hasNext
  }

  /**
   * Set hasMore flag
   * @param hasMore - Whether more pages are available
   */
  setHasMore(hasMore: boolean): void {
    this.hasMore = hasMore
  }

  /**
   * Set limit
   * @param limit - Items per page
   */
  setLimit(limit: number): void {
    this.limit = limit
  }

  /**
   * Reset pagination to initial state
   */
  reset(): void {
    this.page = 1
    this.hasMore = true
    this.total = 0
    this.totalPages = 0
  }

  /**
   * Get pagination state
   * @returns Current pagination state
   */
  getState() {
    return {
      page: this.page,
      limit: this.limit,
      hasMore: this.hasMore,
      total: this.total,
      totalPages: this.totalPages,
    }
  }
}
