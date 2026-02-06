/**
 * Autosave Hook
 * React hook for autosave state and controls
 */

import { useState, useEffect, useCallback } from 'react'
import { autosaveStore } from '../state/autosave.store'
import type { AutosaveStatus } from '../state/autosave.store'

/**
 * Autosave store state type
 */
interface AutosaveStoreState {
  status: AutosaveStatus
  lastSaved: Date | null
  error: string | null
  dirtyCount: number
}

/**
 * Use autosave hook
 * Returns autosave state and controls
 */
export function useAutosave() {
  const [state, setState] = useState<AutosaveStoreState>(() =>
    autosaveStore.getState()
  )

  useEffect(() => {
    const unsubscribe = autosaveStore.subscribe(() => {
      setState(autosaveStore.getState())
    })

    return unsubscribe
  }, [])

  const triggerAutosave = useCallback(() => {
    autosaveStore.triggerAutosave()
  }, [])

  const forceSave = useCallback(() => {
    return autosaveStore.forceSave()
  }, [])

  const cancelAutosave = useCallback(() => {
    autosaveStore.cancelAutosave()
  }, [])

  const getTimeRemaining = useCallback(() => {
    return autosaveStore.getTimeRemaining()
  }, [])

  const isSaving = useCallback(() => {
    return autosaveStore.isSaving()
  }, [])

  const isScheduled = useCallback(() => {
    return autosaveStore.isScheduled()
  }, [])

  const clearError = useCallback(() => {
    autosaveStore.clearError()
  }, [])

  // Get autosave engine for direct access if needed
  const getAutosaveEngine = useCallback(() => {
    return autosaveStore.getAutosaveEngine()
  }, [])

  return {
    ...state,
    triggerAutosave,
    forceSave,
    cancelAutosave,
    getTimeRemaining,
    isSaving: isSaving(),
    isScheduled: isScheduled(),
    clearError,
    getAutosaveEngine,
  }
}
