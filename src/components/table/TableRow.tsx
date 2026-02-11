/**
 * Table Row Component
 * Individual row with edit mode and delete button
 */

import { memo, useCallback } from 'react'
import { DatasetRecord } from '../../types/record.types'
import { SchemaField } from '../../engines/schema.engine'
import { EditableCell } from './EditableCell'

export interface TableRowProps {
  record: DatasetRecord
  fields: SchemaField[]
  onUpdate: (recordId: string, data: Record<string, unknown>) => void
  onDelete: (recordId: string) => void
  isDeleting?: boolean
}

/**
 * Table Row
 * Renders a single table row with editable cells
 */
export const TableRow = memo(function TableRow({
  record,
  fields,
  onUpdate,
  onDelete,
  isDeleting = false,
}: TableRowProps) {
  const handleCellChange = useCallback((fieldKey: string, value: unknown) => {
    onUpdate(record.id, { [fieldKey]: value })
  }, [record.id, onUpdate])

  const handleDelete = useCallback(() => {
    onDelete(record.id)
  }, [record.id, onDelete])

  return (
    <tr className="group hover:bg-gray-50">
      {fields.map((field, index) => (
        <EditableCell
          key={field.key}
          field={field}
          value={record.data[field.key]}
          onChange={(value) => handleCellChange(field.key, value)}
          isDirty={record.dirty}
          className={index === 0 ? 'pl-12' : ''}
          leftOverlay={index === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleting}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 opacity-0 pointer-events-none transition-opacity duration-150 hover:bg-red-50 focus:opacity-100 focus:pointer-events-auto focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
              aria-label="Delete row"
              title="Delete row"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8.5 2a1 1 0 00-1 1V4H5a1 1 0 000 2h.2l.7 9.2A2 2 0 007.9 17h4.2a2 2 0 001.99-1.8l.7-9.2H15a1 1 0 100-2h-2.5V3a1 1 0 00-1-1h-3zm2 2V3h-1v1h1zM8 8a1 1 0 112 0v5a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v5a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : undefined}
        />
      ))}
    </tr>
  )
})
