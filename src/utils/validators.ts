/**
 * Validators utility
 * Schema-based validation utilities and type validation helpers
 */

import { SCHEMA_TYPES, type SchemaType } from '../lib/constants'
import type { Schema } from '../types/record.types'

/**
 * Validate a value against a schema type
 * @param value - Value to validate
 * @param type - Schema type to validate against
 * @returns True if value is valid, false otherwise
 */
export function validateValue(value: unknown, type: SchemaType): boolean {
  if (value === null || value === undefined) {
    return true // Allow null/undefined (can be handled separately if needed)
  }

  switch (type) {
    case SCHEMA_TYPES.STRING:
      return typeof value === 'string'

    case SCHEMA_TYPES.NUMBER:
    case SCHEMA_TYPES.FLOAT:
      return typeof value === 'number' && !isNaN(value) && isFinite(value)

    case SCHEMA_TYPES.INTEGER:
      return typeof value === 'number' && Number.isInteger(value) && !isNaN(value)

    case SCHEMA_TYPES.BOOLEAN:
      return typeof value === 'boolean'

    case SCHEMA_TYPES.DATE:
    case SCHEMA_TYPES.DATETIME:
      // Check if it's a valid date string or Date object
      if (value instanceof Date) {
        return !isNaN(value.getTime())
      }
      if (typeof value === 'string') {
        const date = new Date(value)
        return !isNaN(date.getTime())
      }
      return false

    default:
      return true // Unknown types pass validation
  }
}

/**
 * Validate a record against a schema
 * @param record - Record data to validate
 * @param schema - Schema definition
 * @returns Object with validation result and errors
 */
export function validateRecord(
  record: Record<string, unknown>,
  schema: Schema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Check each field in the schema
  for (const [fieldName, fieldType] of Object.entries(schema)) {
    const value = record[fieldName]

    // Skip validation if value is null/undefined (optional fields)
    if (value === null || value === undefined) {
      continue
    }

    if (!validateValue(value, fieldType)) {
      errors[fieldName] = `Invalid ${fieldType} value for field ${fieldName}`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate multiple records against a schema
 * @param records - Array of records to validate
 * @param schema - Schema definition
 * @returns Array of validation results
 */
export function validateRecords(
  records: Record<string, unknown>[],
  schema: Schema
): Array<{ index: number; valid: boolean; errors: Record<string, string> }> {
  return records.map((record, index) => {
    const validation = validateRecord(record, schema)
    return {
      index,
      ...validation,
    }
  })
}

/**
 * Convert value to schema type
 * Attempts to convert a value to the expected schema type
 * @param value - Value to convert
 * @param type - Target schema type
 * @returns Converted value or original value if conversion fails
 */
export function convertToSchemaType(value: unknown, type: SchemaType): unknown {
  if (value === null || value === undefined) {
    return value
  }

  switch (type) {
    case SCHEMA_TYPES.STRING:
      return String(value)

    case SCHEMA_TYPES.NUMBER:
    case SCHEMA_TYPES.FLOAT:
      const num = Number(value)
      return isNaN(num) ? value : num

    case SCHEMA_TYPES.INTEGER:
      const int = Number(value)
      return isNaN(int) ? value : Math.floor(int)

    case SCHEMA_TYPES.BOOLEAN:
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        return lower === 'true' || lower === '1' || lower === 'yes'
      }
      return Boolean(value)

    case SCHEMA_TYPES.DATE:
    case SCHEMA_TYPES.DATETIME:
      if (value instanceof Date) return value
      if (typeof value === 'string') {
        const date = new Date(value)
        return isNaN(date.getTime()) ? value : date
      }
      return value

    default:
      return value
  }
}

/**
 * Sanitize value for schema type
 * Removes invalid characters or formats value appropriately
 * @param value - Value to sanitize
 * @param type - Target schema type
 * @returns Sanitized value
 */
export function sanitizeValue(value: unknown, type: SchemaType): unknown {
  if (value === null || value === undefined) {
    return value
  }

  switch (type) {
    case SCHEMA_TYPES.STRING:
      return String(value).trim()

    case SCHEMA_TYPES.INTEGER:
      const int = Number(value)
      return isNaN(int) ? 0 : Math.floor(int)

    case SCHEMA_TYPES.NUMBER:
    case SCHEMA_TYPES.FLOAT:
      const num = Number(value)
      return isNaN(num) ? 0 : num

    case SCHEMA_TYPES.BOOLEAN:
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const lower = value.toLowerCase().trim()
        return lower === 'true' || lower === '1' || lower === 'yes'
      }
      return Boolean(value)

    default:
      return value
  }
}
