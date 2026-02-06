/**
 * Autosave Store
 * Manages autosave state and integrates with AutosaveEngine and DirtyEngine
 */

import { AutosaveEngine } from '../engines/autosave.engine'
import { recordStore } from './record.store'

/**
 * Autosave Status
 */
export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Autosave Store State
 */
interface AutosaveStoreState {
  status: AutosaveStatus
  lastSaved: Date | null
  error: string | null
  dirtyCount: number
}

class AutosaveStore {
  private state: AutosaveStoreState = {
    status: 'idle',
    lastSaved: null,
    error: null,
    dirtyCount: 0,
  }

  private autosaveEngine: AutosaveEngine
  private listeners: Set<() => void> = new Set()

  constructor() {
    // Initialize autosave engine with flush function
    this.autosaveEngine = new AutosaveEngine(() => this.flushDirtyRecords())

    // Subscribe to record store to track dirty count
    recordStore.subscribe(() => {
      this.updateDirtyCount()
    })
  }

  /**
   * Get current state
   */
  getState(): AutosaveStoreState {
    return { ...this.state }
  }

  /**
   * Get autosave engine instance
   */
  getAutosaveEngine(): AutosaveEngine {
    return this.autosaveEngine
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * Update state
   */
  private setState(updates: Partial<AutosaveStoreState>): void {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  /**
   * Update dirty count from record store
   */
  private updateDirtyCount(): void {
    const dirtyEngine = recordStore.getDirtyEngine()
    const dirtyCount = dirtyEngine.getDirtyCount()
    this.setState({ dirtyCount })
  }

  /**
   * Flush dirty records (called by autosave engine)
   */
  private async flushDirtyRecords(): Promise<void> {
    const dirtyEngine = recordStore.getDirtyEngine()

    if (!dirtyEngine.hasDirty()) {
      this.setState({ status: 'idle' })
      return
    }

    this.setState({ status: 'saving', error: null })

    try {
      const dirtyRecords = dirtyEngine.getDirtyRecords()

      if (dirtyRecords.length === 0) {
        this.setState({ status: 'idle' })
        return
      }

      // Update records via record store
      await recordStore.updateRecords(dirtyRecords)

      this.setState({
        status: 'saved',
        lastSaved: new Date(),
        error: null,
      })

      // Reset to idle after a short delay
      setTimeout(() => {
        if (this.state.status === 'saved') {
          this.setState({ status: 'idle' })
        }
      }, 2000)
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Autosave failed'

      this.setState({
        status: 'error',
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Trigger autosave (schedule it)
   */
  triggerAutosave(): void {
    const dirtyEngine = recordStore.getDirtyEngine()

    if (!dirtyEngine.hasDirty()) {
      this.setState({ status: 'idle' })
      return
    }

    this.setState({ status: 'pending' })
    this.autosaveEngine.schedule()
  }

  /**
   * Force immediate save
   */
  async forceSave(): Promise<void> {
    const dirtyEngine = recordStore.getDirtyEngine()

    if (!dirtyEngine.hasDirty()) {
      this.setState({ status: 'idle' })
      return
    }

    this.setState({ status: 'saving', error: null })
    await this.autosaveEngine.force()
  }

  /**
   * Cancel pending autosave
   */
  cancelAutosave(): void {
    this.autosaveEngine.cancel()
    this.setState({ status: 'idle' })
  }

  /**
   * Get autosave status
   */
  getAutosaveStatus(): AutosaveStatus {
    return this.state.status
  }

  /**
   * Get time remaining until autosave
   */
  getTimeRemaining(): number | null {
    return this.autosaveEngine.getTimeRemaining()
  }

  /**
   * Check if autosave is currently saving
   */
  isSaving(): boolean {
    return this.state.status === 'saving' || this.autosaveEngine.isSavingNow()
  }

  /**
   * Check if autosave is scheduled
   */
  isScheduled(): boolean {
    return this.autosaveEngine.isScheduled()
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null })
  }
}

/**
 * Autosave Store instance
 */
export const autosaveStore = new AutosaveStore()
