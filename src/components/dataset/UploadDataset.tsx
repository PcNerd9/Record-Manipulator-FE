/**
 * Upload Dataset Component
 * Handles file upload for datasets
 */

import { useState, useRef, ChangeEvent } from 'react'
import { useDatasets } from '../../hooks/useDatasets'
import { Button } from '../common/Button'
import { Loader } from '../common/Loader'

export interface UploadDatasetProps {
  onSuccess?: (datasetId: string) => void
  onCancel?: () => void
}

/**
 * Upload Dataset
 * File upload component for CSV/Excel files
 */
export function UploadDataset({ onSuccess, onCancel }: UploadDatasetProps) {
  const { uploadDataset, isUploading, error } = useDatasets()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]
      const validExtensions = ['.csv', '.xls', '.xlsx']

      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

      if (!isValidType) {
        setUploadError(
          'Please select a valid CSV or Excel file (.csv, .xls, .xlsx)'
        )
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file')
      return
    }

    setUploadError(null)

    try {
      const response = await uploadDataset(selectedFile)
      onSuccess?.(response.dataset_id)
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'Upload failed'
      setUploadError(errorMessage)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onCancel?.()
  }

  const displayError = uploadError || error

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Upload Dataset
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (CSV or Excel)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{displayError}</p>
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <Loader text="Dataset is being processed, please wait..." />
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            {onCancel && (
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
