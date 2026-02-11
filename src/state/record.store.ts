/**
 * Record Store
 * Manages records state with pagination and search
 */

import {
  getRecords as getRecordsAPI,
  createRecord as createRecordAPI,
  updateRecords as updateRecordsAPI,
  deleteRecord as deleteRecordAPI,
  searchRecords as searchRecordsAPI,
} from '../api/record.api'
import { DirtyEngine } from '../engines/dirty.engine'
import { PaginationEngine } from '../engines/pagination.engine'
import type { DatasetRecord } from '../types/record.types'

/**
 * Record Store State
 */
interface RecordStoreState {
  records: DatasetRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  search: {
    column: string | null
    value: string | null
  }
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

class RecordStore {
  private state: RecordStoreState = {
    records: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
    search: {
      column: null,
      value: null,
    },
    isLoading: false,
    isUpdating: false,
    error: null,
  }

  private dirtyEngine: DirtyEngine = new DirtyEngine()
  private paginationEngine: PaginationEngine = new PaginationEngine()
  private currentDatasetId: string | null = null

  private listeners: Set<() => void> = new Set()
  private isFetchingRecords = false
  private lastFetchedRecordsDatasetId: string | null = null
  private lastRecordsFetchTime: number | null = null
  private isSearching = false
  private lastSearchKey: string | null = null
  private lastSearchTime: number | null = null
  private readonly FETCH_COOLDOWN = 1000 // 1 second cooldown between fetches

  /**
   * Get current state
   */
  getState(): RecordStoreState {
    return { ...this.state }
  }

  /**
   * Get dirty engine instance
   */
  getDirtyEngine(): DirtyEngine {
    return this.dirtyEngine
  }

  /**
   * Get pagination engine instance
   */
  getPaginationEngine(): PaginationEngine {
    return this.paginationEngine
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * Update state
   */
  private setState(updates: Partial<RecordStoreState>): void {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  /**
   * Fetch records for a dataset
   * Prevents duplicate fetches for the same dataset/page
   * Don't fetch if there's an active search - search handles its own fetching
   */
  async fetchRecords(
    datasetId: string,
    page?: number,
    append: boolean = false,
    force: boolean = false
  ): Promise<void> {
    // Don't fetch if there's an active search (unless forced)
    // This prevents fetchRecords from overriding search results
    if (!force && (this.state.search.column || this.state.search.value)) {
      return
    }

    const currentPage = page || this.state.pagination.page
    const fetchKey = `${datasetId}-${currentPage}-${this.state.search.column || ''}-${this.state.search.value || ''}`

    // Prevent duplicate fetches for the same dataset/page/search
    if (!force && this.isFetchingRecords && this.lastFetchedRecordsDatasetId === fetchKey) {
      return
    }

    // Cooldown check - prevent rapid successive fetches
    if (!force && this.lastFetchedRecordsDatasetId === fetchKey && this.lastRecordsFetchTime) {
      const timeSinceLastFetch = Date.now() - this.lastRecordsFetchTime
      if (timeSinceLastFetch < this.FETCH_COOLDOWN) {
        return
      }
    }

    // If switching datasets, clear previous records
    if (this.currentDatasetId !== datasetId && !append) {
      this.clearRecords()
    }

    this.currentDatasetId = datasetId
    this.isFetchingRecords = true
    this.lastFetchedRecordsDatasetId = fetchKey
    this.setState({ isLoading: true, error: null })

    try {
      const response = await getRecordsAPI(
        datasetId,
        currentPage,
        this.state.pagination.limit,
        this.state.search.column && this.state.search.value
          ? {
              column: this.state.search.column,
              value: this.state.search.value,
            }
          : undefined
      )

      // Update pagination engine
      // Handle both response formats (snake_case and camelCase)
      const meta = {
        page: response.meta.page,
        limit: (response.meta as any).page_size || response.meta.limit,
        total: response.meta.total,
        totalPages: (response.meta as any).total_page || response.meta.totalPages,
        hasNext: (response.meta as any).has_next_page !== undefined 
          ? (response.meta as any).has_next_page 
          : response.meta.hasNext,
        hasPrev: (response.meta as any).has_prev_page !== undefined
          ? (response.meta as any).has_prev_page
          : response.meta.hasPrev
      }

      this.paginationEngine.setMeta(meta)

      // Update records (append for infinite scroll, replace otherwise)
      const records = append
        ? [...this.state.records, ...response.records]
        : response.records
      // Mark records with dirty flag from dirty engine
      const recordsWithDirty = records.map((record) => ({
        ...record,
        dirty: this.dirtyEngine.isDirty(record.id),
      }))

      this.setState({
        records: recordsWithDirty,
        pagination: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          hasMore: meta.hasNext,
        },
        isLoading: false,
        error: null,
      })
      this.lastRecordsFetchTime = Date.now()
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to fetch records'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    } finally {
      this.isFetchingRecords = false
    }
  }

  /**
   * Create a new record
   */
  async createRecord(datasetId: string, data: Record<string, unknown>): Promise<DatasetRecord> {
    if (!datasetId) {
      throw new Error('No dataset ID provided')
    }

    this.setState({ isLoading: true, error: null })

    try {
      const newRecord = await createRecordAPI(datasetId, data)

      // Add to local state at the beginning
      const records = [
        { ...newRecord, dirty: false },
        ...this.state.records,
      ]

      // Update total count
      const total = this.state.pagination.total + 1

      this.setState({
        records,
        pagination: {
          ...this.state.pagination,
          total,
        },
        isLoading: false,
        error: null,
      })

      return newRecord
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to create record'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Update a single record
   */
  updateRecord(recordId: string, data: Record<string, unknown>): void {
    // Merge with existing dirty payload so multiple cell edits per row are preserved.
    this.dirtyEngine.update(recordId, data)

    // Update local state
    const records = this.state.records.map((record) => {
      if (record.id === recordId) {
        return {
          ...record,
          data: { ...record.data, ...data },
          dirty: true,
        }
      }
      return record
    })

    this.setState({ records })
  }

  /**
   * Batch update records (for autosave)
   */
  async updateRecords(records: Array<{ id: string; data: Record<string, unknown> }>): Promise<void> {
    if (!this.currentDatasetId) {
      throw new Error('No active dataset')
    }

    this.setState({ isUpdating: true, error: null })

    try {
      await updateRecordsAPI(this.currentDatasetId, records)

      // Clear dirty flags for updated records
      records.forEach((record) => {
        this.dirtyEngine.clear(record.id)
      })

      // Update local state to remove dirty flags
      const updatedRecords = this.state.records.map((record) => {
        const updated = records.find((r) => r.id === record.id)
        if (updated) {
          return {
            ...record,
            data: { ...record.data, ...updated.data },
            dirty: false,
          }
        }
        return record
      })

      this.setState({
        records: updatedRecords,
        isUpdating: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to update records'

      this.setState({
        isUpdating: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(recordId: string): Promise<void> {
    if (!this.currentDatasetId) {
      throw new Error('No active dataset')
    }

    const currentDatasetId = this.currentDatasetId
    const currentPage = this.state.pagination.page

    this.setState({ isLoading: true, error: null })

    try {
      await deleteRecordAPI(currentDatasetId, recordId)

      // Clear dirty flag if exists
      this.dirtyEngine.clear(recordId)

      // Re-fetch current page to keep frontend state in sync with backend truth.
      await this.fetchRecords(currentDatasetId, currentPage, false, true)

      // If current page becomes empty after deletion, load previous page when possible.
      if (currentPage > 1 && this.state.records.length === 0) {
        const fallbackPage = Math.max(1, currentPage - 1)
        await this.fetchRecords(currentDatasetId, fallbackPage, false, true)
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to delete record'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Search records
   * Prevents duplicate searches for the same query
   */
  async searchRecords(
    datasetId: string,
    column: string,
    value: string,
    sortBy: string | null,
    force: boolean = false
  ): Promise<void> {
    const searchKey = `${datasetId}-${column}-${value}`

    // Prevent duplicate searches for the same query
    if (!force && this.isSearching && this.lastSearchKey === searchKey) {
      return
    }

    // Cooldown check - prevent rapid successive searches
    if (!force && this.lastSearchKey === searchKey && this.lastSearchTime) {
      const timeSinceLastSearch = Date.now() - this.lastSearchTime
      if (timeSinceLastSearch < this.FETCH_COOLDOWN) {
        return
      }
    }

    this.currentDatasetId = datasetId
    this.isSearching = true
    this.lastSearchKey = searchKey

    this.setState({
      isLoading: true,
      error: null,
      search: { column, value },
    })

    // Reset pagination
    this.paginationEngine.reset()

    try {
      const response = await searchRecordsAPI(datasetId, column, value, sortBy)

      // Update pagination engine
      const normalizedMeta = {
        page: response.meta.page,
        limit: (response.meta as any).page_size || response.meta.limit,
        total: response.meta.total,
        totalPages: (response.meta as any).total_page || response.meta.totalPages,
        hasNext: (response.meta as any).has_next_page !== undefined
          ? (response.meta as any).has_next_page
          : response.meta.hasNext,
        hasPrev: (response.meta as any).has_prev_page !== undefined
          ? (response.meta as any).has_prev_page
          : response.meta.hasPrev,
      }
      this.paginationEngine.setMeta(normalizedMeta)

      // Mark records with dirty flag
      const recordsWithDirty = response.records.map((record) => ({
        ...record,
        dirty: this.dirtyEngine.isDirty(record.id),
      }))

      // Handle both response formats (snake_case and camelCase)
      this.setState({
        records: recordsWithDirty,
        pagination: {
          page: normalizedMeta.page,
          limit: normalizedMeta.limit,
          total: normalizedMeta.total,
          totalPages: normalizedMeta.totalPages,
          hasMore: normalizedMeta.hasNext,
        },
        isLoading: false,
        error: null,
      })
      this.lastSearchTime = Date.now()
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Search failed'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    } finally {
      this.isSearching = false
    }
  }

  /**
   * Clear search and refetch all records
   */
  async clearSearch(): Promise<void> {
    this.setState({
      search: { column: null, value: null },
    })
    this.lastSearchKey = null
    this.lastSearchTime = null
    
    // Refetch all records when clearing search
    if (this.currentDatasetId) {
      await this.fetchRecords(this.currentDatasetId, 1, false, true)
    }
  }

  /**
   * Clear records
   */
  clearRecords(): void {
    this.setState({
      records: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      search: {
        column: null,
        value: null,
      },
    })
    this.paginationEngine.reset()
    this.dirtyEngine.clearAll()
    this.currentDatasetId = null
    this.lastFetchedRecordsDatasetId = null
    this.lastRecordsFetchTime = null
    this.lastSearchKey = null
    this.lastSearchTime = null
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null })
  }
}

/**
 * Record Store instance
 */
export const recordStore = new RecordStore()
