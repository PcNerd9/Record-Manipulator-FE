/**
 * Record Store
 * Manages records state with pagination and search
 */

import {
  getRecords as getRecordsAPI,
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
   */
  async fetchRecords(
    datasetId: string,
    page?: number,
    append: boolean = false,
    force: boolean = false
  ): Promise<void> {
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
      this.paginationEngine.setMeta(response.meta)

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
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasMore: response.meta.hasNext,
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
   * Update a single record
   */
  updateRecord(recordId: string, data: Record<string, unknown>): void {
    // Mark as dirty
    this.dirtyEngine.mark(recordId, data)

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

    this.setState({ isLoading: true, error: null })

    try {
      await deleteRecordAPI(this.currentDatasetId, recordId)

      // Remove from local state
      const records = this.state.records.filter((r) => r.id !== recordId)

      // Clear dirty flag if exists
      this.dirtyEngine.clear(recordId)

      // Update total count
      const total = Math.max(0, this.state.pagination.total - 1)

      this.setState({
        records,
        pagination: {
          ...this.state.pagination,
          total,
        },
        isLoading: false,
        error: null,
      })
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
      const response = await searchRecordsAPI(datasetId, column, value)

      // Update pagination engine
      this.paginationEngine.setMeta(response.meta)

      // Mark records with dirty flag
      const recordsWithDirty = response.records.map((record) => ({
        ...record,
        dirty: this.dirtyEngine.isDirty(record.id),
      }))

      this.setState({
        records: recordsWithDirty,
        pagination: {
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasMore: response.meta.hasNext,
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
   * Clear search
   */
  clearSearch(): void {
    this.setState({
      search: { column: null, value: null },
    })
    this.lastSearchKey = null
    this.lastSearchTime = null
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
    })
    this.paginationEngine.reset()
    this.dirtyEngine.clearAll()
    this.currentDatasetId = null
    this.lastFetchedRecordsDatasetId = null
    this.lastRecordsFetchTime = null
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
