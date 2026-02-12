/**
 * Editable Cell Component
 * Editable cell with schema-based input types
 */

import { useState, useEffect, useRef, KeyboardEvent, ReactNode } from 'react'
import { SchemaField } from '../../engines/schema.engine'

export interface EditableCellProps {
  field: SchemaField
  value: unknown
  onChange: (value: unknown) => void
  isDirty?: boolean
  className?: string
  leftOverlay?: ReactNode
}

/**
 * Editable Cell
 * Renders editable cell based on schema field type
 */
export function EditableCell({
  field,
  value,
  onChange,
  isDirty = false,
  className = '',
  leftOverlay,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(String(value || ''))
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    // Convert value based on field type
    const convertedValue = convertValue(editValue, field.type)
    onChange(convertedValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(String(value || ''))
      setIsEditing(false)
    }
  }

  const convertValue = (val: string, type: string): unknown => {
    if (val === '') return null

    switch (type) {
      case 'number':
      case 'float':
        return parseFloat(val) || 0
      case 'integer':
        return parseInt(val, 10) || 0
      case 'boolean':
        return val === 'true' || val === '1' || val.toLowerCase() === 'yes'
      default:
        return val
    }
  }

  if (isEditing) {
    return (
      <td
        className={`relative h-[var(--row-h)] whitespace-nowrap border-b border-r border-slate-200 px-[var(--cell-px)] py-1 text-sm ${
          isDirty ? 'bg-amber-50' : 'bg-white'
        } ${className}`}
      >
        {leftOverlay}
        <input
          ref={inputRef}
          type={field.inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-8 w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
    )
  }

  return (
    <td
      className={`relative h-[var(--row-h)] cursor-pointer whitespace-nowrap border-b border-r border-slate-200 px-[var(--cell-px)] py-1 text-sm text-slate-800 hover:bg-blue-50/40 ${
        isDirty ? 'bg-amber-50' : 'bg-white'
      } ${className}`}
      onClick={() => setIsEditing(true)}
      title={isDirty ? 'Unsaved changes' : 'Click to edit'}
    >
      {leftOverlay}
      <span className="font-mono text-[13px]">
        {value !== null && value !== undefined ? String(value) : '-'}
      </span>
    </td>
  )
}
