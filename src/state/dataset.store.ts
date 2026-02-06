/**
 * Dataset Store
 * Manages dataset list and active dataset state
 */

import {
  getDatasets as getDatasetsAPI,
  getDataset as getDatasetAPI,
  uploadDataset as uploadDatasetAPI,
  deleteDataset as deleteDatasetAPI,
} from '../api/dataset.api'
import type {
  Dataset,
  DatasetListItem,
  UploadDatasetResponse,
} from '../types/dataset.types'

/**
 * Dataset Store State
 */
interface DatasetStoreState {
  datasets: DatasetListItem[]
  activeDataset: Dataset | null
  isLoading: boolean
  isUploading: boolean
  error: string | null
}

class DatasetStore {
  private state: DatasetStoreState = {
    datasets: [],
    activeDataset: null,
    isLoading: false,
    isUploading: false,
    error: null,
  }

  private listeners: Set<() => void> = new Set()

  /**
   * Get current state
   */
  getState(): DatasetStoreState {
    return { ...this.state }
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
  private setState(updates: Partial<DatasetStoreState>): void {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  /**
   * Fetch datasets list
   */
  async fetchDatasets(): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      const datasets = await getDatasetsAPI()
      this.setState({
        datasets,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to fetch datasets'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Set active dataset
   */
  async setActiveDataset(datasetId: string): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      const dataset = await getDatasetAPI(datasetId)
      this.setState({
        activeDataset: dataset,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to fetch dataset'

      this.setState({
        activeDataset: null,
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Add dataset to list (after upload)
   */
  addDataset(dataset: DatasetListItem): void {
    const datasets = [...this.state.datasets, dataset]
    this.setState({ datasets })
  }

  /**
   * Upload dataset
   */
  async uploadDataset(file: File): Promise<UploadDatasetResponse> {
    this.setState({ isUploading: true, error: null })

    try {
      const response = await uploadDatasetAPI(file)

      // Fetch updated dataset list
      await this.fetchDatasets()

      this.setState({ isUploading: false, error: null })
      return response
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Upload failed'

      this.setState({
        isUploading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Delete dataset
   */
  async deleteDataset(datasetId: string): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      await deleteDatasetAPI(datasetId)

      // Remove from list
      const datasets = this.state.datasets.filter((d) => d.id !== datasetId)

      // Clear active dataset if it was deleted
      const activeDataset =
        this.state.activeDataset?.id === datasetId
          ? null
          : this.state.activeDataset

      this.setState({
        datasets,
        activeDataset,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to delete dataset'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Clear active dataset
   */
  clearActiveDataset(): void {
    this.setState({ activeDataset: null })
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null })
  }
}

/**
 * Dataset Store instance
 */
export const datasetStore = new DatasetStore()
