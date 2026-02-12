/**
 * Record Search Component
 * Search records by column and value
 */

import { useState, FormEvent } from 'react'
import { useSchema } from '../../hooks/useSchema'
import { useRecords } from '../../hooks/useRecords'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

export interface RecordSearchProps {
  datasetId: string
}

/**
 * Record Search
 * Search component with column selector and value input
 */
export function RecordSearch({ datasetId }: RecordSearchProps) {
  const { getKeys } = useSchema(datasetId)
  const { searchRecords, clearSearch, isLoading } = useRecords(datasetId)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!((selectedColumn && searchValue.trim()) ||sortColumn)) {
      return
    }

    await searchRecords(selectedColumn, searchValue.trim(), sortColumn)
  }

  const handleClear = () => {
    setSelectedColumn('')
    setSearchValue('')
    setSortColumn('')
    clearSearch()
  }

  const columns = getKeys()

  if (columns.length === 0) {
    return null
  }

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Select column...</option>
            {columns.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <Input
            type="text"
            label="Value"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter search value..."
            disabled={isLoading}
            fullWidth
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Sort By
          </label>
          <select
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Select column...</option>
            {columns.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1 xl:justify-end">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !(
                (selectedColumn && searchValue.trim()) ||
                sortColumn
              )
            }
            isLoading={isLoading}
            className="flex-1 xl:flex-none"
          >
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            disabled={isLoading}
            className="flex-1 xl:flex-none"
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}
