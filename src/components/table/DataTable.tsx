/**
 * Data Table Component
 * Main table component with schema-driven columns
 */

import { memo } from 'react'
import { useRecords } from '../../hooks/useRecords'
import { useSchema } from '../../hooks/useSchema'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { Loader } from '../common/Loader'

export interface DataTableProps {
  datasetId: string
}

/**
 * Data Table
 * Renders table with schema-driven columns and editable rows
 */
export const DataTable = memo(function DataTable({ datasetId }: DataTableProps) {
  const { records, updateRecord, deleteRecord, isLoading, isUpdating } =
    useRecords(datasetId)
  const { schemaFields, isLoading: isSchemaLoading } = useSchema(datasetId)

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

  if (records.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
        <p className="text-gray-500">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <TableHeader fields={schemaFields} />
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
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
  )
})
