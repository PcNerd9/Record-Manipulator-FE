/**
 * Virtual Table Component
 * Virtual scrolling implementation for performance
 * 
 * Note: For production, consider using a library like react-window or @tanstack/react-virtual
 * This is a simplified implementation
 */

import { useRef, useEffect, useState } from 'react'
import { DatasetRecord } from '../../types/record.types'
import { SchemaField } from '../../engines/schema.engine'
import { TableRow } from './TableRow'
import { TableHeader } from './TableHeader'

export interface VirtualTableProps {
  records: DatasetRecord[]
  fields: SchemaField[]
  onUpdate: (recordId: string, data: Record<string, unknown>) => void
  onDelete: (recordId: string) => void
  isDeleting?: boolean
  rowHeight?: number
  visibleRows?: number
}

/**
 * Virtual Table
 * Renders only visible rows for performance with large datasets
 */
export function VirtualTable({
  records,
  fields,
  onUpdate,
  onDelete,
  isDeleting = false,
  rowHeight = 50,
  visibleRows = 20,
}: VirtualTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const totalHeight = records.length * rowHeight
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(
    startIndex + visibleRows + 1,
    records.length
  )
  const visibleRecords = records.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight

  return (
    <div className="overflow-x-auto">
      <div
        ref={containerRef}
        className="relative overflow-y-auto border border-gray-200 rounded-lg"
        style={{ height: `${visibleRows * rowHeight}px`, maxHeight: '600px' }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader fields={fields} />
          <tbody
            className="bg-white divide-y divide-gray-200"
            style={{
              height: `${totalHeight}px`,
              position: 'relative',
            }}
          >
            <tr style={{ height: `${offsetY}px` }} aria-hidden="true">
              <td colSpan={fields.length} />
            </tr>
            {visibleRecords.map((record) => (
              <TableRow
                key={record.id}
                record={record}
                fields={fields}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
