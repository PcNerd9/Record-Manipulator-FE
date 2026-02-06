/**
 * Dirty Engine
 * Tracks records that have been modified but not yet saved
 */

import type { RecordUpdatePayload } from '../types/record.types'

/**
 * Dirty record entry
 */
interface DirtyRecord {
  id: string
  data: Record<string, unknown>
  timestamp: number
}

/**
 * Dirty Engine class
 * Manages dirty record tracking and flushing
 */
export class DirtyEngine {
  private dirty: Map<string, DirtyRecord> = new Map()

  /**
   * Mark a record as dirty
   * @param id - Record ID
   * @param data - Updated record data
   */
  mark(id: string, data: Record<string, unknown>): void {
    this.dirty.set(id, {
      id,
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear dirty flag for a specific record
   * @param id - Record ID
   */
  clear(id: string): void {
    this.dirty.delete(id)
  }

  /**
   * Get dirty record by ID
   * @param id - Record ID
   * @returns Dirty record or null
   */
  getDirty(id: string): DirtyRecord | null {
    return this.dirty.get(id) || null
  }

  /**
   * Check if a specific record is dirty
   * @param id - Record ID
   * @returns True if record is dirty
   */
  isDirty(id: string): boolean {
    return this.dirty.has(id)
  }

  /**
   * Check if there are any dirty records
   * @returns True if any records are dirty
   */
  hasDirty(): boolean {
    return this.dirty.size > 0
  }

  /**
   * Get count of dirty records
   * @returns Number of dirty records
   */
  getDirtyCount(): number {
    return this.dirty.size
  }

  /**
   * Flush all dirty records
   * Returns all dirty records and clears them
   * @returns Array of record update payloads
   */
  flush(): RecordUpdatePayload[] {
    const payloads: RecordUpdatePayload[] = Array.from(this.dirty.values()).map(
      (record) => ({
        id: record.id,
        data: record.data,
      })
    )

    this.dirty.clear()
    return payloads
  }

  /**
   * Get all dirty records without clearing them
   * @returns Array of record update payloads
   */
  getDirtyRecords(): RecordUpdatePayload[] {
    return Array.from(this.dirty.values()).map((record) => ({
      id: record.id,
      data: record.data,
    }))
  }

  /**
   * Clear all dirty records
   */
  clearAll(): void {
    this.dirty.clear()
  }

  /**
   * Get dirty record IDs
   * @returns Array of dirty record IDs
   */
  getDirtyIds(): string[] {
    return Array.from(this.dirty.keys())
  }

  /**
   * Update dirty record data
   * Merges new data with existing dirty data
   * @param id - Record ID
   * @param data - Partial record data to merge
   */
  update(id: string, data: Partial<Record<string, unknown>>): void {
    const existing = this.dirty.get(id)
    if (existing) {
      // Merge with existing data
      this.dirty.set(id, {
        ...existing,
        data: {
          ...existing.data,
          ...data,
        },
        timestamp: Date.now(),
      })
    } else {
      // Create new dirty record
      this.mark(id, data as Record<string, unknown>)
    }
  }
}
