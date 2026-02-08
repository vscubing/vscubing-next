'use client'

import { atom, useAtomValue, useSetAtom } from 'jotai'

export const dojoFocusModeAtom = atom(false)

export function useDojoFocusMode() {
  return useAtomValue(dojoFocusModeAtom)
}

export function useSetDojoFocusMode() {
  return useSetAtom(dojoFocusModeAtom)
}
