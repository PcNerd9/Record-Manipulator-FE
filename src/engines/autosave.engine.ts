/**
 * Autosave Engine
 * Manages autosave scheduling and execution
 */

import { AUTOSAVE } from '../lib/constants'

/**
 * Autosave Engine class
 * Schedules and executes autosave operations
 */
export class AutosaveEngine {
  private timer: ReturnType<typeof setTimeout> | null = null
  private delay: number
  private flushFn: (() => Promise<void>) | null = null
  private isSaving: boolean = false

  /**
   * Constructor
   * @param flushFn - Function to call when autosave should execute
   * @param delay - Delay in milliseconds (default: 60s)
   */
  constructor(
    flushFn: () => Promise<void>,
    delay: number = AUTOSAVE.DELAY_MS
  ) {
    this.flushFn = flushFn
    this.delay = delay
  }

  /**
   * Schedule autosave
   * Cancels any pending autosave and schedules a new one
   */
  schedule(): void {
    this.cancel()

    if (!this.flushFn) {
      return
    }

    this.timer = setTimeout(() => {
      this.execute()
    }, this.delay)
  }

  /**
   * Force immediate autosave
   * Cancels pending autosave and executes immediately
   * @returns Promise that resolves when autosave completes
   */
  async force(): Promise<void> {
    this.cancel()
    return this.execute()
  }

  /**
   * Cancel pending autosave
   */
  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /**
   * Execute autosave
   * @returns Promise that resolves when autosave completes
   */
  private async execute(): Promise<void> {
    if (!this.flushFn || this.isSaving) {
      return
    }

    this.isSaving = true
    this.timer = null

    try {
      await this.flushFn()
    } catch (error) {
      console.error('Autosave failed:', error)
      // Optionally re-schedule on failure
      // this.schedule()
    } finally {
      this.isSaving = false
    }
  }

  /**
   * Check if autosave is currently saving
   * @returns True if saving is in progress
   */
  isSavingNow(): boolean {
    return this.isSaving
  }

  /**
   * Check if autosave is scheduled
   * @returns True if autosave is pending
   */
  isScheduled(): boolean {
    return this.timer !== null
  }

  /**
   * Update flush function
   * @param flushFn - New flush function
   */
  setFlushFn(flushFn: () => Promise<void>): void {
    this.flushFn = flushFn
  }

  /**
   * Update delay
   * @param delay - New delay in milliseconds
   */
  setDelay(delay: number): void {
    this.delay = delay
  }

  /**
   * Get current delay
   * @returns Delay in milliseconds
   */
  getDelay(): number {
    return this.delay
  }

  /**
   * Get time remaining until autosave
   * @returns Time in milliseconds or null if not scheduled
   */
  getTimeRemaining(): number | null {
    // Note: This is an approximation since we don't track exact start time
    // For accurate time remaining, we'd need to track when schedule() was called
    return this.isScheduled() ? this.delay : null
  }
}
