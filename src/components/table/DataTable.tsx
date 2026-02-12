/**
 * Data Table Component
 * Main table component with schema-driven columns
 */

import { memo, useState, useCallback } from 'react'
import { useRecords } from '../../hooks/useRecords'
import { useSchema } from '../../hooks/useSchema'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
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
  const { records, pagination, search, fetchRecords, createRecord, updateRecord, deleteRecord, isLoading, isUpdating } =
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

  const handleLoadMore = useCallback(async () => {
    // Don't paginate while searching, when already loading, or when there's no next page.
    if (!datasetId || isLoading || isUpdating) return
    if (search.column || search.value) return
    if (!pagination.hasMore) return

    const nextPage = pagination.page + 1
    await fetchRecords(nextPage, true)
  }, [
    datasetId,
    isLoading,
    isUpdating,
    search.column,
    search.value,
    pagination.hasMore,
    pagination.page,
    fetchRecords,
  ])

  const { containerRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    enabled: !!datasetId && !isSchemaLoading && records.length > 0 && pagination.hasMore,
    threshold: 250,
  })

  // Early returns after all hooks
  if (isSchemaLoading || (isLoading && records.length === 0)) {
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
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Records Grid</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddNewRow}
          disabled={isLoading || isUpdating}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          + Add Row
        </Button>
      </div>

      {displayRecords.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            ref={containerRef}
            className="max-h-[68vh] overflow-auto rounded-lg border border-slate-300 bg-white shadow-sm md:max-h-[70vh]"
          >
            <table className="min-w-full border-separate border-spacing-0">
              <TableHeader fields={schemaFields} />
              <tbody className="bg-white">
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
          {isLoading && pagination.page > 1 && (
            <div className="py-2 text-center text-sm text-slate-500">
              Loading more records...
            </div>
          )}
        </div>
      )}
    </div>
  )
})
