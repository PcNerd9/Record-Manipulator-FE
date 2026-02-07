/**
 * Dataset Card Component
 * Individual dataset card display
 */

import { DatasetListItem } from '../../types/dataset.types'

export interface DatasetCardProps {
  dataset: DatasetListItem
  onClick?: (datasetId: string) => void
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Dataset Card
 * Displays dataset information in a card format
 */
export function DatasetCard({ dataset, onClick }: DatasetCardProps) {
  const handleClick = () => {
    onClick?.(dataset.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'hover:border-blue-300' : ''
      }`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {dataset.name}
      </h3>
      <div className="flex flex-col space-y-1 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="font-medium mr-2">Created:</span>
          <span>{formatDate(dataset.createdAt)}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Updated:</span>
          <span>{formatDate(dataset.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
