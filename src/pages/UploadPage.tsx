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
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="surface-card p-8 text-center">
            <Loader size="lg" text="Dataset is being processed, please wait..." />
            <p className="mt-4 text-sm text-slate-500">
              This may take a few moments depending on the file size.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={isUploading}
        >
          ← Back to Dashboard
        </Button>
      </div>

      <div className="surface-card mb-6 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Import</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Upload Dataset</h1>
        <p className="mt-1 text-sm text-slate-600">Upload CSV or Excel files and start editing immediately.</p>
      </div>

      <UploadDataset
        onSuccess={handleUploadSuccess}
        onCancel={handleCancel}
      />
    </AppShell>
  )
}

export default UploadPage
