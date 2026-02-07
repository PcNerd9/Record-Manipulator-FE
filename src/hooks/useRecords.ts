/**
 * Record Hooks
 * React hooks for record management
 */

import { useState, useEffect, useCallback } from 'react'
import { recordStore } from '../state/record.store'
import type { DatasetRecord } from '../types/record.types'

/**
 * Record store state type
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

/**
 * Use records hook
 * Returns records and pagination for a dataset
 */
export function useRecords(datasetId: string | null) {
  const [state, setState] = useState<RecordStoreState>(() =>
    recordStore.getState()
  )

  useEffect(() => {
    const unsubscribe = recordStore.subscribe(() => {
      setState(recordStore.getState())
    })

    return unsubscribe
  }, [])

  // Fetch records when datasetId changes
  // Don't fetch if there's an active search - let search handle it
  useEffect(() => {
    if (!datasetId) {
      recordStore.clearRecords()
      return
    }

    // Only fetch if not already loading and datasetId actually changed
    // Don't fetch if there's an active search - search will handle fetching
    // Also check if records are already loaded to prevent unnecessary fetches
    const currentState = recordStore.getState()
    const hasActiveSearch = currentState.search.column || currentState.search.value
    const hasRecords = currentState.records.length > 0
    
    // Only fetch on initial load (no records and no search)
    // This prevents fetchRecords from overriding search results
    if (!currentState.isLoading && !hasActiveSearch && !hasRecords) {
      recordStore.fetchRecords(datasetId).catch(console.error)
    }
  }, [datasetId])

  const fetchRecords = useCallback(
    (page?: number, append: boolean = false) => {
      if (!datasetId) return Promise.resolve()
      return recordStore.fetchRecords(datasetId, page, append)
    },
    [datasetId]
  )

  const createRecord = useCallback(
    (data: Record<string, unknown>) => {
      if (!datasetId) return Promise.resolve({} as DatasetRecord)
      return recordStore.createRecord(datasetId, data)
    },
    [datasetId]
  )

  const updateRecord = useCallback(
    (recordId: string, data: Record<string, unknown>) => {
      recordStore.updateRecord(recordId, data)
    },
    []
  )

  const deleteRecord = useCallback(
    (recordId: string) => {
      if (!datasetId) return Promise.resolve()
      return recordStore.deleteRecord(recordId)
    },
    [datasetId]
  )

  const searchRecords = useCallback(
    (column: string, value: string) => {
      if (!datasetId) return Promise.resolve()
      return recordStore.searchRecords(datasetId, column, value)
    },
    [datasetId]
  )

  const clearSearch = useCallback(async () => {
    if (!datasetId) return
    await recordStore.clearSearch()
  }, [datasetId])

  const clearError = useCallback(() => {
    recordStore.clearError()
  }, [])

  // Get dirty engine for direct access if needed
  const getDirtyEngine = useCallback(() => {
    return recordStore.getDirtyEngine()
  }, [])

  // Get pagination engine for direct access if needed
  const getPaginationEngine = useCallback(() => {
    return recordStore.getPaginationEngine()
  }, [])

  return {
    ...state,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    clearSearch,
    clearError,
    getDirtyEngine,
    getPaginationEngine,
  }
}

/**
 * Use single record hook
 * Returns a specific record by ID
 */
export function useRecord(datasetId: string | null, recordId: string | null) {
  const { records, isLoading, error } = useRecords(datasetId)

  const record = records.find((r) => r.id === recordId) || null

  return {
    record,
    isLoading,
    error,
  }
}
