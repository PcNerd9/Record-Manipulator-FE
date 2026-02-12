/**
 * Table Row Component
 * Individual row with edit mode and delete button
 */

import { memo, useCallback } from 'react'
import { DatasetRecord } from '../../types/record.types'
import { SchemaField } from '../../engines/schema.engine'
import { EditableCell } from './EditableCell'

export interface TableRowProps {
  serialNumber: number
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
  serialNumber,
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
    <tr className="group even:bg-slate-50/30 hover:bg-blue-50/30">
      <td className="sticky left-0 z-20 h-[var(--row-h)] whitespace-nowrap border-b border-r border-slate-200 bg-white px-[var(--cell-px)] py-1 text-xs font-semibold text-slate-500 group-even:bg-slate-50/30 group-hover:bg-blue-50/30">
        {serialNumber}
      </td>
      {fields.map((field) => (
        <EditableCell
          key={field.key}
          field={field}
          value={record.data[field.key]}
          onChange={(value) => handleCellChange(field.key, value)}
          isDirty={record.dirty}
        />
      ))}
      <td className="sticky right-0 z-20 h-[var(--row-h)] border-b border-l border-slate-200 bg-white/95 px-2 py-1 text-center backdrop-blur-sm group-even:bg-slate-50/95 group-hover:bg-blue-50/95">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          disabled={isDeleting}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40"
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
      </td>
    </tr>
  )
})
