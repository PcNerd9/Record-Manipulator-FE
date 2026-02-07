/**
 * Dataset types
 * Types related to datasets and their management
 */

import { SchemaType } from '../lib/constants'

/**
 * Dataset schema
 * Maps column names to their types
 */
export type DatasetSchema = Record<string, SchemaType>

/**
 * Dataset object
 */
export interface Dataset {
  id: string
  name: string
  data_schema: DatasetSchema
  recordCount?: number
  createdAt: string
  updatedAt: string
}

/**
 * Dataset list item (simplified for list view)
 */
export interface DatasetListItem {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * Dataset list response
 */
export interface DatasetListResponse {
  datasets: DatasetListItem[]
  total: number
}

/**
 * Dataset detail response (includes schema)
 */
export interface DatasetDetailResponse extends Dataset {
  schema: DatasetSchema
}

/**
 * Upload dataset request
 * File will be sent as FormData
 */
export interface UploadDatasetRequest {
  file: File
}

/**
 * Upload dataset response
 */
export interface UploadDatasetResponse {
  dataset_id: string
  message: string
  processing?: boolean
}

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'excel'

/**
 * Export dataset request
 */
export interface ExportDatasetRequest {
  datasetId: string
  format: ExportFormat
}
