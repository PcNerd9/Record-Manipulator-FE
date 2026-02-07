/**
 * Data Table Component
 * Main table component with schema-driven columns
 */

import { memo, useState, useCallback } from 'react'
import { useRecords } from '../../hooks/useRecords'
import { useSchema } from '../../hooks/useSchema'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { Loader } from '../common/Loader'
import { Button } from '../common/Button'
import type { DatasetRecord } from '../../types/record.types'

export interface DataTableProps {
  datasetId: string
}

/**
 * Data Table
 * Renders table with schema-driven columns and editable rows
 */
export const DataTable = memo(function DataTable({ datasetId }: DataTableProps) {
  const { records, createRecord, updateRecord, deleteRecord, isLoading, isUpdating } =
    useRecords(datasetId)
  const { schemaFields, isLoading: isSchemaLoading, schema } = useSchema(datasetId)
  const [newRecordId, setNewRecordId] = useState<string | null>(null)

  // All hooks must be called before any early returns
  const handleAddNewRow = useCallback(async () => {
    if (!datasetId || !schema) return

    // Create empty record with default values based on schema
    const emptyData: Record<string, unknown> = {}
    schemaFields.forEach((field) => {
      // Set default values based on type
      switch (field.type) {
        case 'number':
        case 'integer':
        case 'float':
          emptyData[field.key] = 0
          break
        case 'boolean':
          emptyData[field.key] = false
          break
        case 'date':
          emptyData[field.key] = new Date().toISOString().split('T')[0]
          break
        default:
          emptyData[field.key] = ''
      }
    })

    try {
      const newRecord = await createRecord(emptyData)
      setNewRecordId(newRecord.id)
    } catch (error) {
      console.error('Failed to create record:', error)
      alert('Failed to create new record. Please try again.')
    }
  }, [datasetId, schema, schemaFields, createRecord])

  // Early returns after all hooks
  if (isSchemaLoading || isLoading) {
    return <Loader size="lg" text="Loading records..." />
  }

  if (!schemaFields || schemaFields.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">No schema available for this dataset</p>
      </div>
    )
  }

  // Create a temporary new record for display
  const displayRecords = [...records]
  if (newRecordId && !records.find((r) => r.id === newRecordId)) {
    // Add temporary record if it hasn't been created yet
    const tempRecord: DatasetRecord = {
      id: newRecordId,
      data: schemaFields.reduce((acc, field) => {
        switch (field.type) {
          case 'number':
          case 'integer':
          case 'float':
            acc[field.key] = 0
            break
          case 'boolean':
            acc[field.key] = false
            break
          case 'date':
            acc[field.key] = new Date().toISOString().split('T')[0]
            break
          default:
            acc[field.key] = ''
        }
        return acc
      }, {} as Record<string, unknown>),
      dirty: true,
    }
    displayRecords.unshift(tempRecord)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNewRow}
          disabled={isLoading || isUpdating}
          isLoading={isLoading}
        >
          + Add New Row
        </Button>
      </div>

      {displayRecords.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500">No records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <TableHeader fields={schemaFields} />
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRecords.map((record) => (
                <TableRow
                  key={record.id}
                  record={record}
                  fields={schemaFields}
                  onUpdate={updateRecord}
                  onDelete={deleteRecord}
                  isDeleting={isUpdating}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})
