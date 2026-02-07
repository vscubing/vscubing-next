'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DojoSolve } from './calculate-stats'

const STORAGE_KEY = 'dojo-session'
const CURRENT_VERSION = 1

type SessionState = {
  solves: DojoSolve[]
  solveIdCounter: number
}

type VersionedStorage = {
  version: number
  data: SessionState
}

// Migration functions: each migrates from version N to N+1
type MigrationFn = (data: unknown) => unknown

const migrations: Record<number, MigrationFn> = {
  // Add migrations here as needed, e.g.:
  // 1: (data) => ({ ...data, newField: 'default' }),
}

function migrateData(stored: VersionedStorage): SessionState {
  let { version } = stored
  let data: unknown = stored.data

  // Apply migrations sequentially
  while (version < CURRENT_VERSION) {
    const migration = migrations[version]
    if (migration) {
      data = migration(data)
    }
    version++
  }

  return data as SessionState
}

function loadSession(): SessionState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as VersionedStorage
    if (typeof parsed.version !== 'number' || !parsed.data) return null
    return migrateData(parsed)
  } catch {
    return null
  }
}

function saveSession(state: SessionState) {
  if (typeof window === 'undefined') return
  try {
    const versioned: VersionedStorage = {
      version: CURRENT_VERSION,
      data: state,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versioned))
  } catch {
    // Ignore storage errors
  }
}

export function usePersistedSession() {
  const [solves, setSolves] = useState<DojoSolve[]>([])
  const [solveIdCounter, setSolveIdCounter] = useState(1)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored) {
      setSolves(stored.solves)
      setSolveIdCounter(stored.solveIdCounter)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isHydrated) return
    saveSession({ solves, solveIdCounter })
  }, [solves, solveIdCounter, isHydrated])

  const addSolve = useCallback(
    (solve: Omit<DojoSolve, 'id'>) => {
      setSolves((prev) => [{ ...solve, id: solveIdCounter }, ...prev])
      setSolveIdCounter((prev) => prev + 1)
    },
    [solveIdCounter],
  )

  const deleteSolve = useCallback((id: number) => {
    setSolves((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const clearSession = useCallback(() => {
    setSolves([])
    setSolveIdCounter(1)
  }, [])

  return {
    solves,
    isHydrated,
    addSolve,
    deleteSolve,
    clearSession,
  }
}
