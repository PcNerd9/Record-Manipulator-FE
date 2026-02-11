/**
 * Record Hooks
 * React hooks for record management
 */

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const previousDatasetIdRef = useRef<string | null>(null)

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
      previousDatasetIdRef.current = null
      return
    }

    const previousDatasetId = previousDatasetIdRef.current
    const currentState = recordStore.getState()

    // Dataset changed: force a fresh first-page fetch to avoid showing stale records.
    if (previousDatasetId !== datasetId) {
      previousDatasetIdRef.current = datasetId
      recordStore.fetchRecords(datasetId, 1, false, true).catch(console.error)
      return
    }

    // Same dataset: initial load only when empty and not in search mode.
    const hasActiveSearch = currentState.search.column || currentState.search.value
    const hasRecords = currentState.records.length > 0
    if (!currentState.isLoading && !hasActiveSearch && !hasRecords) {
      recordStore.fetchRecords(datasetId, 1, false).catch(console.error)
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
    (column: string, value: string, sortBy: string | null) => {
      if (!datasetId) return Promise.resolve()
      return recordStore.searchRecords(datasetId, column, value, sortBy)
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
