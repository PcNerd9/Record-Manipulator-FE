/**
 * Table Header Component
 * Column headers from schema
 */

import { SchemaField } from '../../engines/schema.engine'

export interface TableHeaderProps {
  fields: SchemaField[]
}

/**
 * Table Header
 * Renders table column headers from schema
 */
export function TableHeader({ fields }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {fields.map((field) => (
          <th
            key={field.key}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
          >
            {field.key}
          </th>
        ))}
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
          Actions
        </th>
      </tr>
    </thead>
  )
}
