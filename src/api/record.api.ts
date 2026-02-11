/**
 * Record API module
 * Handles record-related API calls (list, update, delete, search)
 */

import { apiClient } from '../lib/apiClient'
import { API_ENDPOINTS, PAGINATION } from '../lib/constants'
import type {
  RecordListResponse,
  RecordUpdatePayload,
  BatchUpdateRequest,
  SearchRecordsRequest,
  DeleteRecordResponse,
  DatasetRecord,
} from '../types/record.types'
import type { ApiResponse } from '../types/api.types'

/**
 * Get paginated records for a dataset
 */
export async function getRecords(
  datasetId: string,
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  search?: { column: string; value: string }
): Promise<RecordListResponse> {
  let url = `${API_ENDPOINTS.RECORDS.LIST(datasetId)}?page=${page}&page_size=${limit}`

  // Add search parameters if provided
  if (search) {
    url += `&column=${encodeURIComponent(search.column)}&value=${encodeURIComponent(search.value)}`
  }

  const response = await apiClient.get<ApiResponse<RecordListResponse>>(url)

  // Normalize response format
  if (response.data) {
    return response.data
  }

  // Handle direct response format
  if ('records' in response && 'meta' in response) {
    return response as RecordListResponse
  }

  // Fallback: wrap in expected format
  return {
    records: Array.isArray(response) ? response : [],
    meta: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }
}

/**
 * Batch update records (used for autosave)
 * Updates multiple records in a single request
 */
export async function updateRecords(
  datasetId: string,
  records: RecordUpdatePayload[]
): Promise<{ success: boolean; message?: string }> {
  const payload: BatchUpdateRequest = { records }
  console.log(payload)
  const response = await apiClient.put<ApiResponse<{ success: boolean; message?: string }>>(
    API_ENDPOINTS.RECORDS.UPDATE(datasetId),
    payload
  )

  return response.data || { success: true }
}

/**
 * Create a new record
 */
export async function createRecord(
  datasetId: string,
  data: Record<string, unknown>
): Promise<DatasetRecord> {
  const response = await apiClient.post<ApiResponse<DatasetRecord>>(
    API_ENDPOINTS.RECORDS.CREATE(datasetId),
    { data }
  )

  return response.data || response
}

/**
 * Delete a single record
 */
export async function deleteRecord(
  datasetId: string,
  recordId: string
): Promise<DeleteRecordResponse> {
  const response = await apiClient.delete<ApiResponse<DeleteRecordResponse>>(
    API_ENDPOINTS.RECORDS.DELETE(datasetId, recordId)
  )

  return response.data || { success: true, message: 'Record deleted' }
}

/**
 * Search records by column and value
 */
export async function searchRecords(
  datasetId: string,
  column: string,
  value: string,
  sortBy: string | null,
): Promise<RecordListResponse> {
  const payload: SearchRecordsRequest = { column, value }

  let url = `${API_ENDPOINTS.RECORDS.SEARCH(datasetId)}?key=${payload.column}&value=${payload.value}`
  if (sortBy) {
    url = `${url}&sort=${sortBy}`
  }
  const response = await apiClient.get<ApiResponse<RecordListResponse>>(url )

  // Normalize response format
  if (response.data) {
    return response.data
  }

  // Handle direct response format
  if ('records' in response && 'meta' in response) {
    return response as RecordListResponse
  }

  // Fallback
  return {
    records: [],
    meta: {
      page: 1,
      limit: PAGINATION.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }
}
