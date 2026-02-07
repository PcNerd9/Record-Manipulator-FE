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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Datasets</h1>
        <Button onClick={handleUploadClick} variant="primary">
          Upload New Dataset
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
