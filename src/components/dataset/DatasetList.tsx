/**
 * Dataset List Component
 * Displays list of datasets
 */

import { useDatasets } from '../../hooks/useDatasets'
import { DatasetCard } from './DatasetCard'
import { Loader } from '../common/Loader'
import { EmptyDatasetsState } from '../common/EmptyState'

export interface DatasetListProps {
  onDatasetClick?: (datasetId: string) => void
  onUploadClick?: () => void
}

/**
 * Dataset List
 * Renders list of datasets with loading and empty states
 */
export function DatasetList({
  onDatasetClick,
  onUploadClick,
}: DatasetListProps) {
  const { datasets, isLoading, error } = useDatasets()

  if (isLoading) {
    return <Loader size="lg" text="Loading datasets..." />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (datasets.length === 0) {
    return (
      <EmptyDatasetsState
        onUpload={onUploadClick || (() => {})}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          onClick={onDatasetClick}
        />
      ))}
    </div>
  )
}
