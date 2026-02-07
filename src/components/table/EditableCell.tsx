/**
 * Editable Cell Component
 * Editable cell with schema-based input types
 */

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { SchemaField } from '../../engines/schema.engine'

export interface EditableCellProps {
  field: SchemaField
  value: unknown
  onChange: (value: unknown) => void
  isDirty?: boolean
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
        className={`px-6 py-4 whitespace-nowrap text-sm ${
          isDirty ? 'bg-yellow-50' : 'bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type={field.inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
    )
  }

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-gray-50 ${
        isDirty ? 'bg-yellow-50' : 'bg-white'
      }`}
      onClick={() => setIsEditing(true)}
      title={isDirty ? 'Unsaved changes' : 'Click to edit'}
    >
      {value !== null && value !== undefined ? String(value) : '-'}
    </td>
  )
}
