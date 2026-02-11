/**
 * Dataset Card Component
 * Individual dataset card display
 */

import { DatasetListItem } from '../../types/dataset.types'
import { useEffect, useRef, useState } from 'react'

export interface DatasetCardProps {
  dataset: DatasetListItem
  onClick?: (datasetId: string) => void
  onRename?: (dataset: DatasetListItem) => void
  onDelete?: (dataset: DatasetListItem) => void
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
export function DatasetCard({ dataset, onClick, onRename, onDelete }: DatasetCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const handleClick = () => {
    onClick?.(dataset.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
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
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsMenuOpen((prev) => !prev)
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM11.5 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-20 py-1"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(false)
                onRename?.(dataset)
              }}
            >
              Rename
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(false)
                onDelete?.(dataset)
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {dataset.name}
      </h3>
      <div className="flex flex-col space-y-1 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="font-medium mr-2">Last Updated:</span>
          <span>{formatDate(dataset.updatedAt)}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Columns: {dataset.columnCount ?? 0}</span>
          <span>Rows: {dataset.recordCount ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
