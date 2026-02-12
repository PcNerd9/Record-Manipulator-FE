/**
 * Record types
 * Types related to dataset records and their manipulation
 */

import { SchemaType } from '../lib/constants'

/**
 * Schema type definition
 * Maps column names to their types
 */
export type Schema = Record<string, SchemaType>

/**
 * Record data
 * Dynamic object where keys are column names and values are the data
 */
export type RecordData = Record<string, unknown>

/**
 * Dataset record with metadata
 */
export interface DatasetRecord {
  id: string
  data: RecordData
  serialNumber?: number
  dirty?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Record update payload
 * Used for batch updates (autosave)
 */
export interface RecordUpdatePayload {
  id: string
  data: RecordData
}

/**
 * Batch update request
 */
export interface BatchUpdateRequest {
  records: RecordUpdatePayload[]
}

/**
 * Record list response (paginated)
 */
export interface RecordListResponse {
  records: DatasetRecord[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Search records request
 */
export interface SearchRecordsRequest {
  column: string
  value: string
}

/**
 * Search records response (same as RecordListResponse)
 */
export type SearchRecordsResponse = RecordListResponse

/**
 * Delete record response
 */
export interface DeleteRecordResponse {
  success: boolean
  message: string
}
