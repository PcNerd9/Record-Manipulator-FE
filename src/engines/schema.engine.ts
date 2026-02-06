/**
 * Schema Engine
 * Handles schema parsing, input type mapping, and validation
 */

import { SCHEMA_TYPES, type SchemaType } from '../lib/constants'
import type { Schema } from '../types/record.types'
import { validateValue } from '../utils/validators'

/**
 * Schema field definition
 */
export interface SchemaField {
  key: string
  type: SchemaType
  inputType: string
}

/**
 * Build schema from Record format to array format
 * Converts schema object to array of field definitions
 * @param schema - Schema object (Record<string, SchemaType>)
 * @returns Array of schema fields
 */
export function buildSchema(schema: Schema): SchemaField[] {
  return Object.entries(schema).map(([key, type]) => ({
    key,
    type,
    inputType: getInputType(type),
  }))
}

/**
 * Get HTML input type from schema type
 * Maps schema types to appropriate HTML input types
 * @param type - Schema type
 * @returns HTML input type
 */
export function getInputType(type: SchemaType): string {
  switch (type) {
    case SCHEMA_TYPES.STRING:
      return 'text'

    case SCHEMA_TYPES.NUMBER:
    case SCHEMA_TYPES.FLOAT:
      return 'number'

    case SCHEMA_TYPES.INTEGER:
      return 'number'

    case SCHEMA_TYPES.BOOLEAN:
      return 'checkbox'

    case SCHEMA_TYPES.DATE:
      return 'date'

    case SCHEMA_TYPES.DATETIME:
      return 'datetime-local'

    default:
      return 'text'
  }
}

/**
 * Validate value against schema type
 * @param value - Value to validate
 * @param type - Schema type
 * @returns True if valid, false otherwise
 */
export function validateValueAgainstSchema(
  value: unknown,
  type: SchemaType
): boolean {
  return validateValue(value, type)
}

/**
 * Get schema field by key
 * @param schema - Schema object
 * @param key - Field key
 * @returns Schema field or null
 */
export function getSchemaField(
  schema: Schema,
  key: string
): SchemaField | null {
  const type = schema[key]
  if (!type) return null

  return {
    key,
    type,
    inputType: getInputType(type),
  }
}

/**
 * Get all schema keys
 * @param schema - Schema object
 * @returns Array of field keys
 */
export function getSchemaKeys(schema: Schema): string[] {
  return Object.keys(schema)
}

/**
 * Check if schema has a specific field
 * @param schema - Schema object
 * @param key - Field key
 * @returns True if field exists
 */
export function hasSchemaField(schema: Schema, key: string): boolean {
  return key in schema
}
