/**
 * Dataset List Component
 * Displays list of datasets
 */

import { FormEvent, useMemo, useState } from 'react'
import { useDatasets } from '../../hooks/useDatasets'
import { DatasetCard } from './DatasetCard'
import { Loader } from '../common/Loader'
import { EmptyDatasetsState } from '../common/EmptyState'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import type { DatasetListItem } from '../../types/dataset.types'
import { getErrorMessage, GENERIC_ERROR_MESSAGE } from '../../utils/errorHandler'
import { showErrorToast, showSuccessToast } from '../common/Toast'

export interface DatasetListProps {
  onDatasetClick?: (datasetId: string) => void
  onUploadClick?: () => void
}

/**
 * Dataset List
 * Renders list of datasets with loading and empty states
 */
export function DatasetList({
  onDatasetClick,
  onUploadClick,
}: DatasetListProps) {
  const { datasets, isLoading, error, renameDataset, deleteDataset } = useDatasets()
  const [renameTarget, setRenameTarget] = useState<DatasetListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DatasetListItem | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmitRename = useMemo(() => {
    const trimmed = renameValue.trim()
    return !!renameTarget && trimmed.length > 0 && trimmed !== renameTarget.name
  }, [renameTarget, renameValue])

  const openRenameModal = (dataset: DatasetListItem) => {
    setRenameTarget(dataset)
    setRenameValue(dataset.name)
  }

  const closeRenameModal = () => {
    if (isSubmitting) return
    setRenameTarget(null)
    setRenameValue('')
  }

  const openDeleteModal = (dataset: DatasetListItem) => {
    setDeleteTarget(dataset)
  }

  const closeDeleteModal = () => {
    if (isSubmitting) return
    setDeleteTarget(null)
  }

  const handleRenameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!renameTarget || !canSubmitRename) return

    setIsSubmitting(true)
    try {
      await renameDataset(renameTarget.id, renameValue.trim())
      showSuccessToast('Dataset renamed successfully')
      setRenameTarget(null)
      setRenameValue('')
    } catch (err) {
      const message = getErrorMessage(err, GENERIC_ERROR_MESSAGE)
      showErrorToast(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setIsSubmitting(true)
    try {
      await deleteDataset(deleteTarget.id)
      showSuccessToast('Dataset deleted successfully')
      setDeleteTarget(null)
    } catch (err) {
      const message = getErrorMessage(err, GENERIC_ERROR_MESSAGE)
      showErrorToast(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Loader size="lg" text="Loading datasets..." />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (datasets.length === 0) {
    return (
      <EmptyDatasetsState
        onUpload={onUploadClick || (() => {})}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            onClick={onDatasetClick}
            onRename={openRenameModal}
            onDelete={openDeleteModal}
          />
        ))}
      </div>

      <Modal
        isOpen={!!renameTarget}
        onClose={closeRenameModal}
        title="Rename Dataset"
        size="sm"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label htmlFor="dataset-name" className="mb-1 block text-sm font-medium text-slate-700">
              Dataset Name
            </label>
            <input
              id="dataset-name"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              disabled={isSubmitting}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:border-slate-200 disabled:bg-slate-100"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeRenameModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmitRename} isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Dataset"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeDeleteModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteConfirm} isLoading={isSubmitting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
