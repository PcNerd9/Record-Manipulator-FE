/**
 * Table Row Component
 * Individual row with edit mode and delete button
 */

import { memo, useCallback } from 'react'
import { DatasetRecord } from '../../types/record.types'
import { SchemaField } from '../../engines/schema.engine'
import { EditableCell } from './EditableCell'
import { Button } from '../common/Button'

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
    <tr className="hover:bg-gray-50">
      {fields.map((field) => (
        <EditableCell
          key={field.key}
          field={field}
          value={record.data[field.key]}
          onChange={(value) => handleCellChange(field.key, value)}
          isDirty={record.dirty}
        />
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          isLoading={isDeleting}
        >
          Delete
        </Button>
      </td>
    </tr>
  )
})
