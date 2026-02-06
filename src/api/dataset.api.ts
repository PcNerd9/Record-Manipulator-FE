/**
 * Dataset API module
 * Handles dataset-related API calls (list, detail, upload, delete, export)
 */

import { apiClient } from '../lib/apiClient'
import { API_ENDPOINTS } from '../lib/constants'
import type {
  Dataset,
  DatasetListItem,
  DatasetListResponse,
  DatasetDetailResponse,
  UploadDatasetResponse,
  ExportFormat,
} from '../types/dataset.types'
import type { ApiResponse } from '../types/api.types'

/**
 * Get list of datasets for current user
 */
export async function getDatasets(): Promise<DatasetListItem[]> {
  const response = await apiClient.get<ApiResponse<DatasetListResponse>>(
    API_ENDPOINTS.DATASETS.LIST
  )

  // Handle both response formats
  if (response.data?.datasets) {
    return response.data.datasets
  }
  if (Array.isArray(response.data)) {
    return response.data
  }
  return []
}

/**
 * Get single dataset by ID (includes schema)
 */
export async function getDataset(id: string): Promise<Dataset> {
  const response = await apiClient.get<ApiResponse<DatasetDetailResponse>>(
    API_ENDPOINTS.DATASETS.DETAIL(id)
  )

  return response.data || response
}

/**
 * Upload a dataset file (CSV/Excel)
 * Returns dataset_id after processing
 */
export async function uploadDataset(file: File): Promise<UploadDatasetResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<UploadDatasetResponse>>(
    API_ENDPOINTS.DATASETS.UPLOAD,
    formData,
    {
      // Don't set Content-Type header for FormData (browser will set it with boundary)
      headers: {},
    }
  )

  return response.data || response
}

/**
 * Delete a dataset by ID
 */
export async function deleteDataset(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.DATASETS.DELETE(id))
}

/**
 * Export dataset as CSV or Excel
 * Returns blob for download
 * Uses direct fetch to handle blob response
 */
export async function exportDataset(
  id: string,
  format: ExportFormat
): Promise<Blob> {
  // Import API_BASE_URL directly since we need it for blob download
  const { API_BASE_URL } = await import('../lib/env')
  const url = `${API_BASE_URL}${API_ENDPOINTS.DATASETS.EXPORT(id, format)}`
  const token = apiClient.getAccessToken()

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw {
      status: response.status,
      message: error.message || 'Export failed',
    }
  }

  return response.blob()
}
