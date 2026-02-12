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
    <thead className="bg-slate-100">
      <tr>
        {fields.map((field, index) => (
          <th
            key={field.key}
            className={`sticky top-0 z-20 border-b border-r border-slate-300 bg-slate-100 px-[var(--cell-px)] py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 ${
              index === 0 ? 'pl-12' : ''
            }`}
          >
            {field.key}
          </th>
        ))}
      </tr>
    </thead>
  )
}
