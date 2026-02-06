/**
 * Export Engine
 * Handles dataset export operations
 */

import { exportDataset } from '../api/dataset.api'
import { download } from '../utils/download'
import type { ExportFormat } from '../types/dataset.types'

/**
 * Export dataset and trigger download
 * @param datasetId - Dataset ID to export
 * @param format - Export format (csv or excel)
 * @param filename - Optional custom filename
 * @returns Promise that resolves when export completes
 */
export async function exportDatasetAndDownload(
  datasetId: string,
  format: ExportFormat,
  filename?: string
): Promise<void> {
  try {
    // Get blob from API
    const blob = await exportDataset(datasetId, format)

    // Generate filename if not provided
    const exportFilename =
      filename || generateExportFilename(datasetId, format)

    // Trigger download
    download.blob(blob, exportFilename)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

/**
 * Generate export filename
 * @param datasetId - Dataset ID
 * @param format - Export format
 * @returns Generated filename
 */
function generateExportFilename(
  datasetId: string,
  format: ExportFormat
): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const extension = format === 'csv' ? 'csv' : 'xlsx'
  return `dataset_${datasetId}_${timestamp}.${extension}`
}

/**
 * Handle download from blob
 * Wrapper around download utility for consistency
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
export function handleDownload(blob: Blob, filename: string): void {
  download.blob(blob, filename)
}

/**
 * Export dataset as CSV
 * Convenience function for CSV export
 * @param datasetId - Dataset ID
 * @param filename - Optional custom filename
 */
export async function exportAsCSV(
  datasetId: string,
  filename?: string
): Promise<void> {
  return exportDatasetAndDownload(datasetId, 'csv', filename)
}

/**
 * Export dataset as Excel
 * Convenience function for Excel export
 * @param datasetId - Dataset ID
 * @param filename - Optional custom filename
 */
export async function exportAsExcel(
  datasetId: string,
  filename?: string
): Promise<void> {
  return exportDatasetAndDownload(datasetId, 'excel', filename)
}
