/**
 * Dataset Page
 * Page for viewing and editing dataset records
 */

import { useParams, useNavigate } from 'react-router-dom'
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
import { getErrorMessage, GENERIC_ERROR_MESSAGE } from '../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../components/common/Toast'

/**
 * Dataset Page
 * Displays dataset with table, search, export, and autosave
 */
function DatasetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
      showSuccessToast('Dataset exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = getErrorMessage(error, GENERIC_ERROR_MESSAGE)
      showErrorToast(errorMessage)
    }
  }, [datasetId])

  const handleExportExcel = useCallback(async () => {
    if (!datasetId) return
    try {
      await exportAsExcel(datasetId)
      showSuccessToast('Dataset exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = getErrorMessage(error, GENERIC_ERROR_MESSAGE)
      showErrorToast(errorMessage)
    }
  }, [datasetId])

  const handleManualSave = useCallback(async () => {
    try {
      await forceSave()
      showSuccessToast('Changes saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      const errorMessage = getErrorMessage(error, GENERIC_ERROR_MESSAGE)
      showErrorToast(errorMessage)
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

  if (isDatasetLoading || (isRecordsLoading && records.length === 0)) {
    return (
      <AppShell>
        <Loader size="lg" text="Loading dataset..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="surface-card mb-5 p-5">
        <div className="mb-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            ← Back to Datasets
          </Button>
        </div>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dataset Editor</p>
            <h1 className="mt-1 break-words text-2xl font-semibold text-slate-900 md:text-3xl" title={dataset?.name || 'Dataset'}>
              {dataset?.name || 'Dataset'}
            </h1>
            {dataset && (
              <p className="mt-1 text-sm text-slate-600">
                {records.length} record{records.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2.5 xl:w-auto xl:justify-end">
            {/* Autosave Status */}
            <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm sm:w-auto">
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
              className="w-full sm:w-auto"
            >
              {autosaveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Export Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="w-full sm:w-auto"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={records.length === 0}
              className="w-full sm:w-auto"
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
