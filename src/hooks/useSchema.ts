/**
 * Schema Hook
 * React hook for schema utilities
 */

import { useMemo } from 'react'
import { useDataset } from './useDatasets'
import {
  buildSchema,
  getSchemaField,
  getSchemaKeys,
  hasSchemaField,
  validateValueAgainstSchema,
  type SchemaField,
} from '../engines/schema.engine'
import type { Schema } from '../types/record.types'

/**
 * Use schema hook
 * Returns schema and utilities for a dataset
 */
export function useSchema(datasetId: string | null) {
  const { dataset, isLoading, error } = useDataset(datasetId)

  const schema = useMemo<Schema | null>(() => {
    return dataset?.schema || null
  }, [dataset])

  const schemaFields = useMemo<SchemaField[]>(() => {
    if (!schema) return []
    return buildSchema(schema)
  }, [schema])

  const getField = useMemo(
    () => (key: string) => {
      if (!schema) return null
      return getSchemaField(schema, key)
    },
    [schema]
  )

  const getKeys = useMemo(
    () => () => {
      if (!schema) return []
      return getSchemaKeys(schema)
    },
    [schema]
  )

  const hasField = useMemo(
    () => (key: string) => {
      if (!schema) return false
      return hasSchemaField(schema, key)
    },
    [schema]
  )

  const getFieldInputType = useMemo(
    () => (key: string) => {
      const field = getField(key)
      return field?.inputType || 'text'
    },
    [getField]
  )

  const validateValue = useMemo(
    () => (key: string, value: unknown) => {
      const field = getField(key)
      if (!field) return false
      return validateValueAgainstSchema(value, field.type)
    },
    [getField]
  )

  return {
    schema,
    schemaFields,
    isLoading,
    error,
    getField,
    getKeys,
    hasField,
    getFieldInputType,
    validateValue,
  }
}
