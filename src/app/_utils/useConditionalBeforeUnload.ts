import { useEffect } from 'react'

export function useConditionalBeforeUnload(condition: boolean, callback: () => void) {
  useEffect(() => {
    if (condition) {
      window.addEventListener('beforeunload', callback)
    }

    return () => window.removeEventListener('beforeunload', callback)
  }, [condition, callback])
}
