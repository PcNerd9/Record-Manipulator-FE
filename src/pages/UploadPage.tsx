/**
 * Upload Page
 * Page for uploading new datasets
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDatasets } from '../hooks/useDatasets'
import { UploadDataset } from '../components/dataset/UploadDataset'
import { Loader } from '../components/common/Loader'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/common/Button'

/**
 * Upload Page
 * Handles dataset upload with loading state and redirect
 */
function UploadPage() {
  const navigate = useNavigate()
  const { isUploading } = useDatasets()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUploadSuccess = (datasetId: string) => {
    setIsProcessing(true)
    
    // Wait a bit for backend processing, then redirect
    setTimeout(() => {
      navigate(`/dataset/${datasetId}`, { replace: true })
    }, 2000)
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  // Show processing state
  if (isProcessing) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Loader size="lg" text="Dataset is being processed, please wait..." />
            <p className="mt-4 text-sm text-gray-500">
              This may take a few moments depending on the file size.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={isUploading}
        >
          ← Back to Dashboard
        </Button>
      </div>

      <UploadDataset
        onSuccess={handleUploadSuccess}
        onCancel={handleCancel}
      />
    </AppShell>
  )
}

export default UploadPage
