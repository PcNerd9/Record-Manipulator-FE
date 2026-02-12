/**
 * Dashboard Page
 * Main dashboard showing dataset list
 */

import { useNavigate } from 'react-router-dom'
import { DatasetList } from '../components/dataset/DatasetList'
import { Button } from '../components/common/Button'
import { AppShell } from '../components/layout/AppShell'

/**
 * Dashboard Page
 * Displays user's datasets with upload functionality
 */
function DashboardPage() {
  const navigate = useNavigate()

  const handleUploadClick = () => {
    navigate('/upload')
  }

  const handleDatasetClick = (datasetId: string) => {
    navigate(`/dataset/${datasetId}`)
  }

  return (
    <AppShell>
      <div className="surface-card mb-6 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">My Datasets</h1>
          <p className="mt-1 text-sm text-slate-600">Manage uploads, edits, and exports from one place.</p>
        </div>
        <Button onClick={handleUploadClick} variant="primary">
          Upload Dataset
        </Button>
      </div>

      <DatasetList
        onDatasetClick={handleDatasetClick}
        onUploadClick={handleUploadClick}
      />
    </AppShell>
  )
}

export default DashboardPage
