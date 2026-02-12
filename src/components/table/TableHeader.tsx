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
        <th className="sticky left-0 top-0 z-30 w-20 border-b border-r border-slate-300 bg-slate-100 px-[var(--cell-px)] py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          S/N
        </th>
        {fields.map((field) => (
          <th
            key={field.key}
            className="sticky top-0 z-20 border-b border-r border-slate-300 bg-slate-100 px-[var(--cell-px)] py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600"
          >
            {field.key}
          </th>
        ))}
        <th className="sticky right-0 top-0 z-30 w-14 border-b border-l border-slate-300 bg-slate-100 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          Del
        </th>
      </tr>
    </thead>
  )
}
