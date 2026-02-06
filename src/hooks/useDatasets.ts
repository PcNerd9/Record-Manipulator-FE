/**
 * Dataset Hooks
 * React hooks for dataset management
 */

import { useState, useEffect, useCallback } from 'react'
import { datasetStore } from '../state/dataset.store'
import type { Dataset, DatasetListItem } from '../types/dataset.types'

/**
 * Dataset store state type
 */
interface DatasetStoreState {
  datasets: DatasetListItem[]
  activeDataset: Dataset | null
  isLoading: boolean
  isUploading: boolean
  error: string | null
}

/**
 * Use datasets hook
 * Returns dataset list and actions
 */
export function useDatasets() {
  const [state, setState] = useState<DatasetStoreState>(() =>
    datasetStore.getState()
  )

  useEffect(() => {
    const unsubscribe = datasetStore.subscribe(() => {
      setState(datasetStore.getState())
    })

    // Fetch datasets on mount
    datasetStore.fetchDatasets().catch(console.error)

    return unsubscribe
  }, [])

  const fetchDatasets = useCallback(() => {
    return datasetStore.fetchDatasets()
  }, [])

  const setActiveDataset = useCallback((datasetId: string) => {
    return datasetStore.setActiveDataset(datasetId)
  }, [])

  const uploadDataset = useCallback((file: File) => {
    return datasetStore.uploadDataset(file)
  }, [])

  const deleteDataset = useCallback((datasetId: string) => {
    return datasetStore.deleteDataset(datasetId)
  }, [])

  const clearActiveDataset = useCallback(() => {
    datasetStore.clearActiveDataset()
  }, [])

  const clearError = useCallback(() => {
    datasetStore.clearError()
  }, [])

  return {
    ...state,
    fetchDatasets,
    setActiveDataset,
    uploadDataset,
    deleteDataset,
    clearActiveDataset,
    clearError,
  }
}

/**
 * Use single dataset hook
 * Returns a specific dataset by ID
 */
export function useDataset(datasetId: string | null) {
  const { activeDataset, isLoading, error, setActiveDataset } = useDatasets()
  const [localDataset, setLocalDataset] = useState<Dataset | null>(null)

  useEffect(() => {
    if (!datasetId) {
      setLocalDataset(null)
      return
    }

    // If active dataset matches, use it
    if (activeDataset?.id === datasetId) {
      setLocalDataset(activeDataset)
      return
    }

    // Otherwise, fetch it
    setActiveDataset(datasetId)
      .then(() => {
        const state = datasetStore.getState()
        if (state.activeDataset?.id === datasetId) {
          setLocalDataset(state.activeDataset)
        }
      })
      .catch(console.error)
  }, [datasetId, activeDataset, setActiveDataset])

  return {
    dataset: localDataset || (activeDataset?.id === datasetId ? activeDataset : null),
    isLoading,
    error,
  }
}
