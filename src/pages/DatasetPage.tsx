/**
 * Dataset Page
 * Page for viewing and editing dataset records
 */

import { useParams } from 'react-router-dom'
import { useMemo, useCallback, useEffect } from 'react'
import { useDataset } from '../hooks/useDatasets'
import { useRecords } from '../hooks/useRecords'
import { useAutosave } from '../hooks/useAutosave'
import { DataTable } from '../components/table/DataTable'
import { RecordSearch } from '../components/search/RecordSearch'
import { Button } from '../components/common/Button'
import { Loader } from '../components/common/Loader'
import { AppShell } from '../components/layout/AppShell'
import { exportAsCSV, exportAsExcel } from '../engines/export.engine'

/**
 * Dataset Page
 * Displays dataset with table, search, export, and autosave
 */
function DatasetPage() {
  const { id } = useParams<{ id: string }>()
  const datasetId = id || null

  const { dataset, isLoading: isDatasetLoading } = useDataset(datasetId)
  const { records, isLoading: isRecordsLoading } = useRecords(datasetId)
  const {
    status: autosaveStatus,
    dirtyCount,
    triggerAutosave,
    forceSave,
    lastSaved,
  } = useAutosave()

  // Trigger autosave when records are updated
  useEffect(() => {
    if (dirtyCount > 0) {
      triggerAutosave()
    }
  }, [dirtyCount, triggerAutosave])

  const handleExportCSV = useCallback(async () => {
    if (!datasetId) return
    try {
      await exportAsCSV(datasetId)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }, [datasetId])

  const handleExportExcel = useCallback(async () => {
    if (!datasetId) return
    try {
      await exportAsExcel(datasetId)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }, [datasetId])

  const handleManualSave = useCallback(async () => {
    try {
      await forceSave()
    } catch (error) {
      console.error('Save failed:', error)
      alert('Save failed. Please try again.')
    }
  }, [forceSave])

  const autosaveStatusText = useMemo(() => {
    switch (autosaveStatus) {
      case 'pending':
        return 'Changes will be saved automatically...'
      case 'saving':
        return 'Saving changes...'
      case 'saved':
        return lastSaved
          ? `Saved at ${lastSaved.toLocaleTimeString()}`
          : 'Changes saved'
      case 'error':
        return 'Save failed. Please try again.'
      default:
        return dirtyCount > 0
          ? `${dirtyCount} unsaved change${dirtyCount > 1 ? 's' : ''}`
          : 'All changes saved'
    }
  }, [autosaveStatus, lastSaved, dirtyCount])

  const autosaveStatusColor = useMemo(() => {
    switch (autosaveStatus) {
      case 'saving':
        return 'text-blue-600'
      case 'saved':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }, [autosaveStatus])

  if (!datasetId) {
    return (
      <AppShell>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Invalid dataset ID</p>
        </div>
      </AppShell>
    )
  }

  if (isDatasetLoading || isRecordsLoading) {
    return (
      <AppShell>
        <Loader size="lg" text="Loading dataset..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dataset?.name || 'Dataset'}
            </h1>
            {dataset && (
              <p className="text-sm text-gray-500 mt-1">
                {records.length} record{records.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Autosave Status */}
            <div className="text-sm">
              <span className={autosaveStatusColor}>
                {autosaveStatusText}
              </span>
            </div>

            {/* Manual Save Button - Always visible */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              disabled={autosaveStatus === 'saving' || dirtyCount === 0}
              isLoading={autosaveStatus === 'saving'}
            >
              {autosaveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Export Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={records.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={records.length === 0}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <RecordSearch datasetId={datasetId} />

      {/* Table */}
      <DataTable datasetId={datasetId} />
    </AppShell>
  )
}

export default DatasetPage
