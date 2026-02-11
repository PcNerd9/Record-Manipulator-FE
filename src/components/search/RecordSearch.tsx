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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="flex-1">
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

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="flex items-end gap-2">
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
          >
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}
