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
      className={`group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all ${
        onClick ? 'hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md' : ''
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
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
              className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
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

      <h3 className="mb-3 pr-8 text-lg font-semibold text-slate-900">
        {dataset.name}
      </h3>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center">
          <span className="mr-2 min-w-[92px] text-xs font-semibold uppercase tracking-wide text-slate-500">Updated</span>
          <span>{formatDate(dataset.updatedAt)}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span>Columns: {dataset.columnCount ?? 0}</span>
          <span>Rows: {dataset.recordCount ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
